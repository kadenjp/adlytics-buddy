import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/providers/stripe/StripeProvider';
import { supabaseSubscriptionDatabase } from '@/lib/providers/supabase/SupabaseSubscriptionDatabaseProvider';
import { ISubscriptionDatabase } from '@/lib/interfaces/ISubscriptionDatabase';
import Stripe from 'stripe';
import { createLogger } from '@/lib/providers/logger';

const logger = createLogger('StripeWebhookAPI');

// Use injected subscription database provider
const subscriptionDb: ISubscriptionDatabase = supabaseSubscriptionDatabase;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe is not configured' },
            { status: 500 }
        );
    }

    if (!webhookSecret) {
        return NextResponse.json(
            { error: 'Webhook secret is not configured' },
            { status: 500 }
        );
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error('Webhook signature verification failed', { error: errorMessage, hasSignature: !!signature });
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                logger.stripeEvent('customer.subscription.created', event.id);
                await handleSubscriptionCreated(subscription);
                break;
            }

            case 'customer.subscription.updated': {
                const updatedSubscription = event.data.object as Stripe.Subscription;
                logger.stripeEvent('customer.subscription.updated', event.id);
                await handleSubscriptionUpdated(updatedSubscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const deletedSubscription = event.data.object as Stripe.Subscription;
                logger.stripeEvent('customer.subscription.deleted', event.id);
                await handleSubscriptionDeleted(deletedSubscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                logger.stripeEvent('invoice.payment_succeeded', event.id);
                await handlePaymentSucceeded(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const failedInvoice = event.data.object as Stripe.Invoice;
                logger.stripeEvent('invoice.payment_failed', event.id);
                await handlePaymentFailed(failedInvoice);
                break;
            }

            default:
                logger.warn(`Unhandled Stripe event type: ${event.type}`, { eventId: event.id, eventType: event.type });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        logger.error('Webhook handler error', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    await subscriptionDb.upsertSubscription({
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        amount: subscription.items.data[0]?.price?.unit_amount || 15000,
        user_id: subscription.customer as string,
    });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await subscriptionDb.updateSubscriptionStatus(subscription.id, subscription.status);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await subscriptionDb.updateSubscriptionStatus(subscription.id, 'canceled');
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    await subscriptionDb.handlePaymentSucceeded(invoice.customer as string, invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    await subscriptionDb.handlePaymentFailed(invoice.customer as string, invoice.id);
}
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/providers/StripeProvider';
import { supabaseSubscriptionDatabase } from '@/lib/providers/SupabaseSubscriptionDatabaseProvider';
import { ISubscriptionDatabase } from '@/lib/interfaces/ISubscriptionDatabase';
import Stripe from 'stripe';

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
        console.error('Webhook signature verification failed:', errorMessage);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCreated(subscription);
                break;
            }

            case 'customer.subscription.updated': {
                const updatedSubscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(updatedSubscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const deletedSubscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(deletedSubscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const failedInvoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(failedInvoice);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
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
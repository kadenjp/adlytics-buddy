import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/lib/constants';
import Stripe from 'stripe';

// Only create Supabase client if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

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
    if (!supabase) {
        console.warn('Supabase is not configured');
        return;
    }

    // Create or update subscription record
    const { error } = await supabase
        .from('subscriptions')
        .upsert({
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            amount: subscription.items.data[0]?.price?.unit_amount || 15000, // Default to $150
            // Note: We'll need to map the customer ID to user_id through a separate lookup
            // For now, we're using the Stripe customer ID directly - this will need to be fixed
            user_id: subscription.customer as string,
        })
        .eq('stripe_subscription_id', subscription.id);

    if (error) {
        console.error('Failed to create/update subscription:', error);
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    if (!supabase) {
        console.warn('Supabase is not configured');
        return;
    }

    const customerId = subscription.customer as string;

    await supabase
        .from('subscriptions')
        .update({
            status: subscription.status,
        })
        .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    if (!supabase) {
        console.warn('Supabase is not configured');
        return;
    }

    const customerId = subscription.customer as string;

    await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
        })
        .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!supabase) {
        console.warn('Supabase is not configured');
        return;
    }

    // For invoice.payment_succeeded, we can update based on customer ID
    // The subscription will be updated separately via subscription events
    const customerId = invoice.customer as string;
    
    console.log(`Payment succeeded for customer: ${customerId}, invoice: ${invoice.id}`);
    
    // You could add additional logic here like:
    // - Sending payment confirmation emails
    // - Updating usage quotas
    // - Triggering other business logic
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    // Handle failed payment (e.g., send notification, update status)
    console.log(`Payment failed for customer: ${customerId}`);
}
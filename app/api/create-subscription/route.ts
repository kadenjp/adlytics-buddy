import { NextRequest, NextResponse } from 'next/server';
import { createStripeCustomer, createSubscription } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    try {
        const { email, name, paymentMethodId, address } = await req.json();

        if (!email || !name || !paymentMethodId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create Stripe customer with address
        const customer = await createStripeCustomer(email, name, address);

        // Create subscription
        const subscription = await createSubscription(customer.id, paymentMethodId);

        // Handle the expanded payment_intent properly
        const invoice = subscription.latest_invoice as Stripe.Invoice & {
            payment_intent?: Stripe.PaymentIntent;
        };
        const clientSecret = invoice?.payment_intent?.client_secret || null;

        return NextResponse.json({
            customerId: customer.id,
            subscriptionId: subscription.id,
            clientSecret,
            status: subscription.status,
        });
    } catch (error: unknown) {
        console.error('Stripe subscription error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

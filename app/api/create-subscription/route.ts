import { NextRequest, NextResponse } from 'next/server';
import { createSubscription, generateStripeIdempotencyKey } from '@/lib/providers/stripe/StripeProvider';
import { findOrCreateCustomerWithPayment } from '@/lib/repositories/CustomerRepo';

import { supabaseBusinessDatabase } from '@/lib/providers/supabase/SupabaseBusinessDatabaseProvider';
import Stripe from 'stripe';
import { stripePaymentProvider } from '@/lib/providers/stripe/StripePaymentProvider';
import { createLogger } from '@/lib/providers/logger';

const logger = createLogger('CreateSubscriptionAPI');

export async function POST(req: NextRequest) {
    try {
        const { email, name, paymentMethodId, address, businessId } = await req.json();

        if (!email || !name || !paymentMethodId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create idempotency key based on email to prevent duplicate customers
        const idempotencyKey = generateStripeIdempotencyKey(email, 'customer');

        // Create or find existing Stripe customer with database check using injected providers
        const customer = await findOrCreateCustomerWithPayment(
            supabaseBusinessDatabase,
            stripePaymentProvider,
            email,
            name,
            businessId,
            address,
            idempotencyKey
        );

        // Create subscription
        const subscription = await createSubscription(customer.id as string, paymentMethodId);

        // Handle the expanded payment_intent properly
        const invoice = subscription.latest_invoice as Stripe.Invoice & {
            payment_intent?: Stripe.PaymentIntent;
        };
        const clientSecret = invoice?.payment_intent?.client_secret || null;

        return NextResponse.json({
            customerId: customer.id as string,
            subscriptionId: subscription.id,
            clientSecret,
            status: subscription.status,
        });
    } catch (error: unknown) {
        logger.apiError('POST', '/api/create-subscription', error instanceof Error ? error : new Error('Unknown error'), 500);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

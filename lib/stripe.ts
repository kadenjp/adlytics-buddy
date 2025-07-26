import Stripe from 'stripe';
import { STRIPE_CONFIG } from './constants';

// Handle missing environment variables during build
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey && process.env.NODE_ENV !== 'development') {
    console.warn('STRIPE_SECRET_KEY is not defined. Stripe functionality will not work.');
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
    apiVersion: '2025-06-30.basil',
}) : null;

export const STRIPE_PRICE_ID = STRIPE_CONFIG.PRICE_ID;

export async function createStripeCustomer(email: string, name: string) {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }
    return stripe.customers.create({
        email,
        name,
    });
}

export async function createSubscription(
    customerId: string,
    paymentMethodId: string,
    priceId: string = STRIPE_PRICE_ID
) {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    });

    // Create subscription
    return stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
    });
}

import Stripe from 'stripe';
// Removed supabase import; now handled in repository layer
// Add Stripe.AddressParam type for address
import { STRIPE_CONFIG } from '../../constants';

// Handle missing environment variables during build
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey && process.env.NODE_ENV !== 'development') {
    console.warn('STRIPE_SECRET_KEY is not defined. Stripe functionality will not work.');
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
    apiVersion: '2025-06-30.basil',
}) : null;

export const STRIPE_PRICE_ID = STRIPE_CONFIG.PRICE_ID;

/**
 * Generate a deterministic idempotency key for Stripe operations
 * This ensures that if the same request is made multiple times, it won't create duplicates
 */
export function generateStripeIdempotencyKey(email: string, operation: string): string {
    const cleanEmail = email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Math.floor(Date.now() / 1000); // Use seconds for longer validity
    return `${operation}_${cleanEmail}_${timestamp}`;
}

// Removed: getExistingStripeCustomerFromDB. Use stripeRepository.ts instead.

// Removed: findOrCreateStripeCustomerWithDB. Use stripeRepository.ts instead.

export async function findOrCreateStripeCustomer(
    email: string,
    name: string,
    address?: Stripe.AddressParam,
    idempotencyKey?: string
): Promise<Stripe.Customer> {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    // First, search for existing customer by email
    const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
    });

    if (existingCustomers.data.length > 0) {
        const existingCustomer = existingCustomers.data[0];

        // Update customer info if needed (name or address might have changed)
        const updateData: Stripe.CustomerUpdateParams = {};
        if (name && existingCustomer.name !== name) {
            updateData.name = name;
        }
        if (address && JSON.stringify(existingCustomer.address) !== JSON.stringify(address)) {
            updateData.address = address;
        }

        if (Object.keys(updateData).length > 0) {
            return stripe.customers.update(existingCustomer.id, updateData);
        }

        return existingCustomer;
    }

    // Create new customer if none exists
    const createOptions: Stripe.CustomerCreateParams = {
        email,
        name,
        address,
    };

    // Add idempotency key if provided to prevent duplicate creation
    const requestOptions: Stripe.RequestOptions = {};
    if (idempotencyKey) {
        requestOptions.idempotencyKey = idempotencyKey;
    }

    return stripe.customers.create(createOptions, requestOptions);
}

export async function createStripeCustomer(
    email: string,
    name: string,
    address?: Stripe.AddressParam,
    idempotencyKey?: string
): Promise<Stripe.Customer> {
    // Legacy function - now calls the improved version
    return findOrCreateStripeCustomer(email, name, address, idempotencyKey);
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
        // Enable automatic tax only in production
        automatic_tax: { enabled: process.env.NODE_ENV === 'production' },
    });
}

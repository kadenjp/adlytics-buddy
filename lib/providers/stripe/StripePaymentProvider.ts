import { IPaymentProvider } from '../../interfaces/IPaymentProvider';
import { stripe } from './StripeProvider';

export const stripePaymentProvider: IPaymentProvider = {
    async findOrCreateCustomer({ email, name, address, idempotencyKey }) {
        // Use your findOrCreateStripeCustomer from StripeProvider
        const customer = stripe ? await import('./StripeProvider').then(m => m.findOrCreateStripeCustomer(email, name, address, idempotencyKey)) : null;
        return customer as unknown as { id: string;[key: string]: unknown } | null;
    },
    async retrieveCustomer(customerId: string) {
        if (!stripe) throw new Error('Stripe is not configured');
        const customer = await stripe.customers.retrieve(customerId);
        return customer as unknown as { id: string;[key: string]: unknown } | null;
    }
};

import { IPaymentProvider } from '../interfaces/interfaces';
import { stripe } from '../stripe';


export const stripePaymentProvider: IPaymentProvider = {
    async findOrCreateCustomer({ email, name, address, idempotencyKey }) {
        // Use your findOrCreateStripeCustomer from stripe.ts
        // @ts-ignore
        return stripe ? await import('../stripe').then(m => m.findOrCreateStripeCustomer(email, name, address, idempotencyKey)) : null;
    },
    async retrieveCustomer(customerId: string) {
        if (!stripe) throw new Error('Stripe is not configured');
        return stripe.customers.retrieve(customerId);
    }
};

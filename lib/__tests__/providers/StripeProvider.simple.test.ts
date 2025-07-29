import { generateStripeIdempotencyKey, STRIPE_PRICE_ID } from '../../providers/stripe/StripeProvider';

describe('StripeProvider', () => {
    describe('generateStripeIdempotencyKey', () => {
        it('should generate consistent idempotency key for same inputs', () => {
            const email = 'test@example.com';
            const operation = 'create_customer';

            const key1 = generateStripeIdempotencyKey(email, operation);
            const key2 = generateStripeIdempotencyKey(email, operation);

            // Keys should be the same for the same timestamp
            expect(key1).toBe(key2);
        });

        it('should handle special characters in email', () => {
            const email = 'test+user@example.com';
            const operation = 'create_customer';

            const key = generateStripeIdempotencyKey(email, operation);

            expect(key).toMatch(/^create_customer_test_user_example_com_\d+$/);
        });

        it('should be case insensitive', () => {
            const email1 = 'Test@Example.com';
            const email2 = 'test@example.com';
            const operation = 'create_customer';

            const key1 = generateStripeIdempotencyKey(email1, operation);
            const key2 = generateStripeIdempotencyKey(email2, operation);

            expect(key1).toBe(key2);
        });

        it('should include timestamp in key', () => {
            const email = 'test@example.com';
            const operation = 'create_customer';

            const key = generateStripeIdempotencyKey(email, operation);

            expect(key).toMatch(/\d+$/); // Should end with timestamp
        });
    });

    describe('STRIPE_PRICE_ID', () => {
        it('should export the correct price ID from constants', () => {
            expect(STRIPE_PRICE_ID).toBe('price_1RpHGXEKdF0kpDHEhzDcOouD');
        });
    });
});

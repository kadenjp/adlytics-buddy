import {
    generateStripeIdempotencyKey,
    findOrCreateStripeCustomer,
    createSubscription,
    STRIPE_PRICE_ID,
} from '../../providers/stripe/StripeProvider';

// Create mock functions first
const mockCustomersCreate = jest.fn();
const mockCustomersUpdate = jest.fn();
const mockCustomersList = jest.fn();
const mockPaymentMethodsAttach = jest.fn();
const mockSubscriptionsCreate = jest.fn();

// Mock Stripe at module level
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        customers: {
            list: mockCustomersList,
            create: mockCustomersCreate,
            update: mockCustomersUpdate,
        },
        paymentMethods: {
            attach: mockPaymentMethodsAttach,
        },
        subscriptions: {
            create: mockSubscriptionsCreate,
        },
    }));
});

describe('StripeProvider', () => {
    // Mock environment variable for tests
    const originalStripeSecretKey = process.env.STRIPE_SECRET_KEY;

    beforeAll(() => {
        process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
    });

    afterAll(() => {
        process.env.STRIPE_SECRET_KEY = originalStripeSecretKey;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

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

    describe('findOrCreateStripeCustomer', () => {
        it('should return existing customer if found', async () => {
            const existingCustomer = {
                id: 'cus_existing',
                email: 'test@example.com',
                name: 'John Doe',
                address: null,
            };

            mockCustomersList.mockResolvedValue({
                data: [existingCustomer],
            });

            const result = await findOrCreateStripeCustomer('test@example.com', 'John Doe');

            expect(result).toEqual(existingCustomer);
            expect(mockCustomersList).toHaveBeenCalledWith({
                email: 'test@example.com',
                limit: 1,
            });
            expect(mockCustomersCreate).not.toHaveBeenCalled();
        });

        it('should update existing customer if name or address changed', async () => {
            const existingCustomer = {
                id: 'cus_existing',
                email: 'test@example.com',
                name: 'Old Name',
                address: null,
            };

            const updatedCustomer = {
                ...existingCustomer,
                name: 'New Name',
            };

            mockCustomersList.mockResolvedValue({
                data: [existingCustomer],
            });

            mockCustomersUpdate.mockResolvedValue(updatedCustomer);

            const result = await findOrCreateStripeCustomer('test@example.com', 'New Name');

            expect(result).toEqual(updatedCustomer);
            expect(mockCustomersUpdate).toHaveBeenCalledWith('cus_existing', {
                name: 'New Name',
            });
        });

        it('should create new customer if none exists', async () => {
            const newCustomer = {
                id: 'cus_new',
                email: 'test@example.com',
                name: 'John Doe',
            };

            mockCustomersList.mockResolvedValue({
                data: [],
            });

            mockCustomersCreate.mockResolvedValue(newCustomer);

            const result = await findOrCreateStripeCustomer('test@example.com', 'John Doe');

            expect(result).toEqual(newCustomer);
            expect(mockCustomersCreate).toHaveBeenCalledWith(
                {
                    email: 'test@example.com',
                    name: 'John Doe',
                    address: undefined,
                },
                {}
            );
        });

        it('should create new customer with address', async () => {
            const address = {
                line1: '123 Test St',
                city: 'Test City',
                state: 'TS',
                postal_code: '12345',
                country: 'US',
            };

            const newCustomer = {
                id: 'cus_new',
                email: 'test@example.com',
                name: 'John Doe',
                address,
            };

            mockCustomersList.mockResolvedValue({
                data: [],
            });

            mockCustomersCreate.mockResolvedValue(newCustomer);

            const result = await findOrCreateStripeCustomer('test@example.com', 'John Doe', address);

            expect(result).toEqual(newCustomer);
            expect(mockCustomersCreate).toHaveBeenCalledWith(
                {
                    email: 'test@example.com',
                    name: 'John Doe',
                    address,
                },
                {}
            );
        });

        it('should use idempotency key when provided', async () => {
            const newCustomer = {
                id: 'cus_new',
                email: 'test@example.com',
                name: 'John Doe',
            };

            mockCustomersList.mockResolvedValue({
                data: [],
            });

            mockCustomersCreate.mockResolvedValue(newCustomer);

            const idempotencyKey = 'test_key_123';
            await findOrCreateStripeCustomer('test@example.com', 'John Doe', undefined, idempotencyKey);

            expect(mockCustomersCreate).toHaveBeenCalledWith(
                {
                    email: 'test@example.com',
                    name: 'John Doe',
                    address: undefined,
                },
                { idempotencyKey }
            );
        });
    });

    describe('createSubscription', () => {
        const customerId = 'cus_test';
        const paymentMethodId = 'pm_test';

        it('should create subscription with default price', async () => {
            const mockSubscription = {
                id: 'sub_test',
                customer: customerId,
                items: [{ price: STRIPE_PRICE_ID }],
            };

            mockPaymentMethodsAttach.mockResolvedValue({});
            mockCustomersUpdate.mockResolvedValue({});
            mockSubscriptionsCreate.mockResolvedValue(mockSubscription);

            const result = await createSubscription(customerId, paymentMethodId);

            expect(mockPaymentMethodsAttach).toHaveBeenCalledWith(paymentMethodId, {
                customer: customerId,
            });

            expect(mockCustomersUpdate).toHaveBeenCalledWith(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            expect(mockSubscriptionsCreate).toHaveBeenCalledWith({
                customer: customerId,
                items: [{ price: STRIPE_PRICE_ID }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
                automatic_tax: { enabled: false }, // test environment
            });

            expect(result).toEqual(mockSubscription);
        });

        it('should create subscription with custom price', async () => {
            const customPriceId = 'price_custom';
            const mockSubscription = {
                id: 'sub_test',
                customer: customerId,
                items: [{ price: customPriceId }],
            };

            mockPaymentMethodsAttach.mockResolvedValue({});
            mockCustomersUpdate.mockResolvedValue({});
            mockSubscriptionsCreate.mockResolvedValue(mockSubscription);

            const result = await createSubscription(customerId, paymentMethodId, customPriceId);

            expect(mockSubscriptionsCreate).toHaveBeenCalledWith({
                customer: customerId,
                items: [{ price: customPriceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
                automatic_tax: { enabled: false },
            });

            expect(result).toEqual(mockSubscription);
        });

        it('should handle errors during subscription creation', async () => {
            const error = new Error('Subscription creation failed');

            mockPaymentMethodsAttach.mockResolvedValue({});
            mockCustomersUpdate.mockResolvedValue({});
            mockSubscriptionsCreate.mockRejectedValue(error);

            await expect(createSubscription(customerId, paymentMethodId)).rejects.toThrow('Subscription creation failed');
        });

        it('should handle errors during payment method attachment', async () => {
            const error = new Error('Payment method attachment failed');

            mockPaymentMethodsAttach.mockRejectedValue(error);

            await expect(createSubscription(customerId, paymentMethodId)).rejects.toThrow('Payment method attachment failed');
        });
    });
});

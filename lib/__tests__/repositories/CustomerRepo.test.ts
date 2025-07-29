import { findOrCreateCustomerWithPayment } from '../../repositories/CustomerRepo';
import { IPaymentProvider } from '../../interfaces/IPaymentProvider';
import { IBusinessDatabase } from '../../interfaces/IBusinessDatabase';

describe('CustomerRepo', () => {
    let mockBusinessDb: jest.Mocked<IBusinessDatabase>;
    let mockPaymentProvider: jest.Mocked<IPaymentProvider>;

    beforeEach(() => {
        mockBusinessDb = {
            getBusinessById: jest.fn(),
            getBusinessByEmail: jest.fn(),
            updateBusinessStripeCustomerId: jest.fn(),
        };

        mockPaymentProvider = {
            findOrCreateCustomer: jest.fn(),
            retrieveCustomer: jest.fn(),
        };
    });

    describe('findOrCreateCustomerWithPayment', () => {
        it('should return existing customer if business has valid stripe_customer_id', async () => {
            const businessId = 'biz_123';
            const email = 'test@example.com';
            const name = 'Test Business';

            const existingBusiness = {
                id: businessId,
                email,
                stripe_customer_id: 'cus_existing',
                name,
            };

            const existingCustomer = {
                id: 'cus_existing',
                email,
                name,
                deleted: false,
            };

            mockBusinessDb.getBusinessById.mockResolvedValue(existingBusiness);
            mockPaymentProvider.retrieveCustomer.mockResolvedValue(existingCustomer);

            const result = await findOrCreateCustomerWithPayment(
                mockBusinessDb,
                mockPaymentProvider,
                email,
                name,
                businessId
            );

            expect(result).toEqual(existingCustomer);
            expect(mockBusinessDb.getBusinessById).toHaveBeenCalledWith(businessId);
            expect(mockPaymentProvider.retrieveCustomer).toHaveBeenCalledWith('cus_existing');
            expect(mockPaymentProvider.findOrCreateCustomer).not.toHaveBeenCalled();
        });

        it('should create new customer if existing customer is deleted', async () => {
            const businessId = 'biz_123';
            const email = 'test@example.com';
            const name = 'Test Business';

            const existingBusiness = {
                id: businessId,
                email,
                stripe_customer_id: 'cus_deleted',
                name,
            };

            const deletedCustomer = {
                id: 'cus_deleted',
                email,
                name,
                deleted: true,
            };

            const newCustomer = {
                id: 'cus_new',
                email,
                name,
            };

            mockBusinessDb.getBusinessById.mockResolvedValue(existingBusiness);
            mockPaymentProvider.retrieveCustomer.mockResolvedValue(deletedCustomer);
            mockPaymentProvider.findOrCreateCustomer.mockResolvedValue(newCustomer);

            const result = await findOrCreateCustomerWithPayment(
                mockBusinessDb,
                mockPaymentProvider,
                email,
                name,
                businessId
            );

            expect(result).toEqual(newCustomer);
            expect(mockPaymentProvider.findOrCreateCustomer).toHaveBeenCalledWith({
                email,
                name,
                address: undefined,
                idempotencyKey: undefined,
            });
            expect(mockBusinessDb.updateBusinessStripeCustomerId).toHaveBeenCalledWith(businessId, 'cus_new');
        });

        it('should create new customer if business has no stripe_customer_id', async () => {
            const businessId = 'biz_123';
            const email = 'test@example.com';
            const name = 'Test Business';

            const existingBusiness = {
                id: businessId,
                email,
                stripe_customer_id: null,
                name,
            };

            const newCustomer = {
                id: 'cus_new',
                email,
                name,
            };

            mockBusinessDb.getBusinessById.mockResolvedValue(existingBusiness);
            mockPaymentProvider.findOrCreateCustomer.mockResolvedValue(newCustomer);

            const result = await findOrCreateCustomerWithPayment(
                mockBusinessDb,
                mockPaymentProvider,
                email,
                name,
                businessId
            );

            expect(result).toEqual(newCustomer);
            expect(mockPaymentProvider.retrieveCustomer).not.toHaveBeenCalled();
            expect(mockPaymentProvider.findOrCreateCustomer).toHaveBeenCalledWith({
                email,
                name,
                address: undefined,
                idempotencyKey: undefined,
            });
            expect(mockBusinessDb.updateBusinessStripeCustomerId).toHaveBeenCalledWith(businessId, 'cus_new');
        });

        it('should find business by email when no businessId provided', async () => {
            const email = 'test@example.com';
            const name = 'Test Business';

            const existingBusiness = {
                id: 'biz_123',
                email,
                stripe_customer_id: 'cus_existing',
                name,
            };

            const existingCustomer = {
                id: 'cus_existing',
                email,
                name,
                deleted: false,
            };

            mockBusinessDb.getBusinessByEmail.mockResolvedValue(existingBusiness);
            mockPaymentProvider.retrieveCustomer.mockResolvedValue(existingCustomer);

            const result = await findOrCreateCustomerWithPayment(
                mockBusinessDb,
                mockPaymentProvider,
                email,
                name
            );

            expect(result).toEqual(existingCustomer);
            expect(mockBusinessDb.getBusinessByEmail).toHaveBeenCalledWith(email);
            expect(mockBusinessDb.getBusinessById).not.toHaveBeenCalled();
        });

        it('should create customer with address and idempotency key', async () => {
            const email = 'test@example.com';
            const name = 'Test Business';
            const address = {
                line1: '123 Test St',
                city: 'Test City',
                state: 'TS',
                postal_code: '12345',
                country: 'US',
            };
            const idempotencyKey = 'test_key_123';

            const newCustomer = {
                id: 'cus_new',
                email,
                name,
                address,
            };

            mockBusinessDb.getBusinessByEmail.mockResolvedValue(null);
            mockPaymentProvider.findOrCreateCustomer.mockResolvedValue(newCustomer);

            const result = await findOrCreateCustomerWithPayment(
                mockBusinessDb,
                mockPaymentProvider,
                email,
                name,
                undefined,
                address,
                idempotencyKey
            );

            expect(result).toEqual(newCustomer);
            expect(mockPaymentProvider.findOrCreateCustomer).toHaveBeenCalledWith({
                email,
                name,
                address,
                idempotencyKey,
            });
        });

        it('should handle case when business is not found', async () => {
            const email = 'test@example.com';
            const name = 'Test Business';

            const newCustomer = {
                id: 'cus_new',
                email,
                name,
            };

            mockBusinessDb.getBusinessByEmail.mockResolvedValue(null);
            mockPaymentProvider.findOrCreateCustomer.mockResolvedValue(newCustomer);

            const result = await findOrCreateCustomerWithPayment(
                mockBusinessDb,
                mockPaymentProvider,
                email,
                name
            );

            expect(result).toEqual(newCustomer);
            expect(mockPaymentProvider.findOrCreateCustomer).toHaveBeenCalledWith({
                email,
                name,
                address: undefined,
                idempotencyKey: undefined,
            });
            expect(mockBusinessDb.updateBusinessStripeCustomerId).not.toHaveBeenCalled();
        });

        it('should handle payment provider errors', async () => {
            const email = 'test@example.com';
            const name = 'Test Business';

            mockBusinessDb.getBusinessByEmail.mockResolvedValue(null);
            mockPaymentProvider.findOrCreateCustomer.mockRejectedValue(new Error('Payment provider error'));

            await expect(
                findOrCreateCustomerWithPayment(
                    mockBusinessDb,
                    mockPaymentProvider,
                    email,
                    name
                )
            ).rejects.toThrow('Payment provider error');
        });

        it('should handle database errors', async () => {
            const email = 'test@example.com';
            const name = 'Test Business';

            mockBusinessDb.getBusinessByEmail.mockRejectedValue(new Error('Database error'));

            await expect(
                findOrCreateCustomerWithPayment(
                    mockBusinessDb,
                    mockPaymentProvider,
                    email,
                    name
                )
            ).rejects.toThrow('Database error');
        });
    });
});

import { IPaymentProvider } from '../interfaces/IPaymentProvider';
import { IBusinessDatabase } from '../interfaces/IBusinessDatabase';

export async function findOrCreateCustomerWithPayment(
    db: IBusinessDatabase,
    payment: IPaymentProvider,
    email: string,
    name: string,
    businessId?: string,
    address?: Record<string, unknown>,
    idempotencyKey?: string
): Promise<{ id: string;[key: string]: unknown } | null> {
    const business = businessId
        ? await db.getBusinessById(businessId)
        : await db.getBusinessByEmail(email);

    if (business?.stripe_customer_id) {
        const customer = await payment.retrieveCustomer(business.stripe_customer_id);
        if (customer && !customer.deleted) return customer;
    }

    const customer = await payment.findOrCreateCustomer({ email, name, address, idempotencyKey });

    if (businessId && customer.id) {
        await db.updateBusinessStripeCustomerId(businessId, customer.id);
    }

    return customer;
}

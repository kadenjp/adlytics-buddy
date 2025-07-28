export interface IPaymentProvider {
    findOrCreateCustomer(params: { email: string; name: string; address?: Record<string, unknown>; idempotencyKey?: string }): Promise<{ id: string;[key: string]: unknown } | null>;
    retrieveCustomer(customerId: string): Promise<{ id: string;[key: string]: unknown } | null>;
}

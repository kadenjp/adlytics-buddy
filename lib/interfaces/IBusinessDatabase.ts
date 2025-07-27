export interface IBusinessDatabase {
    getBusinessByEmail(email: string): Promise<{ stripe_customer_id?: string } | null>;
    getBusinessById(id: string): Promise<{ stripe_customer_id?: string } | null>;
    updateBusinessStripeCustomerId(id: string, customerId: string): Promise<void>;
}

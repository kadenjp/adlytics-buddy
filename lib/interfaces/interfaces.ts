export interface IUserInformationDatabase {
    getUserInformation(userId: string): Promise<any>;
    upsertUserInformation(userId: string, data: any): Promise<any>;
    updateUserInformation(userId: string, updates: any): Promise<any>;
    deleteUserInformation(userId: string): Promise<void>;
}

export interface IBusinessProfileDatabase {
    getBusinessProfile(userId: string): Promise<any>;
    upsertBusinessProfile(userId: string, data: any): Promise<any>;
    updateBusinessProfile(userId: string, updates: any): Promise<void>;
    deleteBusinessProfile(userId: string): Promise<void>;
}
export interface ISubscriptionDatabase {
    upsertSubscription(params: {
        stripe_subscription_id: string;
        status: string;
        amount: number;
        user_id: string;
    }): Promise<void>;
    updateSubscriptionStatus(stripe_subscription_id: string, status: string): Promise<void>;
    handlePaymentSucceeded(customerId: string, invoiceId: string): Promise<void>;
    handlePaymentFailed(customerId: string, invoiceId: string): Promise<void>;
}
export interface IPaymentProvider {
    findOrCreateCustomer(params: { email: string; name: string; address?: any; idempotencyKey?: string }): Promise<any>;
    retrieveCustomer(customerId: string): Promise<any>;
}

export interface IBusinessDatabase {
    getBusinessByEmail(email: string): Promise<{ stripe_customer_id?: string } | null>;
    getBusinessById(id: string): Promise<{ stripe_customer_id?: string } | null>;
    updateBusinessStripeCustomerId(id: string, customerId: string): Promise<void>;
}

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

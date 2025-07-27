import { supabase } from '@/integrations/supabase/client';
import { ISubscriptionDatabase } from '../interfaces/ISubscriptionDatabase';

export const supabaseSubscriptionDatabase: ISubscriptionDatabase = {
    async upsertSubscription({ stripe_subscription_id, status, amount, user_id }) {
        await supabase
            .from('subscriptions')
            .upsert({
                stripe_subscription_id,
                status,
                amount,
                user_id,
            })
            .eq('stripe_subscription_id', stripe_subscription_id);
    },
    async updateSubscriptionStatus(stripe_subscription_id, status) {
        await supabase
            .from('subscriptions')
            .update({ status })
            .eq('stripe_subscription_id', stripe_subscription_id);
    },
    async handlePaymentSucceeded(customerId, invoiceId) {
        // Add custom logic for payment success if needed
        // For now, just log
        console.log(`Payment succeeded for customer: ${customerId}, invoice: ${invoiceId}`);
    },
    async handlePaymentFailed(customerId, invoiceId) {
        // Add custom logic for payment failure if needed
        // For now, just log
        console.log(`Payment failed for customer: ${customerId}, invoice: ${invoiceId}`);
    },
};

import { supabase } from '@/integrations/supabase/client';
import { IBusinessDatabase } from '../../interfaces/IBusinessDatabase';

export const supabaseBusinessDatabase: IBusinessDatabase = {
    async getBusinessByEmail(email: string) {
        const { data, error } = await supabase
            .from('businesses')
            .select('stripe_customer_id')
            .eq('name', email)
            .single();
        if (error) return null;
        return data;
    },
    async getBusinessById(id: string) {
        const { data, error } = await supabase
            .from('businesses')
            .select('stripe_customer_id')
            .eq('id', id)
            .single();
        if (error) return null;
        return data;
    },
    async updateBusinessStripeCustomerId(id: string, customerId: string) {
        await supabase
            .from('businesses')
            .update({ stripe_customer_id: customerId })
            .eq('id', id);
    }
};

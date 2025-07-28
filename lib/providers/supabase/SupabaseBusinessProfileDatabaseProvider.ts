import { supabase } from '@/integrations/supabase/client';
import { IBusinessProfileDatabase } from '../../interfaces/IBusinessProfileDatabase';

export const supabaseBusinessProfileDatabase: IBusinessProfileDatabase = {
    async getBusinessProfile(userId) {
        const { data, error } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) throw error;
        return data;
    },
    async upsertBusinessProfile(userId, data) {
        const upsertData = { user_id: userId, ...data };
        const { data: result, error } = await supabase
            .from('business_profiles')
            // eslint-disable-next-line
            .upsert(upsertData as any, { onConflict: 'user_id' })
            .select()
            .single();
        if (error) throw error;
        return result;
    },
    async updateBusinessProfile(userId, updates) {
        const { error } = await supabase
            .from('business_profiles')
            // eslint-disable-next-line
            .update(updates as any)
            .eq('user_id', userId);
        if (error) throw error;
    },
    async deleteBusinessProfile(userId) {
        await supabase
            .from('business_profiles')
            .delete()
            .eq('user_id', userId);
    }
};

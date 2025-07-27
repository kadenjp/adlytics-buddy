import { supabase } from '@/integrations/supabase/client';
import { IBusinessProfileDatabase } from '../interfaces/interfaces';

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
            .upsert(upsertData, { onConflict: 'user_id' })
            .select()
            .single();
        if (error) throw error;
        return result;
    },
    async updateBusinessProfile(userId, updates) {
        const { error } = await supabase
            .from('business_profiles')
            .update(updates)
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

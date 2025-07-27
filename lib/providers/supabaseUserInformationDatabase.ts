import { supabase } from '@/integrations/supabase/client';
import { IUserInformationDatabase } from '../interfaces/interfaces';

export const supabaseUserInformationDatabase: IUserInformationDatabase = {
    async getUserInformation(userId) {
        const { data, error } = await supabase
            .from('user_information')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) throw error;
        return data;
    },
    async upsertUserInformation(userId, data) {
        const upsertData = { user_id: userId, ...data };
        const { data: result, error } = await supabase
            .from('user_information')
            .upsert(upsertData, { onConflict: 'user_id' })
            .select()
            .single();
        if (error) throw error;
        return result;
    },
    async updateUserInformation(userId, updates) {
        const { data, error } = await supabase
            .from('user_information')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    async deleteUserInformation(userId) {
        await supabase
            .from('user_information')
            .delete()
            .eq('user_id', userId);
    }
};

import { supabase } from '@/integrations/supabase/client';
import { IUserInformationDatabase } from '../interfaces/IUserInformationDatabase';

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
            // eslint-disable-next-line
            .upsert(upsertData as any, { onConflict: 'user_id' })
            .select()
            .single();
        if (error) throw error;
        return result;
    },
    async updateUserInformation(userId, updates) {
        const { data, error } = await supabase
            .from('user_information')
            // eslint-disable-next-line
            .update(updates as any)
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

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type GoogleAdsAccount = Database['public']['Tables']['google_ads_accounts']['Row'];
type GoogleAdsAccountInsert = Database['public']['Tables']['google_ads_accounts']['Insert'];
type GoogleAdsAccountUpdate = Database['public']['Tables']['google_ads_accounts']['Update'];

type GoogleMccAccount = Database['public']['Tables']['google_mcc_accounts']['Row'];
type GoogleMccAccountInsert = Database['public']['Tables']['google_mcc_accounts']['Insert'];
type GoogleMccAccountUpdate = Database['public']['Tables']['google_mcc_accounts']['Update'];

export class GoogleAdsService {
    /**
     * Get Google Ads accounts for a user (single business owner)
     */
    static async getAccountsByUserId(userId: string) {
        const { data, error } = await supabase
            .from('google_ads_accounts')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) {
            throw new Error(`Failed to fetch Google Ads accounts: ${error.message}`);
        }

        return data;
    }

    /**
     * Connect Google Ads account for single business
     */
    static async connectAccount(account: GoogleAdsAccountInsert) {
        const { data, error } = await supabase
            .from('google_ads_accounts')
            .insert(account)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to connect Google Ads account: ${error.message}`);
        }

        return data;
    }

    /**
     * Update Google Ads account tokens
     */
    static async updateTokens(
        accountId: string,
        tokens: {
            access_token?: string;
            refresh_token?: string;
            token_expires_at?: string;
        }
    ) {
        const { data, error } = await supabase
            .from('google_ads_accounts')
            .update(tokens)
            .eq('id', accountId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update Google Ads account tokens: ${error.message}`);
        }

        return data;
    }

    /**
     * Get MCC accounts for an agency
     */
    static async getMccAccountsByAgencyId(agencyId: string) {
        const { data, error } = await supabase
            .from('google_mcc_accounts')
            .select('*')
            .eq('agency_id', agencyId)
            .eq('is_active', true);

        if (error) {
            throw new Error(`Failed to fetch MCC accounts: ${error.message}`);
        }

        return data;
    }

    /**
     * Connect MCC account for agency
     */
    static async connectMccAccount(account: GoogleMccAccountInsert) {
        const { data, error } = await supabase
            .from('google_mcc_accounts')
            .insert(account)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to connect MCC account: ${error.message}`);
        }

        return data;
    }

    /**
     * Update MCC account tokens
     */
    static async updateMccTokens(
        accountId: string,
        tokens: {
            access_token?: string;
            refresh_token?: string;
            token_expires_at?: string;
        }
    ) {
        const { data, error } = await supabase
            .from('google_mcc_accounts')
            .update(tokens)
            .eq('id', accountId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update MCC account tokens: ${error.message}`);
        }

        return data;
    }

    /**
     * Check if user has valid Google Ads connection
     */
    static async hasValidConnection(userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('google_ads_accounts')
            .select('id, token_expires_at')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return false;
        }

        // Check if token is still valid (assuming token_expires_at is properly set)
        if (data.token_expires_at) {
            const expiresAt = new Date(data.token_expires_at);
            const now = new Date();
            return expiresAt > now;
        }

        return true; // If no expiration date, assume valid
    }

    /**
     * Check if agency has valid MCC connection
     */
    static async hasValidMccConnection(agencyId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('google_mcc_accounts')
            .select('id, token_expires_at')
            .eq('agency_id', agencyId)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return false;
        }

        // Check if token is still valid
        if (data.token_expires_at) {
            const expiresAt = new Date(data.token_expires_at);
            const now = new Date();
            return expiresAt > now;
        }

        return true;
    }
}

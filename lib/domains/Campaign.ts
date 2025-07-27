// Import necessary modules
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

export class CampaignService {
    /**
     * Get campaigns by user ID (for single business owners)
     */
    static async getByUserId(userId: string) {
        const { data, error } = await supabase
            .from('campaigns')
            .select(`
		*,
		budget_schedules(*),
		keywords(*),
		ads(*),
		targeting_settings(*),
		performance_metrics(*)
	  `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch campaigns: ${error.message}`);
        }

        return data;
    }

    /**
     * Get campaigns managed by an agency
     */
    static async getByAgencyId(agencyId: string) {
        const { data, error } = await supabase
            .from('campaigns')
            .select(`
		*,
		budget_schedules(*),
		keywords(*),
		ads(*),
		targeting_settings(*),
		performance_metrics(*)
	  `)
            .eq('managed_by_agency_id', agencyId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch agency campaigns: ${error.message}`);
        }

        return data;
    }

    /**
     * Create a new campaign
     */
    static async create(campaign: CampaignInsert) {
        const { data, error } = await supabase
            .from('campaigns')
            .insert(campaign)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create campaign: ${error.message}`);
        }

        return data;
    }

    /**
     * Update campaign
     */
    static async update(id: string, updates: CampaignUpdate) {
        const { data, error } = await supabase
            .from('campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update campaign: ${error.message}`);
        }

        return data;
    }

    /**
     * Assign campaign to agency
     */
    static async assignToAgency(campaignId: string, agencyId: string) {
        const { data, error } = await supabase
            .from('campaigns')
            .update({ managed_by_agency_id: agencyId })
            .eq('id', campaignId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to assign campaign to agency: ${error.message}`);
        }

        return data;
    }

    /**
     * Remove agency management from campaign
     */
    static async removeAgencyManagement(campaignId: string) {
        const { data, error } = await supabase
            .from('campaigns')
            .update({ managed_by_agency_id: null })
            .eq('id', campaignId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to remove agency management: ${error.message}`);
        }

        return data;
    }

    /**
     * Get campaign with full details (for editing)
     */
    static async getWithDetails(campaignId: string) {
        const { data, error } = await supabase
            .from('campaigns')
            .select(`
		*,
		budget_schedules(*),
		keywords(*),
		ads(*),
		targeting_settings(*),
		performance_metrics(*)
	  `)
            .eq('id', campaignId)
            .single();

        if (error) {
            throw new Error(`Failed to fetch campaign details: ${error.message}`);
        }

        return data;
    }
}
// ...existing code from lib/supabase/campaigns.ts...

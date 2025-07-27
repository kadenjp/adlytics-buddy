import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Agency = Database['public']['Tables']['agencies']['Row'];
type AgencyInsert = Database['public']['Tables']['agencies']['Insert'];
type AgencyUpdate = Database['public']['Tables']['agencies']['Update'];

export class AgencyService {
    /**
     * Get agency by owner ID
     */
    static async getByOwnerId(ownerId: string) {
        const { data, error } = await supabase
            .from('agencies')
            .select('*')
            .eq('owner_id', ownerId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to fetch agency: ${error.message}`);
        }

        return data;
    }

    /**
     * Create a new agency
     */
    static async create(agency: AgencyInsert) {
        const { data, error } = await supabase
            .from('agencies')
            .insert(agency)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create agency: ${error.message}`);
        }

        return data;
    }

    /**
     * Update agency
     */
    static async update(id: string, updates: AgencyUpdate) {
        const { data, error } = await supabase
            .from('agencies')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update agency: ${error.message}`);
        }

        return data;
    }

    /**
     * Get agency with clients
     */
    static async getWithClients(agencyId: string) {
        const { data, error } = await supabase
            .from('agencies')
            .select(`
		*,
		agency_client_relationships!inner(
		  id,
		  status,
		  permissions,
		  created_at,
		  clients(
			id,
			business_name,
			contact_name,
			contact_email,
			industry,
			is_active
		  )
		)
	  `)
            .eq('id', agencyId)
            .eq('agency_client_relationships.status', 'approved');

        if (error) {
            throw new Error(`Failed to fetch agency with clients: ${error.message}`);
        }

        return data;
    }

    /**
     * Get agency MCC accounts
     */
    static async getMccAccounts(agencyId: string) {
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
}
// ...existing code from lib/supabase/agencies.ts...

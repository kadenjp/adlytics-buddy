import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
type AgencyClientRelationshipUpdate = Database['public']['Tables']['agency_client_relationships']['Update'];

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];
type AgencyClientRelationship = Database['public']['Tables']['agency_client_relationships']['Row'];
type AgencyClientRelationshipInsert = Database['public']['Tables']['agency_client_relationships']['Insert'];

export class ClientService {
    /**
     * Get client by user ID
     */
    static async getByUserId(userId: string) {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Failed to fetch client: ${error.message}`);
        }

        return data;
    }

    /**
     * Create a new client
     */
    static async create(client: ClientInsert) {
        const { data, error } = await supabase
            .from('clients')
            .insert(client)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create client: ${error.message}`);
        }

        return data;
    }

    /**
     * Update client
     */
    static async update(id: string, updates: ClientUpdate) {
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update client: ${error.message}`);
        }

        return data;
    }

    /**
     * Get client with agency relationships
     */
    static async getWithAgencies(clientId: string) {
        const { data, error } = await supabase
            .from('clients')
            .select(`
        *,
        agency_client_relationships(
          id,
          status,
          permissions,
          request_message,
          approved_at,
          agencies(
            id,
            name,
            description,
            website,
            contact_email
          )
        )
      `)
            .eq('id', clientId);

        if (error) {
            throw new Error(`Failed to fetch client with agencies: ${error.message}`);
        }

        return data;
    }

    /**
     * Request agency relationship
     */
    static async requestAgencyRelationship(relationship: AgencyClientRelationshipInsert) {
        const { data, error } = await supabase
            .from('agency_client_relationships')
            .insert(relationship)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create agency relationship request: ${error.message}`);
        }

        return data;
    }

    /**
     * Get pending agency requests for a client
     */
    static async getPendingAgencyRequests(clientId: string) {
        const { data, error } = await supabase
            .from('agency_client_relationships')
            .select(`
        *,
        agencies(
          id,
          name,
          description,
          website,
          contact_email
        )
      `)
            .eq('client_id', clientId)
            .eq('status', 'pending');

        if (error) {
            throw new Error(`Failed to fetch pending agency requests: ${error.message}`);
        }

        return data;
    }

    /**
     * Approve/reject agency relationship
     */
    static async updateAgencyRelationship(
        relationshipId: string,
        status: 'approved' | 'rejected',
        approvedBy: string
    ) {
        const updates: AgencyClientRelationshipUpdate = {
            status,
            approved_by: approvedBy,
        };

        if (status === 'approved') {
            updates.approved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('agency_client_relationships')
            .update(updates)
            .eq('id', relationshipId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to update agency relationship: ${error.message}`);
        }

        return data;
    }
}

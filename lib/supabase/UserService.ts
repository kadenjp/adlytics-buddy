import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../integrations/supabase/types";
import {
    UserInformation,
    UserInformationInsert,
    UserInformationUpdate,
    BusinessProfile,
    BusinessProfileInsert,
    BusinessProfileUpdate,
    UserProfile,
    UserOnboardingData,
    UserWithRelationships
} from "../../integrations/supabase/user-types";

export class UserService {
    constructor(private supabase: SupabaseClient<Database>) { }

    /**
     * Get complete user profile with personal and business information
     */
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            // Get personal information
            const { data: personalInfo, error: personalError } = await this.supabase
                .from("user_information")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (personalError && personalError.code !== "PGRST116") {
                throw personalError;
            }

            // Get business profile
            const { data: businessProfile, error: businessError } = await this.supabase
                .from("business_profiles")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (businessError && businessError.code !== "PGRST116") {
                throw businessError;
            }

            // Get agencies owned by user
            const { data: agencies, error: agenciesError } = await this.supabase
                .from("agencies")
                .select("*")
                .eq("owner_id", userId);

            if (agenciesError) throw agenciesError;

            // Get client profiles
            const { data: clients, error: clientsError } = await this.supabase
                .from("clients")
                .select("*")
                .eq("user_id", userId);

            if (clientsError) throw clientsError;

            if (!personalInfo) return null;

            return {
                personal: personalInfo,
                business: businessProfile || null,
                agencies: agencies || [],
                clients: clients || []
            };
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    }

    /**
     * Create or update user information
     */
    async upsertUserInformation(
        userId: string,
        data: Partial<UserInformationInsert>
    ): Promise<UserInformation> {
        try {
            const upsertData = {
                user_id: userId,
                ...data
            } as UserInformationInsert;

            const { data: result, error } = await this.supabase
                .from("user_information")
                .upsert(upsertData, { onConflict: "user_id" })
                .select()
                .single();

            if (error) throw error;
            return result;
        } catch (error) {
            console.error("Error upserting user information:", error);
            throw error;
        }
    }

    /**
     * Create or update business profile
     */
    async upsertBusinessProfile(
        userId: string,
        data: Partial<BusinessProfileInsert>
    ): Promise<BusinessProfile> {
        try {
            const upsertData = {
                user_id: userId,
                ...data
            } as BusinessProfileInsert;

            const { data: result, error } = await this.supabase
                .from("business_profiles")
                .upsert(upsertData, { onConflict: "user_id" })
                .select()
                .single();

            if (error) throw error;
            return result;
        } catch (error) {
            console.error("Error upserting business profile:", error);
            throw error;
        }
    }

    /**
     * Complete user onboarding with both personal and business data
     */
    async completeOnboarding(
        userId: string,
        onboardingData: UserOnboardingData
    ): Promise<UserProfile> {
        try {
            // Create personal information
            const personalInfo = await this.upsertUserInformation(userId, {
                ...onboardingData.personal,
                user_id: userId
            });

            // Create business profile
            const businessProfile = await this.upsertBusinessProfile(userId, {
                ...onboardingData.business,
                user_id: userId
            });

            return {
                personal: personalInfo,
                business: businessProfile,
                agencies: [],
                clients: []
            };
        } catch (error) {
            console.error("Error completing onboarding:", error);
            throw error;
        }
    }

    /**
     * Get user with all relationships for agency management
     */
    async getUserWithRelationships(userId: string): Promise<UserWithRelationships | null> {
        try {
            const profile = await this.getUserProfile(userId);
            if (!profile) return null;

            // Get agency-client relationships
            const { data: relationships, error: relationshipsError } = await this.supabase
                .from("agency_client_relationships")
                .select(`
          *,
          agencies(*),
          clients(*)
        `)
                .or(`agency_id.in.(${profile.agencies?.map(a => a.id).join(",")}),client_id.in.(${profile.clients?.map(c => c.id).join(",")})`);

            if (relationshipsError) throw relationshipsError;

            return {
                id: userId,
                email: profile.personal.email,
                personal_info: profile.personal,
                business_profile: profile.business,
                owned_agencies: profile.agencies || [],
                client_profiles: profile.clients || [],
                agency_relationships: relationships || []
            };
        } catch (error) {
            console.error("Error fetching user with relationships:", error);
            throw error;
        }
    }

    /**
     * Update user information
     */
    async updateUserInformation(
        userId: string,
        updates: UserInformationUpdate
    ): Promise<UserInformation> {
        try {
            const { data, error } = await this.supabase
                .from("user_information")
                .update(updates)
                .eq("user_id", userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error updating user information:", error);
            throw error;
        }
    }

    /**
     * Update business profile
     */
    async updateBusinessProfile(
        userId: string,
        updates: BusinessProfileUpdate
    ): Promise<BusinessProfile> {
        try {
            const { data, error } = await this.supabase
                .from("business_profiles")
                .update(updates)
                .eq("user_id", userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error updating business profile:", error);
            throw error;
        }
    }

    /**
     * Delete user data (for account deletion)
     */
    async deleteUserData(userId: string): Promise<void> {
        try {
            // Delete in reverse dependency order
            await this.supabase.from("business_profiles").delete().eq("user_id", userId);
            await this.supabase.from("user_information").delete().eq("user_id", userId);
        } catch (error) {
            console.error("Error deleting user data:", error);
            throw error;
        }
    }
}

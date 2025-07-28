import { IUserInformationDatabase } from '../interfaces/IUserInformationDatabase';
import { IBusinessProfileDatabase } from '../interfaces/IBusinessProfileDatabase';
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
    constructor(
        private userInformationDb: IUserInformationDatabase,
        private businessProfileDb: IBusinessProfileDatabase
    ) { }

    /**
     * Get complete user profile with personal and business information
     */
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        try {
            const personalInfo = await this.userInformationDb.getUserInformation(userId);
            const businessProfile = await this.businessProfileDb.getBusinessProfile(userId);
            // Agencies and clients would need their own provider abstraction for full separation
            // For now, return empty arrays for agencies/clients
            if (!personalInfo) return null;
            return {
                personal: personalInfo as UserInformation,
                business: (businessProfile as BusinessProfile) || null,
                agencies: [],
                clients: []
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
            const result = await this.userInformationDb.upsertUserInformation(userId, data);
            return result as UserInformation;
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
            const result = await this.businessProfileDb.upsertBusinessProfile(userId, data);
            return result as BusinessProfile;
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
            const personalInfo = await this.upsertUserInformation(userId, onboardingData.personal);
            const businessProfile = await this.upsertBusinessProfile(userId, onboardingData.business);
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
            // Relationships would need their own provider abstraction for full separation
            return {
                id: userId,
                email: profile.personal.email,
                personal_info: profile.personal,
                business_profile: profile.business,
                owned_agencies: profile.agencies || [],
                client_profiles: profile.clients || [],
                agency_relationships: []
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
            const result = await this.userInformationDb.updateUserInformation(userId, updates);
            return result as UserInformation;
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
    ): Promise<void> {
        try {
            await this.businessProfileDb.updateBusinessProfile(userId, updates);
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
            await this.businessProfileDb.deleteBusinessProfile(userId);
            await this.userInformationDb.deleteUserInformation(userId);
        } catch (error) {
            console.error("Error deleting user data:", error);
            throw error;
        }
    }
}

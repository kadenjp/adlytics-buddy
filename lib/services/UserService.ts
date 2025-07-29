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
import { createLogger } from '../providers/logger';

const logger = createLogger('UserService');

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
            logger.error("Error fetching user profile", { userId, error: error instanceof Error ? error.message : error });
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
            logger.error("Error upserting user information", { userId, error: error instanceof Error ? error.message : error });
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
            logger.error("Error upserting business profile", { userId, error: error instanceof Error ? error.message : error });
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
            logger.error("Error completing onboarding", { userId, error: error instanceof Error ? error.message : error });
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
            logger.error("Error fetching user with relationships", { userId, error: error instanceof Error ? error.message : error });
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
            logger.error("Error updating user information", { userId, error: error instanceof Error ? error.message : error });
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
            logger.error("Error updating business profile", { userId, error: error instanceof Error ? error.message : error });
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
            logger.error("Error deleting user data", { userId, error: error instanceof Error ? error.message : error });
            throw error;
        }
    }
}

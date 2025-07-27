import { Tables, TablesInsert, TablesUpdate } from "./types";

// User Information - Personal data separate from business context
export type UserInformation = Tables<"user_information">;
export type UserInformationInsert = TablesInsert<"user_information">;
export type UserInformationUpdate = TablesUpdate<"user_information">;

// Business Profile - Business context and targeting preferences
export type BusinessProfile = Tables<"business_profiles">;
export type BusinessProfileInsert = TablesInsert<"business_profiles">;
export type BusinessProfileUpdate = TablesUpdate<"business_profiles">;

// Combined user profile type for UI components
export type UserProfile = {
    personal: UserInformation;
    business: BusinessProfile | null;
    agencies?: Agency[];
    clients?: Client[];
};

// Agency and Client types
export type Agency = Tables<"agencies">;
export type Client = Tables<"clients">;

// Helper type for user onboarding
export type UserOnboardingData = {
    personal: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        timezone?: string;
    };
    business: {
        business_name: string;
        industry: string;
        business_type: "agency" | "client" | "direct";
        website?: string;
        business_goals?: string[];
        target_audience?: string[];
        target_age_min?: number;
        target_age_max?: number;
        target_radius?: number;
    };
};

// Helper type for agency-client relationship queries
export type AgencyClientRelationship = Tables<"agency_client_relationships">;

// Helper type for complete user context with relationships
export type UserWithRelationships = {
    id: string;
    email: string;
    personal_info: UserInformation;
    business_profile: BusinessProfile | null;
    owned_agencies: Agency[];
    client_profiles: Client[];
    agency_relationships: AgencyClientRelationship[];
};

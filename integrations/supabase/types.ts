export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          campaign_id: string
          created_at: string
          descriptions: string[]
          final_url: string
          headlines: string[]
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          descriptions: string[]
          final_url: string
          headlines: string[]
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          descriptions?: string[]
          final_url?: string
          headlines?: string[]
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_information: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          timezone: string | null;
          language: string | null;
          date_of_birth: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          language?: string | null;
          date_of_birth?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          language?: string | null;
          date_of_birth?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_information_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      },
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          industry: string;
          business_type: "agency" | "client" | "direct";
          website: string | null;
          business_address: string | null;
          business_goals: string[] | null;
          target_age_min: number | null;
          target_age_max: number | null;
          target_audience: string[] | null;
          target_radius: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          industry: string;
          business_type: "agency" | "client" | "direct";
          website?: string | null;
          business_address?: string | null;
          business_goals?: string[] | null;
          target_age_min?: number | null;
          target_age_max?: number | null;
          target_audience?: string[] | null;
          target_radius?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          industry?: string;
          business_type?: "agency" | "client" | "direct";
          website?: string | null;
          business_address?: string | null;
          business_goals?: string[] | null;
          target_age_min?: number | null;
          target_age_max?: number | null;
          target_audience?: string[] | null;
          target_radius?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "business_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      },
      agencies: {
        Row: {
          address: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_client_relationships: {
        Row: {
          agency_id: string
          approved_at: string | null
          approved_by: string | null
          client_id: string
          created_at: string | null
          id: string
          permissions: Json | null
          request_message: string | null
          requested_by: string
          status: string
          terminated_at: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          permissions?: Json | null
          request_message?: string | null
          requested_by: string
          status?: string
          terminated_at?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          permissions?: Json | null
          request_message?: string | null
          requested_by?: string
          status?: string
          terminated_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_client_relationships_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_client_relationships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_models: {
        Row: {
          agency_id: string
          client_id: string
          configuration: Json
          created_at: string | null
          effective_from: string
          effective_until: string | null
          id: string
          is_active: boolean | null
          model_type: string
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          client_id: string
          configuration: Json
          created_at?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean | null
          model_type: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          client_id?: string
          configuration?: Json
          created_at?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean | null
          model_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_models_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_models_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_schedules: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          next_execution_date: string | null
          recurrence_pattern: Json | null
          schedule_type: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          next_execution_date?: string | null
          recurrence_pattern?: Json | null
          schedule_type: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          next_execution_date?: string | null
          recurrence_pattern?: Json | null
          schedule_type?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_schedules_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget_amount: number | null
          created_at: string
          id: string
          managed_by_agency_id: string | null
          name: string
          phone_number: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          budget_amount?: number | null
          created_at?: string
          id?: string
          managed_by_agency_id?: string | null
          name: string
          phone_number?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          budget_amount?: number | null
          created_at?: string
          id?: string
          managed_by_agency_id?: string | null
          name?: string
          phone_number?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_managed_by_agency_id_fkey"
            columns: ["managed_by_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: Json | null
          business_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          notes: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          business_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          business_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_accounts: {
        Row: {
          access_token: string | null
          account_name: string | null
          created_at: string | null
          currency_code: string | null
          email: string
          google_account_id: string
          id: string
          is_active: boolean | null
          refresh_token: string | null
          time_zone: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          email: string
          google_account_id: string
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          time_zone?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_name?: string | null
          created_at?: string | null
          currency_code?: string | null
          email?: string
          google_account_id?: string
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          time_zone?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_ads_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      google_mcc_accounts: {
        Row: {
          access_token: string | null
          account_name: string
          agency_id: string
          created_at: string | null
          currency_code: string | null
          email: string
          id: string
          is_active: boolean | null
          mcc_customer_id: string
          refresh_token: string | null
          time_zone: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          account_name: string
          agency_id: string
          created_at?: string | null
          currency_code?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          mcc_customer_id: string
          refresh_token?: string | null
          time_zone?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          account_name?: string
          agency_id?: string
          created_at?: string | null
          currency_code?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          mcc_customer_id?: string
          refresh_token?: string | null
          time_zone?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_mcc_accounts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          bid_amount: number | null
          campaign_id: string
          competition: string | null
          created_at: string
          id: string
          match_type: string
          search_volume: number | null
          text: string
          updated_at: string
        }
        Insert: {
          bid_amount?: number | null
          campaign_id: string
          competition?: string | null
          created_at?: string
          id?: string
          match_type?: string
          search_volume?: number | null
          text: string
          updated_at?: string
        }
        Update: {
          bid_amount?: number | null
          campaign_id?: string
          competition?: string | null
          created_at?: string
          id?: string
          match_type?: string
          search_volume?: number | null
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          calls: number | null
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          updated_at: string
        }
        Insert: {
          calls?: number | null
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date: string
          id?: string
          impressions?: number | null
          updated_at?: string
        }
        Update: {
          calls?: number | null
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          business_goals: string[] | null
          business_name: string
          created_at: string
          id: string
          industry: string
          owner_name: string
          phone: string | null
          target_age_max: number | null
          target_age_min: number | null
          target_audience: string[] | null
          target_radius: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          business_goals?: string[] | null
          business_name: string
          created_at?: string
          id?: string
          industry: string
          owner_name: string
          phone?: string | null
          target_age_max?: number | null
          target_age_min?: number | null
          target_audience?: string[] | null
          target_radius?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          business_goals?: string[] | null
          business_name?: string
          created_at?: string
          id?: string
          industry?: string
          owner_name?: string
          phone?: string | null
          target_age_max?: number | null
          target_age_min?: number | null
          target_audience?: string[] | null
          target_radius?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          error_message: string | null
          expires_at: string | null
          file_size_bytes: number | null
          file_url: string | null
          generated_at: string | null
          id: string
          parameters: Json | null
          report_type: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          parameters?: Json | null
          report_type: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          parameters?: Json | null
          report_type?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      targeting_settings: {
        Row: {
          age_max: number | null
          age_min: number | null
          campaign_id: string
          created_at: string
          genders: string[] | null
          id: string
          locations: string[] | null
          radius: number | null
          schedule: Json | null
          updated_at: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          campaign_id: string
          created_at?: string
          genders?: string[] | null
          id?: string
          locations?: string[] | null
          radius?: number | null
          schedule?: Json | null
          updated_at?: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          campaign_id?: string
          created_at?: string
          genders?: string[] | null
          id?: string
          locations?: string[] | null
          radius?: number | null
          schedule?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "targeting_settings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_email: string
          after: Json | null
          before: Json | null
          created_at: string
          id: string
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          admin_email: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          admin_email?: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: string
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      admin_whitelist: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_active: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      affiliate_status: {
        Row: {
          is_active: boolean
          is_test: boolean
          tier: Database["public"]["Enums"]["affiliate_tier"]
          tier_depth_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          is_active?: boolean
          is_test?: boolean
          tier?: Database["public"]["Enums"]["affiliate_tier"]
          tier_depth_limit?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          is_active?: boolean
          is_test?: boolean
          tier?: Database["public"]["Enums"]["affiliate_tier"]
          tier_depth_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      approved_revenue_sources: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          source_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          source_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          source_name?: string
        }
        Relationships: []
      }
      commission_ledger: {
        Row: {
          amount_usd: number
          beneficiary_user_id: string
          created_at: string
          id: string
          is_test: boolean
          layer: number
          notes: string | null
          rate_percent: number
          referred_user_id: string
          source_revenue_event_id: string
          status: Database["public"]["Enums"]["commission_status"]
        }
        Insert: {
          amount_usd: number
          beneficiary_user_id: string
          created_at?: string
          id?: string
          is_test?: boolean
          layer: number
          notes?: string | null
          rate_percent: number
          referred_user_id: string
          source_revenue_event_id: string
          status?: Database["public"]["Enums"]["commission_status"]
        }
        Update: {
          amount_usd?: number
          beneficiary_user_id?: string
          created_at?: string
          id?: string
          is_test?: boolean
          layer?: number
          notes?: string | null
          rate_percent?: number
          referred_user_id?: string
          source_revenue_event_id?: string
          status?: Database["public"]["Enums"]["commission_status"]
        }
        Relationships: [
          {
            foreignKeyName: "commission_ledger_source_revenue_event_id_fkey"
            columns: ["source_revenue_event_id"]
            isOneToOne: false
            referencedRelation: "revenue_events"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rates: {
        Row: {
          is_active: boolean
          layer: number
          rate_percent: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          is_active?: boolean
          layer: number
          rate_percent: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          is_active?: boolean
          layer?: number
          rate_percent?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          dividend_cap_percent: number
          id: string
          is_active: boolean
          name: string
          price_usd: number
          shares: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          dividend_cap_percent: number
          id?: string
          is_active?: boolean
          name: string
          price_usd: number
          shares: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          dividend_cap_percent?: number
          id?: string
          is_active?: boolean
          name?: string
          price_usd?: number
          shares?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      platform_activity: {
        Row: {
          amount: number | null
          created_at: string
          event_type: string
          id: string
          is_test: boolean
          metadata: Json | null
          status: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          event_type: string
          id?: string
          is_test?: boolean
          metadata?: Json | null
          status?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          event_type?: string
          id?: string
          is_test?: boolean
          metadata?: Json | null
          status?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_verified: boolean
          last_active: string | null
          notification_preferences: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean
          last_active?: string | null
          notification_preferences?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean
          last_active?: string | null
          notification_preferences?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          email: string
          id: string
          is_test: boolean
          status: string
          stripe_session_id: string | null
          tier: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          id?: string
          is_test?: boolean
          status?: string
          stripe_session_id?: string | null
          tier: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          id?: string
          is_test?: boolean
          status?: string
          stripe_session_id?: string | null
          tier?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referral_links: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          used_at: string | null
          used_by_email: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          used_at?: string | null
          used_by_email?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          used_at?: string | null
          used_by_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          is_test: boolean
          referred_user_id: string
          referrer_user_id: string
          status: Database["public"]["Enums"]["referral_status"]
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_test?: boolean
          referred_user_id: string
          referrer_user_id: string
          status?: Database["public"]["Enums"]["referral_status"]
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_test?: boolean
          referred_user_id?: string
          referrer_user_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
          verified_at?: string | null
        }
        Relationships: []
      }
      revenue_events: {
        Row: {
          amount_usd: number
          created_at: string
          external_reference: string | null
          id: string
          is_test: boolean
          occurred_at: string
          settled_at: string | null
          source: string
          status: Database["public"]["Enums"]["revenue_status"]
          user_id: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          external_reference?: string | null
          id?: string
          is_test?: boolean
          occurred_at?: string
          settled_at?: string | null
          source: string
          status?: Database["public"]["Enums"]["revenue_status"]
          user_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          external_reference?: string | null
          id?: string
          is_test?: boolean
          occurred_at?: string
          settled_at?: string | null
          source?: string
          status?: Database["public"]["Enums"]["revenue_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_tier_depth_limit: {
        Args: { p_tier: Database["public"]["Enums"]["affiliate_tier"] }
        Returns: number
      }
      get_upline_chain: {
        Args: { p_max_depth?: number; p_user_id: string }
        Returns: {
          layer: number
          referrer_id: string
        }[]
      }
      is_admin: { Args: { _email: string }; Returns: boolean }
    }
    Enums: {
      affiliate_tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
      commission_status: "pending" | "approved" | "paid" | "reversed" | "held"
      referral_status: "pending" | "active" | "invalid"
      revenue_status: "pending" | "settled" | "reversed"
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
    Enums: {
      affiliate_tier: ["bronze", "silver", "gold", "platinum", "diamond"],
      commission_status: ["pending", "approved", "paid", "reversed", "held"],
      referral_status: ["pending", "active", "invalid"],
      revenue_status: ["pending", "settled", "reversed"],
    },
  },
} as const

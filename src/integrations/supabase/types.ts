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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      business_submissions: {
        Row: {
          annual_revenue: string | null
          business_name: string
          business_structure: Database["public"]["Enums"]["business_structure_type"]
          created_at: string | null
          employee_count: number
          id: string
          industry: string
          state: string
        }
        Insert: {
          annual_revenue?: string | null
          business_name: string
          business_structure: Database["public"]["Enums"]["business_structure_type"]
          created_at?: string | null
          employee_count: number
          id?: string
          industry: string
          state: string
        }
        Update: {
          annual_revenue?: string | null
          business_name?: string
          business_structure?: Database["public"]["Enums"]["business_structure_type"]
          created_at?: string | null
          employee_count?: number
          id?: string
          industry?: string
          state?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          annual_revenue: number | null
          business_name: string
          business_structure: Database["public"]["Enums"]["business_structure_type"]
          city: string
          country: string
          created_at: string
          description: string | null
          email: string | null
          employee_count: number
          founded_year: number | null
          id: string
          industry: string
          is_active: boolean
          last_updated: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          state: string
          website: string | null
        }
        Insert: {
          annual_revenue?: number | null
          business_name: string
          business_structure: Database["public"]["Enums"]["business_structure_type"]
          city: string
          country?: string
          created_at?: string
          description?: string | null
          email?: string | null
          employee_count?: number
          founded_year?: number | null
          id?: string
          industry: string
          is_active?: boolean
          last_updated?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          state: string
          website?: string | null
        }
        Update: {
          annual_revenue?: number | null
          business_name?: string
          business_structure?: Database["public"]["Enums"]["business_structure_type"]
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          email?: string | null
          employee_count?: number
          founded_year?: number | null
          id?: string
          industry?: string
          is_active?: boolean
          last_updated?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          state?: string
          website?: string | null
        }
        Relationships: []
      }
      compliance_rules: {
        Row: {
          applicable_business_structures:
            | Database["public"]["Enums"]["business_structure_type"][]
            | null
          applicable_industries: string[] | null
          applicable_states: string[] | null
          category: string
          compliance_steps: Json
          created_at: string | null
          deadline: string | null
          description: string
          id: string
          max_employee_count: number | null
          min_employee_count: number | null
          penalty: string | null
          priority: Database["public"]["Enums"]["rule_priority"]
          rule_type: Database["public"]["Enums"]["rule_type"]
          source: string
          title: string
          updated_at: string | null
        }
        Insert: {
          applicable_business_structures?:
            | Database["public"]["Enums"]["business_structure_type"][]
            | null
          applicable_industries?: string[] | null
          applicable_states?: string[] | null
          category: string
          compliance_steps?: Json
          created_at?: string | null
          deadline?: string | null
          description: string
          id?: string
          max_employee_count?: number | null
          min_employee_count?: number | null
          penalty?: string | null
          priority: Database["public"]["Enums"]["rule_priority"]
          rule_type: Database["public"]["Enums"]["rule_type"]
          source: string
          title: string
          updated_at?: string | null
        }
        Update: {
          applicable_business_structures?:
            | Database["public"]["Enums"]["business_structure_type"][]
            | null
          applicable_industries?: string[] | null
          applicable_states?: string[] | null
          category?: string
          compliance_steps?: Json
          created_at?: string | null
          deadline?: string | null
          description?: string
          id?: string
          max_employee_count?: number | null
          min_employee_count?: number | null
          penalty?: string | null
          priority?: Database["public"]["Enums"]["rule_priority"]
          rule_type?: Database["public"]["Enums"]["rule_type"]
          source?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      business_structure_type:
        | "sole_proprietorship"
        | "partnership"
        | "llc"
        | "corporation"
        | "s_corporation"
        | "nonprofit"
      rule_priority: "high" | "medium" | "low"
      rule_type: "federal" | "state" | "local"
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
      business_structure_type: [
        "sole_proprietorship",
        "partnership",
        "llc",
        "corporation",
        "s_corporation",
        "nonprofit",
      ],
      rule_priority: ["high", "medium", "low"],
      rule_type: ["federal", "state", "local"],
    },
  },
} as const

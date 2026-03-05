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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      broadcast_groups: {
        Row: {
          broadcast_id: string
          group_id: string
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          broadcast_id: string
          group_id: string
          id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          broadcast_id?: string
          group_id?: string
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_groups_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_logs: {
        Row: {
          broadcast_id: string
          created_at: string
          group_id: string | null
          group_name: string | null
          id: string
          message: string | null
          status: string
        }
        Insert: {
          broadcast_id: string
          created_at?: string
          group_id?: string | null
          group_name?: string | null
          id?: string
          message?: string | null
          status: string
        }
        Update: {
          broadcast_id?: string
          created_at?: string
          group_id?: string | null
          group_name?: string | null
          id?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_logs_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_logs_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          archived: boolean
          connection_id: string | null
          content: string | null
          content_type: Database["public"]["Enums"]["broadcast_content_type"]
          created_at: string
          delay_seconds: number
          delivered_count: number
          id: string
          media_url: string | null
          mention_mode: string | null
          sent_count: number
          status: Database["public"]["Enums"]["broadcast_status"]
          title: string
          total_groups: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          connection_id?: string | null
          content?: string | null
          content_type?: Database["public"]["Enums"]["broadcast_content_type"]
          created_at?: string
          delay_seconds?: number
          delivered_count?: number
          id?: string
          media_url?: string | null
          mention_mode?: string | null
          sent_count?: number
          status?: Database["public"]["Enums"]["broadcast_status"]
          title: string
          total_groups?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          connection_id?: string | null
          content?: string | null
          content_type?: Database["public"]["Enums"]["broadcast_content_type"]
          created_at?: string
          delay_seconds?: number
          delivered_count?: number
          id?: string
          media_url?: string | null
          mention_mode?: string | null
          sent_count?: number
          status?: Database["public"]["Enums"]["broadcast_status"]
          title?: string
          total_groups?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted?: boolean
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          category: Database["public"]["Enums"]["group_category"]
          connection_id: string | null
          created_at: string
          description: string | null
          id: string
          invite_link: string | null
          is_active: boolean
          max_members: number
          member_count: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["group_category"]
          connection_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_link?: string | null
          is_active?: boolean
          max_members?: number
          member_count?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["group_category"]
          connection_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_link?: string | null
          is_active?: boolean
          max_members?: number
          member_count?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_groups: {
        Row: {
          group_id: string
          id: string
          schedule_id: string
        }
        Insert: {
          group_id: string
          id?: string
          schedule_id: string
        }
        Update: {
          group_id?: string
          id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_groups_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          connection_id: string | null
          content: string | null
          content_type: Database["public"]["Enums"]["broadcast_content_type"]
          created_at: string
          cron_expression: string | null
          frequency: Database["public"]["Enums"]["schedule_frequency"]
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          scheduled_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_id?: string | null
          content?: string | null
          content_type?: Database["public"]["Enums"]["broadcast_content_type"]
          created_at?: string
          cron_expression?: string | null
          frequency?: Database["public"]["Enums"]["schedule_frequency"]
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          scheduled_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_id?: string | null
          content?: string | null
          content_type?: Database["public"]["Enums"]["broadcast_content_type"]
          created_at?: string
          cron_expression?: string | null
          frequency?: Database["public"]["Enums"]["schedule_frequency"]
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          scheduled_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          created_at: string
          device_name: string | null
          id: string
          max_groups: number
          phone_number: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          id?: string
          max_groups?: number
          phone_number: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          id?: string
          max_groups?: number
          phone_number?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "leitor" | "criador" | "gerente"
      broadcast_content_type:
        | "text"
        | "image"
        | "video"
        | "pdf"
        | "catalog"
        | "link"
      broadcast_status: "draft" | "sending" | "sent" | "failed" | "scheduled"
      connection_status: "connected" | "disconnected" | "blocked"
      group_category:
        | "varejo"
        | "atacado"
        | "vip"
        | "internacional"
        | "promocoes"
        | "lancamentos"
        | "outros"
      schedule_frequency: "once" | "daily" | "weekly" | "monthly" | "custom"
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
      app_role: ["leitor", "criador", "gerente"],
      broadcast_content_type: [
        "text",
        "image",
        "video",
        "pdf",
        "catalog",
        "link",
      ],
      broadcast_status: ["draft", "sending", "sent", "failed", "scheduled"],
      connection_status: ["connected", "disconnected", "blocked"],
      group_category: [
        "varejo",
        "atacado",
        "vip",
        "internacional",
        "promocoes",
        "lancamentos",
        "outros",
      ],
      schedule_frequency: ["once", "daily", "weekly", "monthly", "custom"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      categories: {
        Row: { created_at: string; id: number; is_active: boolean; name: string; updated_at: string }
        Insert: { created_at?: string; id?: number; is_active?: boolean; name: string; updated_at?: string }
        Update: { created_at?: string; id?: number; is_active?: boolean; name?: string; updated_at?: string }
        Relationships: []
      }
      easy_operators: {
        Row: { created_at: string; is_active: boolean; updated_at: string; user_id: string }
        Insert: { created_at?: string; is_active?: boolean; updated_at?: string; user_id: string }
        Update: { created_at?: string; is_active?: boolean; updated_at?: string; user_id?: string }
        Relationships: []
      }
      items: {
        Row: { base_price: number; category_id: number | null; created_at: string; id: number; is_active: boolean; name: string; subcategory_id: number | null; updated_at: string }
        Insert: { base_price: number; category_id?: number | null; created_at?: string; id?: number; is_active?: boolean; name: string; subcategory_id?: number | null; updated_at?: string }
        Update: { base_price?: number; category_id?: number | null; created_at?: string; id?: number; is_active?: boolean; name?: string; subcategory_id?: number | null; updated_at?: string }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_subcategory_category_fk"
            columns: ["subcategory_id", "category_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id", "category_id"]
          }
        ]
      }
      manual_recovery_events: {
        Row: {
          actor_user_id: string
          created_at: string
          event_type: string
          export_event_id: number | null
          filename: string | null
          id: number
        }
        Insert: {
          actor_user_id: string
          created_at?: string
          event_type: string
          export_event_id?: number | null
          filename?: string | null
          id?: number
        }
        Update: {
          actor_user_id?: string
          created_at?: string
          event_type?: string
          export_event_id?: number | null
          filename?: string | null
          id?: number
        }
        Relationships: [{
          foreignKeyName: "manual_recovery_export_event_fk"
          columns: ["export_event_id"]
          isOneToOne: true
          referencedRelation: "manual_recovery_events"
          referencedColumns: ["id"]
        }]
      }
      resellers: {
        Row: { created_at: string; email: string | null; id: number; is_active: boolean; name: string; notes: string | null; phone: string | null; updated_at: string }
        Insert: { created_at?: string; email?: string | null; id?: number; is_active?: boolean; name: string; notes?: string | null; phone?: string | null; updated_at?: string }
        Update: { created_at?: string; email?: string | null; id?: number; is_active?: boolean; name?: string; notes?: string | null; phone?: string | null; updated_at?: string }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: number
          created_at: string
          id: number
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category_id: number
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: number
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [{
          foreignKeyName: "subcategories_category_id_fkey"
          columns: ["category_id"]
          isOneToOne: false
          referencedRelation: "categories"
          referencedColumns: ["id"]
        }]
      }
      transactions: {
        Row: {
          category_id: number | null
          category_name: string | null
          created_at: string
          created_by_email: string | null
          created_by_user_id: string | null
          id: number
          item_id: number | null
          item_name: string | null
          observation: string | null
          occurred_at: string
          quantity: number | null
          replacement_transaction_id: number | null
          replaces_transaction_id: number | null
          reseller_id: number
          reversal_reason: string | null
          reversed_at: string | null
          reversed_by_email: string | null
          reversed_by_user_id: string | null
          subcategory_id: number | null
          subcategory_name: string | null
          total_price: number
          type: string
          unit_price: number | null
        }
        Insert: {
          category_id?: number | null
          category_name?: string | null
          created_at?: string
          created_by_email?: string | null
          created_by_user_id?: string | null
          id?: number
          item_id?: number | null
          item_name?: string | null
          observation?: string | null
          occurred_at: string
          quantity?: number | null
          replacement_transaction_id?: number | null
          replaces_transaction_id?: number | null
          reseller_id: number
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by_email?: string | null
          reversed_by_user_id?: string | null
          subcategory_id?: number | null
          subcategory_name?: string | null
          total_price: number
          type: string
          unit_price?: number | null
        }
        Update: {
          category_id?: number | null
          category_name?: string | null
          created_at?: string
          created_by_email?: string | null
          created_by_user_id?: string | null
          id?: number
          item_id?: number | null
          item_name?: string | null
          observation?: string | null
          occurred_at?: string
          quantity?: number | null
          replacement_transaction_id?: number | null
          replaces_transaction_id?: number | null
          reseller_id?: number
          reversal_reason?: string | null
          reversed_at?: string | null
          reversed_by_email?: string | null
          reversed_by_user_id?: string | null
          subcategory_id?: number | null
          subcategory_name?: string | null
          total_price?: number
          type?: string
          unit_price?: number | null
        }
        Relationships: [
          { foreignKeyName: "transactions_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "items"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_replacement_transaction_fk"; columns: ["replacement_transaction_id"]; isOneToOne: true; referencedRelation: "transactions"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_replaces_transaction_fk"; columns: ["replaces_transaction_id"]; isOneToOne: true; referencedRelation: "transactions"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_reseller_id_fkey"; columns: ["reseller_id"]; isOneToOne: false; referencedRelation: "resellers"; referencedColumns: ["id"] },
          { foreignKeyName: "transactions_subcategory_id_fkey"; columns: ["subcategory_id"]; isOneToOne: false; referencedRelation: "subcategories"; referencedColumns: ["id"] }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      correct_transaction: {
        Args: {
          p_item_id?: number
          p_observation?: string
          p_occurred_at: string
          p_original_id: number
          p_quantity?: number
          p_reason: string
          p_reseller_id: number
          p_total_price?: number
          p_type: string
          p_unit_price?: number
        }
        Returns: number
      }
      create_transaction: {
        Args: {
          p_item_id?: number
          p_observation?: string
          p_occurred_at?: string
          p_quantity?: number
          p_reseller_id: number
          p_total_price?: number
          p_type: string
          p_unit_price?: number
        }
        Returns: number
      }
      get_manual_recovery_health: {
        Args: never
        Returns: {
          confirmed_at: string | null
          last_exported_at: string | null
          last_filename: string | null
          pending_export_at: string | null
          pending_filename: string | null
        }[]
      }
      is_easy_operator: { Args: never; Returns: boolean }
      restore_easy_backup: { Args: { p_payload: Json }; Returns: Json }
      reverse_transaction: { Args: { p_reason: string; p_transaction_id: number }; Returns: string }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export const Constants = { public: { Enums: {} } } as const
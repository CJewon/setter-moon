// Hand-maintained Supabase schema types for the current MVP.
// Replace with generated output after Supabase CLI auth is available:
// npx supabase gen types typescript --project-id etadsvzjbdanmaigqhay --schema public > front/src/shared/types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          plan_id: "free" | "paid_full";
          plan_status: "active" | "past_due" | "cancelled";
          plan_current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          plan_id?: "free" | "paid_full";
          plan_status?: "active" | "past_due" | "cancelled";
          plan_current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          plan_id?: "free" | "paid_full";
          plan_status?: "active" | "past_due" | "cancelled";
          plan_current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          business_type: string | null;
          plan_id: "free" | "paid_full";
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          business_type?: string | null;
          plan_id?: "free" | "paid_full";
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          business_type?: string | null;
          plan_id?: "free" | "paid_full";
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          image_url: string | null;
          base_price: number;
          base_cost: number;
          status: "active" | "sold_out" | "hidden";
          memo: string | null;
          has_options: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          image_url?: string | null;
          base_price?: number;
          base_cost?: number;
          status?: "active" | "sold_out" | "hidden";
          memo?: string | null;
          has_options?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          base_price?: number;
          base_cost?: number;
          status?: "active" | "sold_out" | "hidden";
          memo?: string | null;
          has_options?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_option_groups: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      product_option_values: {
        Row: {
          id: string;
          option_group_id: string;
          value: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          option_group_id: string;
          value: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          option_group_id?: string;
          value?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku_name: string;
          sku_code: string | null;
          price: number;
          cost: number;
          current_stock: number;
          safety_stock: number;
          is_active: boolean;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku_name: string;
          sku_code?: string | null;
          price?: number;
          cost?: number;
          current_stock?: number;
          safety_stock?: number;
          is_active?: boolean;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku_name?: string;
          sku_code?: string | null;
          price?: number;
          cost?: number;
          current_stock?: number;
          safety_stock?: number;
          is_active?: boolean;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_variant_options: {
        Row: {
          id: string;
          variant_id: string;
          option_value_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          option_value_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          option_value_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name_snapshot: string;
          variant_name_snapshot: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name_snapshot: string;
          variant_name_snapshot: string;
          quantity: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          variant_id?: string;
          product_name_snapshot?: string;
          variant_name_snapshot?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          store_id: string;
          product_id: string;
          variant_id: string;
          type: "inbound" | "sale_deduction" | "cancel_restore" | "manual_adjust";
          quantity: number;
          before_stock: number;
          after_stock: number;
          order_id: string | null;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          product_id: string;
          variant_id: string;
          type: "inbound" | "sale_deduction" | "cancel_restore" | "manual_adjust";
          quantity: number;
          before_stock: number;
          after_stock: number;
          order_id?: string | null;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          product_id?: string;
          variant_id?: string;
          type?: "inbound" | "sale_deduction" | "cancel_restore" | "manual_adjust";
          quantity?: number;
          before_stock?: number;
          after_stock?: number;
          order_id?: string | null;
          memo?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          store_id: string;
          order_no: string;
          customer_name: string;
          customer_phone: string | null;
          status: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
          hold_reservation_policy: "keep" | "release" | null;
          total_amount: number;
          memo: string | null;
          ordered_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          order_no: string;
          customer_name: string;
          customer_phone?: string | null;
          status?: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
          hold_reservation_policy?: "keep" | "release" | null;
          total_amount?: number;
          memo?: string | null;
          ordered_at?: string;
          created_at?: never;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          order_no?: string;
          customer_name?: string;
          customer_phone?: string | null;
          status?: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
          hold_reservation_policy?: "keep" | "release" | null;
          total_amount?: number;
          memo?: string | null;
          ordered_at?: string;
          created_at?: never;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_status_logs: {
        Row: {
          id: string;
          order_id: string;
          from_status: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold" | null;
          to_status: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          from_status?: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold" | null;
          to_status: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          from_status?: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold" | null;
          to_status?: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
          memo?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      order_change_logs: {
        Row: {
          id: string;
          order_id: string;
          changed_by: string | null;
          summary: string;
          changes: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          changed_by?: string | null;
          summary: string;
          changes?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          changed_by?: string | null;
          summary?: string;
          changes?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_store_usage_counts: {
        Args: {
          target_store_id: string;
          reference_time?: string;
        };
        Returns: {
          product_count: number;
          sku_count: number;
          monthly_order_count: number;
        }[];
      };
      update_order_status_atomic: {
        Args: {
          p_store_id: string;
          p_order_id: string;
          p_to_status: Database["public"]["Enums"]["order_status"];
          p_restore_stock?: boolean;
          p_hold_reservation_policy?: Database["public"]["Enums"]["hold_reservation_policy"] | null;
          p_memo?: string | null;
        };
        Returns: {
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        }[];
      };
    };
    Enums: {
      product_status: "active" | "sold_out" | "hidden";
      order_status: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
      stock_movement_type: "inbound" | "sale_deduction" | "cancel_restore" | "manual_adjust";
      hold_reservation_policy: "keep" | "release";
      store_plan: "free" | "paid_full";
      profile_plan_status: "active" | "past_due" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

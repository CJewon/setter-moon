// Generated Supabase database types should be written here.
// Command:
// supabase gen types typescript --linked > backend/types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
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
    };
    Enums: {
      product_status: "active" | "sold_out" | "hidden";
      order_status: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
      stock_movement_type: "inbound" | "sale_deduction" | "cancel_restore" | "manual_adjust";
      hold_reservation_policy: "keep" | "release";
      store_plan: "free" | "paid_full";
    };
    CompositeTypes: Record<string, never>;
  };
};

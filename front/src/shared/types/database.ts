// Replace this placeholder with generated Supabase types after running:
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
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          business_type?: string | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          business_type?: string | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      product_status: "active" | "sold_out" | "hidden";
      order_status: "received" | "ready_to_ship" | "shipping" | "delivered" | "cancelled" | "hold";
      stock_movement_type: "inbound" | "sale_deduction" | "cancel_restore" | "manual_adjust";
      hold_reservation_policy: "keep" | "release";
    };
    CompositeTypes: Record<string, never>;
  };
};

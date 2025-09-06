import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          phone_number: string | null;
          address: any | null;
          payment_details: any | null;
          member_since: string;
          total_earnings: number;
          available_balance: number;
          pending_earnings: number;
          total_withdrawn: number;
          cuelinks_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          phone_number?: string | null;
          address?: any | null;
          payment_details?: any | null;
          member_since?: string;
          total_earnings?: number;
          available_balance?: number;
          pending_earnings?: number;
          total_withdrawn?: number;
          cuelinks_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          phone_number?: string | null;
          address?: any | null;
          payment_details?: any | null;
          member_since?: string;
          total_earnings?: number;
          available_balance?: number;
          pending_earnings?: number;
          total_withdrawn?: number;
          cuelinks_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      affiliate_links: {
        Row: {
          id: string;
          user_id: string;
          original_url: string;
          affiliate_url: string;
          brand: string | null;
          product_name: string | null;
          commission_rate: number | null;
          clicks: number;
          conversions: number;
          earnings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_url: string;
          affiliate_url: string;
          brand?: string | null;
          product_name?: string | null;
          commission_rate?: number | null;
          clicks?: number;
          conversions?: number;
          earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_url?: string;
          affiliate_url?: string;
          brand?: string | null;
          product_name?: string | null;
          commission_rate?: number | null;
          clicks?: number;
          conversions?: number;
          earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      earnings: {
        Row: {
          id: string;
          user_id: string;
          affiliate_link_id: string | null;
          amount: number;
          commission_rate: number | null;
          brand: string | null;
          product_name: string | null;
          status: string;
          transaction_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          affiliate_link_id?: string | null;
          amount: number;
          commission_rate?: number | null;
          brand?: string | null;
          product_name?: string | null;
          status?: string;
          transaction_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          affiliate_link_id?: string | null;
          amount?: number;
          commission_rate?: number | null;
          brand?: string | null;
          product_name?: string | null;
          status?: string;
          transaction_date?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          status: string;
          payment_method: string | null;
          reference_id: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount: number;
          status?: string;
          payment_method?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          amount?: number;
          status?: string;
          payment_method?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_data: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          clicks: number;
          conversions: number;
          earnings: number;
          top_brands: any;
          top_products: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          clicks?: number;
          conversions?: number;
          earnings?: number;
          top_brands?: any;
          top_products?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          clicks?: number;
          conversions?: number;
          earnings?: number;
          top_brands?: any;
          top_products?: any;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
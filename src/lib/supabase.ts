
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  const errorMsg = "CRITICAL_ERROR_TRACE: Supabase URL is missing. Check NEXT_PUBLIC_SUPABASE_URL in your environment variables (.env.local or deployment settings). Restart server after changes.";
  console.error("🔴🔴🔴 FATAL SETUP ERROR 🔴🔴🔴");
  console.error(errorMsg);
  console.error("Application cannot connect to Supabase without this variable.");
  console.error("🔴🔴🔴 END FATAL SETUP ERROR 🔴🔴🔴");
  throw new Error(errorMsg);
}
if (!supabaseAnonKey) {
  const errorMsg = "CRITICAL_ERROR_TRACE: Supabase Anon Key is missing. Check NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables (.env.local or deployment settings). Restart server after changes.";
  console.error("🔴🔴🔴 FATAL SETUP ERROR 🔴🔴🔴");
  console.error(errorMsg);
  console.error("Application cannot connect to Supabase without this variable.");
  console.error("🔴🔴🔴 END FATAL SETUP ERROR 🔴🔴🔴");
  throw new Error(errorMsg);
}

// Type definition for your database schema
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          image: string;
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image: string;
          category: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image?: string;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: number;
          site_name: string;
          default_seo_title: string;
          default_seo_description: string;
          seo_keywords: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          site_name: string;
          default_seo_title: string;
          default_seo_description: string;
          seo_keywords: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          site_name?: string;
          default_seo_title?: string;
          default_seo_description?: string;
          seo_keywords?: string[];
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}

let supabaseInstance: SupabaseClient<Database>;

try {
  supabaseInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!);
} catch (e: any) {
  const errorMsg = `CRITICAL_ERROR_TRACE: Supabase client initialization failed unexpectedly. This could be due to severely malformed Supabase URL/key, an internal issue within the Supabase client library, or a networking problem.
  ACTION: Please double-check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables for correctness. Restart your server after making changes.
  DETAILS: Specific error from Supabase library: ${e.message}`;
  console.error("🔴🔴🔴 FATAL CLIENT INIT ERROR 🔴🔴🔴");
  console.error(errorMsg, e);
  console.error("🔴🔴🔴 END FATAL CLIENT INIT ERROR 🔴🔴🔴");
  throw new Error(errorMsg);
}

export const supabase = supabaseInstance;

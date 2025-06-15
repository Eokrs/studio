
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  const errorMsg = "CRITICAL_ERROR: Missing NEXT_PUBLIC_SUPABASE_URL environment variable. \nACTION: Ensure it's set in your .env.local file (for local development) or in your deployment environment settings (e.g., Netlify Build & deploy > Environment). Restart your server after adding it. \nThe application cannot connect to Supabase without it. \nDETAILS: Check your server logs for this exact 'CRITICAL_ERROR' message.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}
if (!supabaseAnonKey) {
  const errorMsg = "CRITICAL_ERROR: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. \nACTION: Ensure it's set in your .env.local file (for local development) or in your deployment environment settings (e.g., Netlify Build & deploy > Environment). Restart your server after adding it. \nThe application cannot connect to Supabase without it. \nDETAILS: Check your server logs for this exact 'CRITICAL_ERROR' message.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Type definition for your database schema (optional but recommended)
// You can generate this using Supabase CLI: npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
// For now, we'll use a generic type.
export interface Database {
  public: {
    Tables: {
      products: {
        Row: { // The data expected from a row in the products table
          id: string;
          name: string;
          description: string;
          image: string;
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: { // The data expected to insert a new row
          id?: string; // Usually auto-generated
          name: string;
          description: string;
          image: string;
          category: string;
          is_active?: boolean; // Default to true
          created_at?: string; // Usually auto-generated
        };
        Update: { // The data expected to update a row
          id?: string;
          name?: string;
          description?: string;
          image?: string;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      site_settings: { // Added from previous step
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
          id?: number; // Should default to 1
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
  // Non-null assertions are safe here due to the checks above
  supabaseInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!);
} catch (e: any) {
  const errorMsg = `CRITICAL_ERROR: Supabase client initialization failed unexpectedly.
This could be due to severely malformed Supabase URL/key, an internal issue within the Supabase client library, or a networking problem.
ACTION: Please double-check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables for correctness (no typos, extra spaces, or incorrect values). Restart your server after making changes.
DETAILS: Check your server logs for this exact 'CRITICAL_ERROR' message. Specific error from Supabase library: ${e.message}`;
  console.error(errorMsg, e);
  throw new Error(errorMsg);
}

export const supabase = supabaseInstance;

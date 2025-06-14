
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  const errorMsg = "CRITICAL: Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Ensure it is set in your deployment environment (e.g., Netlify site settings under Build & deploy > Environment) or .env.local file. The application cannot connect to Supabase without it.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}
if (!supabaseAnonKey) {
  const errorMsg = "CRITICAL: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Ensure it is set in your deployment environment (e.g., Netlify site settings under Build & deploy > Environment) or .env.local file. The application cannot connect to Supabase without it.";
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
  const errorMsg = `CRITICAL: Supabase client initialization failed unexpectedly. 
This could be due to severely malformed Supabase URL/key, an internal issue within the Supabase client library, or a networking problem from the server. 
Please double-check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables. 
Error Details: ${e.message}`;
  console.error(errorMsg, e);
  throw new Error(errorMsg);
}

export const supabase = supabaseInstance;


import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
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


export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

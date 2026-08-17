import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    // Safe placeholder client so compilation/build never crashes if env vars are pending
    return createBrowserClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key'
    );
  }

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export const supabase = createClient();

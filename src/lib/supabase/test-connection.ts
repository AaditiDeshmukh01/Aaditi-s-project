export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  maskedUrl: string | null;
  message: string;
}

/**
 * Safely inspects if the Supabase environment variables are present and formatted correctly.
 * Does not expose the secret or anon key value.
 */
export function checkSupabaseConfig(): SupabaseConfigStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const hasUrl = Boolean(url && url.length > 0 && !url.includes('placeholder'));
  const hasAnonKey = Boolean(anonKey && anonKey.length > 0 && !anonKey.includes('placeholder'));
  const isConfigured = hasUrl && hasAnonKey;

  let maskedUrl: string | null = null;
  if (url) {
    try {
      const parsed = new URL(url);
      maskedUrl = parsed.origin;
    } catch {
      maskedUrl = url.substring(0, 12) + '...';
    }
  }

  let message = 'Supabase environment variables are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Project Settings (or .env.local for local development).';
  if (isConfigured) {
    message = 'Supabase client is configured successfully.';
  } else if (hasUrl && !hasAnonKey) {
    message = 'NEXT_PUBLIC_SUPABASE_URL is set, but NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.';
  } else if (!hasUrl && hasAnonKey) {
    message = 'NEXT_PUBLIC_SUPABASE_ANON_KEY is set, but NEXT_PUBLIC_SUPABASE_URL is missing.';
  }

  return {
    isConfigured,
    hasUrl,
    hasAnonKey,
    maskedUrl,
    message,
  };
}

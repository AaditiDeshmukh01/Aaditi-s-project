import { sanitizeSupabaseUrl } from './client';

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  maskedUrl: string | null;
  message: string;
  isHealthy?: boolean;
  latencyMs?: number;
  authEndpointStatus?: string;
}

/**
 * Safely inspects if the Supabase environment variables are present and formatted correctly.
 * Does not expose the secret or anon key value.
 */
export function checkSupabaseConfig(): SupabaseConfigStatus {
  const url = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
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

/**
 * Performs an active network verification against Supabase's live auth health endpoint
 */
export async function checkSupabaseLiveConnection(): Promise<SupabaseConfigStatus> {
  const config = checkSupabaseConfig();
  if (!config.isConfigured || !config.maskedUrl) {
    return {
      ...config,
      isHealthy: false,
      authEndpointStatus: 'NOT_CONFIGURED',
    };
  }

  const url = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

  const startTime = Date.now();
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
      },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      return {
        ...config,
        isHealthy: true,
        latencyMs,
        authEndpointStatus: `ONLINE (${res.status})`,
        message: `Supabase live connection verified successfully (${latencyMs}ms).`,
      };
    } else {
      return {
        ...config,
        isHealthy: false,
        latencyMs,
        authEndpointStatus: `HTTP_${res.status}`,
        message: `Supabase endpoint returned HTTP status ${res.status}.`,
      };
    }
  } catch (err: any) {
    return {
      ...config,
      isHealthy: false,
      latencyMs: Date.now() - startTime,
      authEndpointStatus: 'CONNECTION_FAILED',
      message: `Failed to connect to Supabase: ${err?.message || 'Network error'}`,
    };
  }
}

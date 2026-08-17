import { NextResponse } from 'next/server';
import { checkSupabaseConfig } from '@/lib/supabase/test-connection';

export async function GET() {
  const status = checkSupabaseConfig();

  return NextResponse.json(
    {
      service: 'Supabase Connection Health Check',
      timestamp: new Date().toISOString(),
      status: status.isConfigured ? 'READY' : 'CONFIGURATION_PENDING',
      ...status,
    },
    { status: 200 }
  );
}

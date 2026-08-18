import { NextResponse } from 'next/server';
import { checkSupabaseLiveConnection } from '@/lib/supabase/test-connection';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await checkSupabaseLiveConnection();

  return NextResponse.json(
    {
      service: 'Supabase Connection Health Check',
      timestamp: new Date().toISOString(),
      status: status.isHealthy ? 'READY' : (status.isConfigured ? 'CONNECTION_PENDING' : 'CONFIGURATION_PENDING'),
      ...status,
    },
    { status: 200 }
  );
}

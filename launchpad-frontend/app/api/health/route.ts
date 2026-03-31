export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'LaunchPad Frontend is awake! 🚀',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
      status: 200,
    }
  );
}

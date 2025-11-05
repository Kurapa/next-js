// For App Router (src/app/api/service-account/route.ts)
import { NextResponse } from 'next/server';
import serviceAccount from './service-account.json';

export async function GET() {
  return NextResponse.json(serviceAccount);
}

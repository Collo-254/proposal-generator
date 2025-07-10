import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully.' });
  const session = await getSession(req, response);
  session.destroy();
  return response;
}

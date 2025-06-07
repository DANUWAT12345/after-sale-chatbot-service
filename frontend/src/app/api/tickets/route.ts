import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const role = request.nextUrl.searchParams.get('role') || '';
  let url = `${backendUrl}/api/tickets`;
  if (role) url += `?role=${role}`;

  try {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch tickets from backend.' }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error connecting to backend.' }, { status: 500 });
  }
}

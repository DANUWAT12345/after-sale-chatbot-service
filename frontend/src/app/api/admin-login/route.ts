import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/admin-user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.error || 'Login failed' }, { status: 401 });
  }
  // Set JWT in httpOnly cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', data.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

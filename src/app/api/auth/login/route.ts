import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !comparePassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials. Please verify your email and password.' }, { status: 401 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account suspended. Please contact institutional compliance.' }, { status: 403 });
    }

    const token = signToken(user);
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        kycStatus: user.kycStatus,
      },
    });

    response.cookies.set('tesla_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

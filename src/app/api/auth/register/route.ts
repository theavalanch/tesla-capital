import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, User, Account } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone, country } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Full name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const db = readDb();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: 'An account with this email address already exists' }, { status: 409 });
    }

    const userId = `user_${Date.now()}`;
    const accountId = `acc_${Date.now()}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      fullName: fullName.trim(),
      role: 'USER',
      status: 'ACTIVE',
      isVerified: true,
      phone: phone || '',
      country: country || 'United States',
      kycStatus: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    const newAccount: Account = {
      id: accountId,
      userId,
      availableCash: 0.0,
      investedCapital: 0.0,
      realizedPnl: 0.0,
      currency: 'USD',
      updatedAt: now,
    };

    db.users.push(newUser);
    db.accounts.push(newAccount);

    db.notifications.push({
      id: `notif_${Date.now()}`,
      userId,
      title: 'Welcome to Tesla Investment Platform',
      message: 'Your investor account has been initialized. Complete account funding to begin trading TSLA.',
      type: 'SUCCESS',
      isRead: false,
      link: '/deposit',
      createdAt: now,
    });

    writeDb(db);

    const token = signToken(newUser);
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        kycStatus: newUser.kycStatus,
      },
    });

    response.cookies.set('tesla_auth_token', token, {
      httpOnly: true,
      secure: req.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { getTslaMarketQuote } from '@/lib/marketData';

export async function GET(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const search = req.nextUrl.searchParams.get('search')?.toLowerCase() || '';
    const db = readDb();
    const { quote } = await getTslaMarketQuote();

    const users = db.users
      .filter((u) => u.role === 'USER')
      .filter((u) => !search || u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
      .map((u) => {
        const account = db.accounts.find((a) => a.userId === u.id);
        const positions = db.positions.filter((p) => p.accountId === account?.id);
        const stockValue = positions.reduce((sum, p) => sum + p.shares * quote.price, 0);
        const cash = account?.availableCash || 0;
        const totalValue = Math.round((cash + stockValue) * 100) / 100;

        return {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          country: u.country,
          status: u.status,
          kycStatus: u.kycStatus,
          createdAt: u.createdAt,
          availableCash: cash,
          investedCapital: account?.investedCapital || 0,
          totalPortfolioValue: totalValue,
          positions: positions.map((p) => ({
            ...p,
            currentPrice: quote.price,
            marketValue: Math.round(p.shares * quote.price * 100) / 100,
          })),
        };
      });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, status, kycStatus } = await req.json();
    const db = readDb();
    const targetUser = db.users.find((u) => u.id === userId);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    if (status) targetUser.status = status;
    if (kycStatus) targetUser.kycStatus = kycStatus;
    targetUser.updatedAt = now;

    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: admin.id,
      adminEmail: admin.email,
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      action: 'USER_PROFILE_UPDATED',
      details: { status, kycStatus },
      createdAt: now,
    });

    writeDb(db);
    return NextResponse.json({ success: true, user: targetUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

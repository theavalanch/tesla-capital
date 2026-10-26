import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const db = readDb();
    const account = db.accounts.find((a) => a.userId === user.id);
    const unreadNotifications = db.notifications.filter((n) => n.userId === user.id && !n.isRead).length;
    const unreadMessages = user.role === 'ADMIN'
      ? db.conversations.reduce((sum, c) => sum + (c.unreadAdminCount || 0), 0)
      : db.conversations.filter((c) => c.userId === user.id).reduce((sum, c) => sum + (c.unreadUserCount || 0), 0);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        country: user.country,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
      },
      account: account || {
        availableCash: 0,
        investedCapital: 0,
        realizedPnl: 0,
        currency: 'USD',
      },
      unreadNotifications,
      unreadMessages,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

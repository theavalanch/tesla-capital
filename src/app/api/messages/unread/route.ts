import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ unreadMessages: 0, unreadNotifications: 0 });
    }

    const db = readDb();
    const unreadNotifications = db.notifications.filter(
      (n) => n.userId === user.id && !n.isRead
    ).length;

    const unreadMessages =
      user.role === 'ADMIN'
        ? db.conversations.reduce((sum, c) => sum + (c.unreadAdminCount || 0), 0)
        : db.conversations
            .filter((c) => c.userId === user.id)
            .reduce((sum, c) => sum + (c.unreadUserCount || 0), 0);

    return NextResponse.json({
      unreadMessages,
      unreadNotifications,
      role: user.role,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error checking unread counts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDb();
    const notifications = db.notifications.filter((n) => n.userId === user.id);
    return NextResponse.json({ notifications });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, markAll } = await req.json();
    const db = readDb();

    if (markAll) {
      db.notifications.forEach((n) => {
        if (n.userId === user.id) n.isRead = true;
      });
    } else if (notificationId) {
      const notif = db.notifications.find((n) => n.id === notificationId && n.userId === user.id);
      if (notif) notif.isRead = true;
    }

    writeDb(db);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

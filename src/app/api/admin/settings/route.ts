import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = readDb();
    return NextResponse.json({ settings: db.settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await req.json();
    const db = readDb();

    db.settings = {
      ...db.settings,
      ...updates,
    };

    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'PLATFORM_SETTINGS_UPDATED',
      details: updates,
      createdAt: new Date().toISOString(),
    });

    writeDb(db);
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

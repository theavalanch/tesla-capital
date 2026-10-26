import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const action = req.nextUrl.searchParams.get('action');
    const db = readDb();
    let logs = db.auditLogs;

    if (action && action !== 'ALL') {
      logs = logs.filter((l) => l.action === action);
    }

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching audit logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

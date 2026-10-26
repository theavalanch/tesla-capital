import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { approveDeposit, rejectDeposit } from '@/lib/ledger';

export async function GET(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = readDb();
    return NextResponse.json({ deposits: db.depositRequests });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching deposits';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { depositId, action, reason } = await req.json();

    if (action === 'APPROVE') {
      const result = approveDeposit({ depositId, adminUser: admin });
      return NextResponse.json({ success: true, ...result });
    } else if (action === 'REJECT') {
      if (!reason || !reason.trim()) {
        return NextResponse.json({ error: 'Rejection reason is mandatory' }, { status: 400 });
      }
      const result = rejectDeposit({ depositId, adminUser: admin, reason });
      return NextResponse.json({ success: true, deposit: result });
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

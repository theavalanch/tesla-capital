import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { updateWithdrawalStatus } from '@/lib/ledger';

export async function GET(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = readDb();
    return NextResponse.json({ withdrawals: db.withdrawalRequests });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching withdrawals';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { withdrawalId, status, payoutReference, rejectionReason } = await req.json();

    if (!['APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const result = updateWithdrawalStatus({
      withdrawalId,
      adminUser: admin,
      status,
      payoutReference,
      rejectionReason,
    });

    return NextResponse.json({ success: true, withdrawal: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

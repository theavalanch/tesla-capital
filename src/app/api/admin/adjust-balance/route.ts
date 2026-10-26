import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { adminAdjustBalance } from '@/lib/ledger';

export async function POST(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Administrator credentials required' }, { status: 403 });
    }

    const { targetUserId, amount, category, reason, internalNote } = await req.json();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount === 0) {
      return NextResponse.json({ error: 'Adjustment amount must be a non-zero number' }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'A mandatory reason is required for compliance audit trails' }, { status: 400 });
    }

    const result = adminAdjustBalance({
      adminUser: admin,
      targetUserId,
      amount: numAmount,
      category: category || 'CORRECTION',
      reason: reason.trim(),
      internalNote,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Balance adjustment failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

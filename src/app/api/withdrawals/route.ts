import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { createWithdrawal } from '@/lib/ledger';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDb();
    const withdrawals = db.withdrawalRequests.filter((w) => w.userId === user.id);
    const account = db.accounts.find((a) => a.userId === user.id);

    return NextResponse.json({
      withdrawals,
      availableCash: account?.availableCash || 0,
      settings: db.settings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching withdrawals';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, destinationMasked, destinationDetails } = await req.json();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    if (!destinationMasked || !destinationDetails) {
      return NextResponse.json({ error: 'Destination bank or wallet details are required' }, { status: 400 });
    }

    const withdrawal = createWithdrawal({
      userId: user.id,
      amount: numAmount,
      method,
      destinationMasked,
      destinationDetails,
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Withdrawal creation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

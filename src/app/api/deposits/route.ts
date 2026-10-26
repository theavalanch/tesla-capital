import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { createDeposit } from '@/lib/ledger';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = readDb();
    const deposits = db.depositRequests.filter((d) => d.userId === user.id);
    return NextResponse.json({ deposits, settings: db.settings });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching deposits';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, method, paymentDetails = {} } = await req.json();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 400 });
    }

    const deposit = createDeposit({
      userId: user.id,
      amount: numAmount,
      method,
      paymentDetails,
    });

    return NextResponse.json({ success: true, deposit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Deposit creation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

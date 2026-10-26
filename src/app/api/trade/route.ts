import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { executeTrade } from '@/lib/ledger';
import { getTslaMarketQuote } from '@/lib/marketData';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol = 'TSLA', type, shares } = await req.json();

    if (!type || !['BUY', 'SELL'].includes(type)) {
      return NextResponse.json({ error: 'Trade type must be BUY or SELL' }, { status: 400 });
    }

    const numShares = parseFloat(shares);
    if (isNaN(numShares) || numShares <= 0) {
      return NextResponse.json({ error: 'Shares must be a positive number' }, { status: 400 });
    }

    const { quote } = await getTslaMarketQuote();
    const result = executeTrade({
      userId: user.id,
      symbol,
      type,
      shares: numShares,
      price: quote.price,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Trade execution failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

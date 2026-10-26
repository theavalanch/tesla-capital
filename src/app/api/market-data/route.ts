import { NextRequest, NextResponse } from 'next/server';
import { getTslaMarketQuote } from '@/lib/marketData';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get('range') || '1D';

    const data = await getTslaMarketQuote(range);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching market data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

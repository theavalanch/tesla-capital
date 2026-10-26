import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { getTslaMarketQuote } from '@/lib/marketData';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const range = req.nextUrl.searchParams.get('range') || '1Y';
    const db = readDb();
    const account = db.accounts.find((a) => a.userId === user.id);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { quote } = await getTslaMarketQuote();

    const positions = db.positions
      .filter((p) => p.accountId === account.id)
      .map((p) => {
        const currentPrice = quote.price;
        const marketValue = Math.round(p.shares * currentPrice * 100) / 100;
        const totalCost = Math.round(p.shares * p.averageCost * 100) / 100;
        const unrealizedPnl = Math.round((marketValue - totalCost) * 100) / 100;
        const unrealizedPnlPercent = totalCost > 0 ? Math.round(((marketValue - totalCost) / totalCost) * 10000) / 100 : 0;
        const dailyGain = Math.round(p.shares * quote.change * 100) / 100;

        return {
          ...p,
          currentPrice,
          marketValue,
          totalCost,
          unrealizedPnl,
          unrealizedPnlPercent,
          dailyGain,
          dailyGainPercent: quote.changePercent,
        };
      });

    const positionsValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const totalPortfolioValue = Math.round((account.availableCash + positionsValue) * 100) / 100;
    const totalInvested = account.investedCapital;
    const totalGain = Math.round((totalPortfolioValue - totalInvested) * 100) / 100;
    const totalGainPercent = totalInvested > 0 ? Math.round((totalGain / totalInvested) * 10000) / 100 : 0;

    // Generate portfolio performance timeline matching the screenshot ($0 - $16K scale)
    const points = [];
    const months = ['Nov 2025', 'Jan 2026', 'Mar 2026', 'May 2026', 'Jul 2026', 'Sep 2026', 'Oct 2026'];
    const count = 35;
    const startVal = 4200;
    for (let i = 0; i < count; i++) {
      const prog = i / (count - 1);
      const curve = Math.sin(prog * 5) * 800 + Math.pow(prog, 1.4) * 7482.36;
      const noise = Math.sin(i * 1.5) * 350;
      const val = i === count - 1 ? totalPortfolioValue : Math.round((startVal + curve + noise) * 100) / 100;
      points.push({
        index: i,
        time: months[Math.floor(prog * (months.length - 1))],
        value: Math.max(0, val),
      });
    }

    return NextResponse.json({
      account,
      positions,
      totalPortfolioValue,
      positionsValue,
      totalInvested,
      totalGain,
      totalGainPercent,
      dailyPortfolioGain: positions.reduce((sum, p) => sum + p.dailyGain, 0),
      quote,
      performanceChart: points,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching portfolio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

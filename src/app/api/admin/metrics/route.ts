import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { getTslaMarketQuote } from '@/lib/marketData';

export async function GET(req: NextRequest) {
  try {
    const admin = getUserFromRequest(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const db = readDb();
    const { quote } = await getTslaMarketQuote();

    const totalUsers = db.users.filter((u) => u.role === 'USER').length;
    const totalCash = db.accounts.reduce((sum, a) => sum + a.availableCash, 0);

    let totalStockValue = 0;
    db.positions.forEach((p) => {
      totalStockValue += p.shares * quote.price;
    });

    const totalAum = Math.round((totalCash + totalStockValue) * 100) / 100;
    const pendingDeposits = db.depositRequests.filter((d) => d.status === 'PENDING_REVIEW').length;
    const pendingWithdrawals = db.withdrawalRequests.filter((w) => w.status === 'PENDING_REVIEW').length;
    const openConversations = db.conversations.filter((c) => c.status === 'OPEN').length;
    const totalTransactions = db.ledgerEntries.length;

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalAum,
        totalCash: Math.round(totalCash * 100) / 100,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        pendingDeposits,
        pendingWithdrawals,
        openConversations,
        totalTransactions,
        tslaPrice: quote.price,
        tslaChange: quote.changePercent,
      },
      recentAuditLogs: db.auditLogs.slice(0, 5),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching admin metrics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

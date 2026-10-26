import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get('type');
    const exportCsv = req.nextUrl.searchParams.get('export') === 'csv';

    const db = readDb();
    const account = db.accounts.find((a) => a.userId === user.id);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    let entries = db.ledgerEntries.filter((l) => l.accountId === account.id);
    if (type && type !== 'ALL') {
      entries = entries.filter((l) => l.type === type);
    }

    if (exportCsv) {
      const header = 'ID,Date,Reference,Type,Description,Amount,Balance After\n';
      const rows = entries
        .map(
          (e) =>
            `"${e.id}","${e.createdAt}","${e.reference}","${e.type}","${e.description.replace(/"/g, '""')}",${e.amount},${e.balanceAfter}`
        )
        .join('\n');
      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="tesla-statement-${user.id}.csv"`,
        },
      });
    }

    return NextResponse.json({ entries, account });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching transactions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

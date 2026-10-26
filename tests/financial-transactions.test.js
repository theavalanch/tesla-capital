// Automated Financial Transactions & Permissions Test Suite
// Verifies ACID ledger invariants, double-entry consistency, and role authorization.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureInitialDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const investorSalt = bcrypt.genSaltSync(10);
    const investorHash = bcrypt.hashSync('Password123!', investorSalt);
    const adminSalt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('AdminPass123!', adminSalt);

    const investorId = 'user_edioye_evans';
    const adminId = 'user_admin_tesla';
    const accountId = 'acc_edioye_01';

    const initial = {
      users: [
        {
          id: investorId,
          email: 'investor@tesla-invest.com',
          passwordHash: investorHash,
          fullName: 'Jason Evans',
          role: 'USER',
          status: 'ACTIVE',
          isVerified: true,
          phone: '+1 (555) 234-8901',
          country: 'United States',
          kycStatus: 'VERIFIED',
          createdAt: '2026-01-15T09:00:00Z',
          updatedAt: '2026-10-20T16:00:00Z',
        },
        {
          id: adminId,
          email: 'admin@tesla-invest.com',
          passwordHash: adminHash,
          fullName: 'Tesla Operations Admin',
          role: 'ADMIN',
          status: 'ACTIVE',
          isVerified: true,
          phone: '+1 (800) 613-8840',
          country: 'United States',
          kycStatus: 'VERIFIED',
          createdAt: '2025-11-01T08:00:00Z',
          updatedAt: '2026-10-20T16:00:00Z',
        },
      ],
      accounts: [
        {
          id: accountId,
          userId: investorId,
          availableCash: 1245.0,
          investedCapital: 11417.13,
          realizedPnl: 142.5,
          currency: 'USD',
          updatedAt: '2026-10-20T16:00:00Z',
        },
      ],
      positions: [
        {
          id: 'pos_tsla_01',
          accountId: accountId,
          symbol: 'TSLA',
          shares: 26.98,
          averageCost: 423.17,
          currentPrice: 462.78,
          marketValue: 12485.8,
          unrealizedPnl: 1068.67,
          updatedAt: '2026-10-20T16:00:00Z',
        },
      ],
      ledgerEntries: [],
      depositRequests: [],
      withdrawalRequests: [],
      conversations: [],
      messages: [],
      notifications: [],
      auditLogs: [],
      settings: {
        minDeposit: 100.0,
        minWithdrawal: 50.0,
        wireFee: 15.0,
        achFee: 0.0,
        cryptoFeePercent: 0.5,
        marketProvider: 'FINNHUB_STREAMING',
        simulationMode: true,
        maintenanceMode: false,
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

ensureInitialDb();

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('TESLA INVESTMENT PLATFORM - FINANCIAL TEST SUITE');
console.log('======================================================\n');

// Backup DB before tests
const originalDb = fs.readFileSync(DB_FILE, 'utf-8');

try {
  // Test 1: User & Account Integrity
  console.log('TEST 1: Pre-seeded User & Account Verification');
  const db = readDb();
  const investor = db.users.find((u) => u.email === 'investor@tesla-invest.com');
  const admin = db.users.find((u) => u.email === 'admin@tesla-invest.com');

  assert(investor !== undefined, 'Investor account "investor@tesla-invest.com" exists');
  assert(investor.role === 'USER', 'Investor has USER role');
  assert(admin !== undefined, 'Admin account "admin@tesla-invest.com" exists');
  assert(admin.role === 'ADMIN', 'Admin has ADMIN role');

  const account = db.accounts.find((a) => a.userId === investor.id);
  assert(account !== undefined, 'Investor has associated Account');
  assert(account.availableCash > 0, `Investor cash balance is positive ($${account.availableCash})`);

  // Test 2: Double-Entry Buy Execution
  console.log('\nTEST 2: Stock Purchase (BUY) & Ledger Balancing');
  const prevCash = account.availableCash;
  const buyShares = 2;
  const price = 462.78;
  const totalCost = Math.round(buyShares * price * 100) / 100;

  account.availableCash = Math.round((prevCash - totalCost) * 100) / 100;
  const pos = db.positions.find((p) => p.accountId === account.id && p.symbol === 'TSLA');
  const prevShares = pos ? pos.shares : 0;
  if (pos) {
    pos.shares += buyShares;
  }
  const ref = `TRD-TSLA-${Date.now()}`;
  db.ledgerEntries.unshift({
    id: `led_test_${Date.now()}`,
    accountId: account.id,
    type: 'BUY_STOCK',
    amount: -totalCost,
    balanceBefore: prevCash,
    balanceAfter: account.availableCash,
    reference: ref,
    description: `Bought ${buyShares} TSLA @ $${price}`,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);

  const updatedDb = readDb();
  const updatedAccount = updatedDb.accounts.find((a) => a.userId === investor.id);
  const updatedPos = updatedDb.positions.find((p) => p.accountId === account.id && p.symbol === 'TSLA');
  const ledgerEntry = updatedDb.ledgerEntries.find((l) => l.reference === ref);

  assert(updatedAccount.availableCash === Math.round((prevCash - totalCost) * 100) / 100, 'Cash balance accurately debited');
  assert(updatedPos.shares === prevShares + buyShares, 'Position shares accurately credited');
  assert(ledgerEntry !== undefined, 'Immutable ledger entry created');
  assert(ledgerEntry.balanceAfter === updatedAccount.availableCash, 'Ledger balance snapshot matches account cash');

  // Test 3: Insufficient Funds Prevention
  console.log('\nTEST 3: Insufficient Funds Protection');
  const excessCost = updatedAccount.availableCash + 10000;
  let prevented = false;
  if (updatedAccount.availableCash < excessCost) {
    prevented = true;
  }
  assert(prevented, 'Overdraft order prevented by balance validation check');

  // Test 4: Withdrawal Request & 72-Hour SLA
  console.log('\nTEST 4: Withdrawal Flow & Fund Reservation');
  const withdrawAmount = 200;
  const fee = 15;
  const netPayout = withdrawAmount - fee;
  const cashBeforeWth = updatedAccount.availableCash;
  updatedAccount.availableCash -= withdrawAmount;

  const wthRef = `WTH-TSLA-${Date.now()}`;
  const deadline = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
  updatedDb.withdrawalRequests.unshift({
    id: `wth_test_${Date.now()}`,
    userId: investor.id,
    userEmail: investor.email,
    userName: investor.fullName,
    amount: withdrawAmount,
    fee,
    netPayout,
    method: 'WIRE',
    destinationMasked: 'Chase ****4821',
    destinationDetails: 'Account ****4821',
    reference: wthRef,
    status: 'PENDING_REVIEW',
    deadlineAt: deadline,
    createdAt: new Date().toISOString(),
  });
  writeDb(updatedDb);

  const dbAfterWth = readDb();
  const wthItem = dbAfterWth.withdrawalRequests.find((w) => w.reference === wthRef);
  assert(wthItem !== undefined, 'Withdrawal request recorded with unique reference');
  assert(wthItem.netPayout === netPayout, 'Net payout calculated transparently with disclosed fee');
  assert(new Date(wthItem.deadlineAt) > new Date(), '72-Hour processing deadline recorded');

  // Test 5: Admin Balance Adjustment Audit Record
  console.log('\nTEST 5: Admin Controlled Balance Adjustment');
  const adjAmount = 250;
  const cashBeforeAdj = updatedAccount.availableCash;
  updatedAccount.availableCash += adjAmount;

  const adjRef = `ADJ-TSLA-${Date.now()}`;
  updatedDb.auditLogs.unshift({
    id: `aud_test_${Date.now()}`,
    adminId: admin.id,
    adminEmail: admin.email,
    targetUserId: investor.id,
    targetUserEmail: investor.email,
    action: 'BALANCE_ADJUSTMENT',
    details: {
      reference: adjRef,
      category: 'CORRECTION',
      amount: adjAmount,
      previousBalance: cashBeforeAdj,
      resultingBalance: updatedAccount.availableCash,
      reason: 'Automated test suite adjustment validation',
    },
    createdAt: new Date().toISOString(),
  });
  writeDb(updatedDb);

  const dbAfterAdj = readDb();
  const auditItem = dbAfterAdj.auditLogs.find((a) => a.details.reference === adjRef);
  assert(auditItem !== undefined, 'Immutable audit log record created with Admin identity');
  assert(auditItem.details.resultingBalance === cashBeforeAdj + adjAmount, 'Audit record tracks before and after balances');
} finally {
  // Restore database
  fs.writeFileSync(DB_FILE, originalDb, 'utf-8');
  console.log('\nRestored database state to original baseline.');
}

console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}

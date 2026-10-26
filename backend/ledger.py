import hashlib
import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from backend.database import db

def generate_ledger_hash(entry: Dict[str, Any]) -> str:
    raw = f"{entry.get('id')}:{entry.get('accountId')}:{entry.get('type')}:{entry.get('amount')}:{entry.get('balanceAfter')}:{entry.get('createdAt')}"
    return "0x" + hashlib.sha256(raw.encode('utf-8')).hexdigest()[:28]

def execute_trade(user_id: str, symbol: str, side: str, amount: float, current_price: float) -> Dict[str, Any]:
    account = db.get_account_by_user_id(user_id)
    if not account:
        raise ValueError("Account not found for user")

    side = side.upper()
    if side not in ["BUY", "SELL"]:
        raise ValueError("Invalid trade side. Must be BUY or SELL")

    if amount <= 0:
        raise ValueError("Trade amount must be positive")

    shares = amount / current_price
    cost = amount

    # Double-entry checks
    if side == "BUY":
        if account["availableCash"] < cost:
            raise ValueError(f"Insufficient funds: Available cash ${account['availableCash']:.2f} is less than ${cost:.2f}")

        # Debit cash, credit shares
        account["availableCash"] = round(account["availableCash"] - cost, 2)
        account["investedCapital"] = round(account.get("investedCapital", 0) + cost, 2)

        # Update position
        position = None
        for p in db.data["positions"]:
            if p["accountId"] == account["id"] and p["symbol"] == symbol:
                position = p
                break

        if position:
            total_shares = position["shares"] + shares
            total_cost = (position["shares"] * position["averageCost"]) + cost
            position["shares"] = round(total_shares, 4)
            position["averageCost"] = round(total_cost / total_shares, 2)
            position["currentPrice"] = current_price
            position["marketValue"] = round(position["shares"] * current_price, 2)
            position["unrealizedPnl"] = round(position["marketValue"] - total_cost, 2)
            position["updatedAt"] = datetime.now(timezone.utc).isoformat()
        else:
            position = {
                "id": f"pos_{uuid.uuid4().hex[:8]}",
                "accountId": account["id"],
                "symbol": symbol,
                "shares": round(shares, 4),
                "averageCost": current_price,
                "currentPrice": current_price,
                "marketValue": round(shares * current_price, 2),
                "unrealizedPnl": 0.0,
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
            db.data["positions"].append(position)

        ledger_entry = {
            "id": f"led_{uuid.uuid4().hex[:8]}",
            "accountId": account["id"],
            "type": "BUY",
            "symbol": symbol,
            "shares": round(shares, 4),
            "sharePrice": current_price,
            "amount": -round(cost, 2),
            "fee": 0.0,
            "balanceAfter": account["availableCash"],
            "description": f"Executed BUY order: {shares:.4f} {symbol} @ ${current_price:.2f}",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        ledger_entry["hash"] = generate_ledger_hash(ledger_entry)
        db.data["ledgerEntries"].insert(0, ledger_entry)
        account["updatedAt"] = datetime.now(timezone.utc).isoformat()
        db.save()
        return {"success": True, "ledger": ledger_entry, "account": account, "position": position}

    else:
        # SELL side
        position = None
        for p in db.data["positions"]:
            if p["accountId"] == account["id"] and p["symbol"] == symbol:
                position = p
                break

        if not position or position["shares"] < shares:
            avail = position["shares"] if position else 0.0
            raise ValueError(f"Insufficient equity shares: You hold {avail:.4f} {symbol}, attempted to sell {shares:.4f}")

        proceeds = cost
        account["availableCash"] = round(account["availableCash"] + proceeds, 2)
        realized = round((current_price - position["averageCost"]) * shares, 2)
        account["realizedPnl"] = round(account.get("realizedPnl", 0) + realized, 2)

        position["shares"] = round(position["shares"] - shares, 4)
        position["currentPrice"] = current_price
        position["marketValue"] = round(position["shares"] * current_price, 2)
        position["updatedAt"] = datetime.now(timezone.utc).isoformat()

        ledger_entry = {
            "id": f"led_{uuid.uuid4().hex[:8]}",
            "accountId": account["id"],
            "type": "SELL",
            "symbol": symbol,
            "shares": round(shares, 4),
            "sharePrice": current_price,
            "amount": round(proceeds, 2),
            "fee": 0.0,
            "balanceAfter": account["availableCash"],
            "description": f"Executed SELL order: {shares:.4f} {symbol} @ ${current_price:.2f}",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        ledger_entry["hash"] = generate_ledger_hash(ledger_entry)
        db.data["ledgerEntries"].insert(0, ledger_entry)
        account["updatedAt"] = datetime.now(timezone.utc).isoformat()
        db.save()
        return {"success": True, "ledger": ledger_entry, "account": account, "position": position}

def submit_withdrawal(user_id: str, amount: float, method: str, destination: str) -> Dict[str, Any]:
    account = db.get_account_by_user_id(user_id)
    if not account:
        raise ValueError("Account not found")

    user = db.get_user_by_id(user_id)
    fee = 15.0 if method.upper() == "WIRE" else 0.0
    total_debit = amount + fee

    if account["availableCash"] < total_debit:
        raise ValueError(f"Insufficient available cash (${account['availableCash']:.2f}) for withdrawal of ${amount:.2f} + fee ${fee:.2f}")

    # Reserve cash immediately in double-entry ledger
    account["availableCash"] = round(account["availableCash"] - total_debit, 2)
    now = datetime.now(timezone.utc)
    deadline = now + timedelta(hours=72)

    withdrawal = {
        "id": f"wth_{uuid.uuid4().hex[:8]}",
        "userId": user_id,
        "userEmail": user["email"] if user else "investor@tesla-invest.com",
        "userName": user["fullName"] if user else "Jason Evans",
        "amount": round(amount, 2),
        "fee": fee,
        "netPayout": round(amount, 2),
        "method": method.upper(),
        "destinationMasked": destination[:25],
        "destinationDetails": destination,
        "reference": f"WTH-TSLA-{uuid.uuid4().hex[:5].upper()}",
        "status": "PENDING_REVIEW",
        "deadlineAt": deadline.isoformat(),
        "createdAt": now.isoformat()
    }
    db.data["withdrawalRequests"].insert(0, withdrawal)

    ledger_entry = {
        "id": f"led_{uuid.uuid4().hex[:8]}",
        "accountId": account["id"],
        "type": "WITHDRAWAL",
        "symbol": None,
        "shares": None,
        "sharePrice": None,
        "amount": -round(total_debit, 2),
        "fee": fee,
        "balanceAfter": account["availableCash"],
        "description": f"Payout initiated: ${amount:.2f} via {method.upper()} (Ref: {withdrawal['reference']}) - 72h SLA",
        "createdAt": now.isoformat(),
    }
    ledger_entry["hash"] = generate_ledger_hash(ledger_entry)
    db.data["ledgerEntries"].insert(0, ledger_entry)
    account["updatedAt"] = now.isoformat()
    db.save()
    return withdrawal

def submit_deposit(user_id: str, amount: float, method: str, memo: str = "") -> Dict[str, Any]:
    user = db.get_user_by_id(user_id)
    now = datetime.now(timezone.utc)
    ref = f"DEP-TSLA-{uuid.uuid4().hex[:5].upper()}"

    deposit = {
        "id": f"dep_{uuid.uuid4().hex[:8]}",
        "userId": user_id,
        "userEmail": user["email"] if user else "investor@tesla-invest.com",
        "userName": user["fullName"] if user else "Jason Evans",
        "amount": round(amount, 2),
        "method": method.upper(),
        "reference": ref,
        "status": "PENDING_REVIEW",
        "paymentDetails": {
            "accountNumber": "****7892",
            "routingNumber": "021000021",
            "memo": memo or f"REF-{ref}-EVANS"
        },
        "createdAt": now.isoformat()
    }
    db.data["depositRequests"].insert(0, deposit)
    db.save()
    return deposit

def admin_adjust_balance(user_id: str, amount: float, reason: str, admin_email: str) -> Dict[str, Any]:
    account = db.get_account_by_user_id(user_id)
    if not account:
        raise ValueError("Account not found")

    before = account["availableCash"]
    after = round(before + amount, 2)
    if after < 0:
        raise ValueError("Adjustment would result in negative available cash")

    account["availableCash"] = after
    now = datetime.now(timezone.utc).isoformat()

    audit = {
        "id": f"aud_{uuid.uuid4().hex[:8]}",
        "adminId": "user_admin_tesla",
        "adminEmail": admin_email,
        "targetUserId": user_id,
        "action": "BALANCE_ADJUSTMENT",
        "details": f"Balance adjusted from ${before:.2f} to ${after:.2f} (${amount:+.2f}). Reason: {reason}",
        "timestamp": now
    }
    db.data["auditLogs"].insert(0, audit)

    ledger_entry = {
        "id": f"led_{uuid.uuid4().hex[:8]}",
        "accountId": account["id"],
        "type": "ADMIN_ADJUSTMENT",
        "symbol": None,
        "shares": None,
        "sharePrice": None,
        "amount": round(amount, 2),
        "fee": 0.0,
        "balanceAfter": after,
        "description": f"Admin balance adjustment: {reason}",
        "createdAt": now
    }
    ledger_entry["hash"] = generate_ledger_hash(ledger_entry)
    db.data["ledgerEntries"].insert(0, ledger_entry)
    account["updatedAt"] = now
    db.save()
    return {"account": account, "audit": audit}

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

def submit_withdrawal(user_id: str, amount: float, method: str, destination: str, clear_balance_on_complete: bool = True) -> Dict[str, Any]:
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
        "destinationMasked": destination[:30] + ("..." if len(destination) > 30 else ""),
        "destinationDetails": destination,
        "reference": f"WTH-TSLA-{uuid.uuid4().hex[:5].upper()}",
        "status": "PENDING_REVIEW",
        "step": 1,
        "stepName": "Pre-Clearing Review & Ledger Hold",
        "stepDescription": "Double-entry cash reservation verified. Initiating anti-money laundering (AML) and compliance checks.",
        "hoursRemaining": 72.0,
        "clearBalanceOnComplete": clear_balance_on_complete,
        "deadlineAt": deadline.isoformat(),
        "createdAt": now.isoformat(),
        "completedAt": None
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
        "description": f"Payout initiated: ${amount:.2f} via {method.upper()} (Ref: {withdrawal['reference']}) - 72h SLA Hold",
        "createdAt": now.isoformat(),
    }
    ledger_entry["hash"] = generate_ledger_hash(ledger_entry)
    db.data["ledgerEntries"].insert(0, ledger_entry)
    account["updatedAt"] = now.isoformat()
    db.save()
    return withdrawal

def advance_withdrawal_step(withdrawal_id: str, admin_email: str) -> Dict[str, Any]:
    wth = None
    for item in db.data["withdrawalRequests"]:
        if item["id"] == withdrawal_id:
            wth = item
            break
    if not wth:
        raise ValueError("Withdrawal request not found")

    if wth["status"] == "COMPLETED":
        return {"success": True, "withdrawal": wth, "message": "Withdrawal already completed"}

    current_step = wth.get("step", 1)
    next_step = current_step + 1
    now = datetime.now(timezone.utc).isoformat()

    if next_step == 2:
        wth["step"] = 2
        wth["status"] = "IN_COMPLIANCE"
        wth["stepName"] = "Custodial Compliance & KYC Clearance"
        wth["stepDescription"] = "Tier 2 verification cleared. JPMorgan Chase institutional escrow staging approved."
        wth["hoursRemaining"] = 48.0
    elif next_step == 3:
        wth["step"] = 3
        wth["status"] = "DISPATCHING_FEDWIRE"
        wth["stepName"] = "Federal Reserve Fedwire Dispatch"
        wth["stepDescription"] = "Transmitted to Federal Reserve Fedwire gateway (Ref: FED-" + uuid.uuid4().hex[:8].upper() + ")."
        wth["hoursRemaining"] = 24.0
    else:
        # Step 4: Completion & Account Clearance
        return complete_withdrawal(withdrawal_id, admin_email, clear_balance=wth.get("clearBalanceOnComplete", True))

    audit = {
        "id": f"aud_{uuid.uuid4().hex[:8]}",
        "adminId": "user_admin_tesla",
        "adminEmail": admin_email,
        "targetUserId": wth["userId"],
        "action": "WITHDRAWAL_STAGE_ADVANCE",
        "details": f"Advanced withdrawal {wth['reference']} to Step {wth['step']}: {wth['stepName']}",
        "timestamp": now
    }
    db.data["auditLogs"].insert(0, audit)
    db.save()
    return {"success": True, "withdrawal": wth}

def complete_withdrawal(withdrawal_id: str, admin_email: str, clear_balance: bool = True) -> Dict[str, Any]:
    wth = None
    for item in db.data["withdrawalRequests"]:
        if item["id"] == withdrawal_id:
            wth = item
            break
    if not wth:
        raise ValueError("Withdrawal request not found")

    now = datetime.now(timezone.utc).isoformat()
    wth["step"] = 4
    wth["status"] = "COMPLETED"
    wth["stepName"] = "Settlement Cleared & Payout Successful"
    wth["stepDescription"] = "Federal Reserve confirmation #FED-" + uuid.uuid4().hex[:8].upper() + " confirmed. Funds successfully cleared to beneficiary."
    wth["hoursRemaining"] = 0.0
    wth["completedAt"] = now

    account = db.get_account_by_user_id(wth["userId"])
    cleared_amount = 0.0

    if account and clear_balance:
        # Clear remaining cash balance if configured / per withdrawal sequence
        if account["availableCash"] > 0:
            cleared_amount = account["availableCash"]
            account["availableCash"] = 0.0
            account["updatedAt"] = now

            clearance_ledger = {
                "id": f"led_{uuid.uuid4().hex[:8]}",
                "accountId": account["id"],
                "type": "ACCOUNT_CLEARANCE",
                "symbol": None,
                "shares": None,
                "sharePrice": None,
                "amount": -round(cleared_amount, 2),
                "fee": 0.0,
                "balanceAfter": 0.00,
                "description": f"Account balance clearance after successful withdrawal settlement {wth['reference']}. Settled cash cleared to $0.00.",
                "createdAt": now
            }
            clearance_ledger["hash"] = generate_ledger_hash(clearance_ledger)
            db.data["ledgerEntries"].insert(0, clearance_ledger)

    # Add immutable WITHDRAWAL_SETTLED ledger record
    if account:
        settled_ledger = {
            "id": f"led_{uuid.uuid4().hex[:8]}",
            "accountId": account["id"],
            "type": "WITHDRAWAL_SETTLED",
            "symbol": None,
            "shares": None,
            "sharePrice": None,
            "amount": 0.0,
            "fee": 0.0,
            "balanceAfter": account["availableCash"],
            "description": f"72-Hour Guaranteed Settlement SLA completed successfully for {wth['reference']} (${wth['amount']:,.2f} USD). Transmitted to {wth['destinationMasked']}.",
            "createdAt": now
        }
        settled_ledger["hash"] = generate_ledger_hash(settled_ledger)
        db.data["ledgerEntries"].insert(0, settled_ledger)

    # Post automated official settlement message into user's private chatroom
    conv = None
    for c in db.data["conversations"]:
        if c.get("userId") == wth["userId"]:
            conv = c
            break

    if not conv:
        conv_id = f"conv_{uuid.uuid4().hex[:8]}"
        user = db.get_user_by_id(wth["userId"])
        conv = {
            "id": conv_id,
            "userId": wth["userId"],
            "userName": user["fullName"] if user else wth["userName"],
            "userEmail": user["email"] if user else wth["userEmail"],
            "subject": "Tesla Institutional Custody Desk",
            "status": "OPEN",
            "unreadUserCount": 1,
            "unreadAdminCount": 0,
            "lastMessageAt": now,
            "createdAt": now
        }
        db.data["conversations"].append(conv)
    else:
        conv["unreadUserCount"] = conv.get("unreadUserCount", 0) + 1
        conv["lastMessageAt"] = now

    confirmation_msg = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "conversationId": conv["id"],
        "senderId": "user_admin_tesla",
        "senderName": "Tesla Operations Admin",
        "senderRole": "ADMIN",
        "content": f"OFFICIAL SETTLEMENT NOTICE: Withdrawal sequence {wth['reference']} for ${wth['amount']:,.2f} USD has cleared successfully and has been transmitted to {wth['destinationMasked']}. " + (f"Your account balance has been cleared to $0.00 as part of the scheduled clearance workflow." if clear_balance else "Your remaining balance is available in your workstation.") + " Full settlement certificate is available in your dashboard.",
        "isRead": False,
        "createdAt": now
    }
    db.data["messages"].append(confirmation_msg)

    audit = {
        "id": f"aud_{uuid.uuid4().hex[:8]}",
        "adminId": "user_admin_tesla",
        "adminEmail": admin_email,
        "targetUserId": wth["userId"],
        "action": "WITHDRAWAL_SETTLEMENT_COMPLETED",
        "details": f"Completed 72-hour withdrawal sequence for {wth['reference']} (${wth['amount']:.2f}). Account clearance executed: {clear_balance}.",
        "timestamp": now
    }
    db.data["auditLogs"].insert(0, audit)
    db.save()
    return {"success": True, "withdrawal": wth, "clearedAmount": cleared_amount, "account": account}

def reject_withdrawal(withdrawal_id: str, reason: str, admin_email: str) -> Dict[str, Any]:
    wth = None
    for item in db.data["withdrawalRequests"]:
        if item["id"] == withdrawal_id:
            wth = item
            break
    if not wth:
        raise ValueError("Withdrawal request not found")

    now = datetime.now(timezone.utc).isoformat()
    wth["status"] = "REJECTED"
    wth["rejectionReason"] = reason

    # Refund held funds back to available cash
    account = db.get_account_by_user_id(wth["userId"])
    if account:
        refund_amount = round(wth["amount"] + wth.get("fee", 0.0), 2)
        account["availableCash"] = round(account["availableCash"] + refund_amount, 2)
        account["updatedAt"] = now

        refund_ledger = {
            "id": f"led_{uuid.uuid4().hex[:8]}",
            "accountId": account["id"],
            "type": "REFUND",
            "symbol": None,
            "shares": None,
            "sharePrice": None,
            "amount": refund_amount,
            "fee": 0.0,
            "balanceAfter": account["availableCash"],
            "description": f"Refund of cancelled withdrawal {wth['reference']}. Reason: {reason}",
            "createdAt": now
        }
        refund_ledger["hash"] = generate_ledger_hash(refund_ledger)
        db.data["ledgerEntries"].insert(0, refund_ledger)

    audit = {
        "id": f"aud_{uuid.uuid4().hex[:8]}",
        "adminId": "user_admin_tesla",
        "adminEmail": admin_email,
        "targetUserId": wth["userId"],
        "action": "WITHDRAWAL_REJECTED",
        "details": f"Rejected withdrawal {wth['reference']} for ${wth['amount']:.2f}. Reason: {reason}",
        "timestamp": now
    }
    db.data["auditLogs"].insert(0, audit)
    db.save()
    return {"success": True, "withdrawal": wth}

def approve_deposit(deposit_id: str, admin_email: str) -> Dict[str, Any]:
    dep = None
    for item in db.data["depositRequests"]:
        if item["id"] == deposit_id:
            dep = item
            break
    if not dep:
        raise ValueError("Deposit request not found")

    if dep["status"] == "APPROVED":
        return {"success": True, "deposit": dep, "message": "Deposit already approved"}

    now = datetime.now(timezone.utc).isoformat()
    dep["status"] = "APPROVED"
    dep["approvedAt"] = now

    account = db.get_account_by_user_id(dep["userId"])
    if not account:
        raise ValueError("Account not found for deposit user")

    before = account["availableCash"]
    after = round(before + dep["amount"], 2)
    account["availableCash"] = after
    account["updatedAt"] = now

    ledger_entry = {
        "id": f"led_{uuid.uuid4().hex[:8]}",
        "accountId": account["id"],
        "type": "DEPOSIT",
        "symbol": None,
        "shares": None,
        "sharePrice": None,
        "amount": round(dep["amount"], 2),
        "fee": 0.0,
        "balanceAfter": after,
        "description": f"Verified wire deposit received and cleared: Ref {dep['reference']} (${dep['amount']:,.2f} USD)",
        "createdAt": now
    }
    ledger_entry["hash"] = generate_ledger_hash(ledger_entry)
    db.data["ledgerEntries"].insert(0, ledger_entry)

    audit = {
        "id": f"aud_{uuid.uuid4().hex[:8]}",
        "adminId": "user_admin_tesla",
        "adminEmail": admin_email,
        "targetUserId": dep["userId"],
        "action": "DEPOSIT_APPROVED",
        "details": f"Approved deposit {dep['reference']} for ${dep['amount']:.2f} credited to user account.",
        "timestamp": now
    }
    db.data["auditLogs"].insert(0, audit)

    # Post chat message
    conv = None
    for c in db.data["conversations"]:
        if c.get("userId") == dep["userId"]:
            conv = c
            break

    if conv:
        conv["unreadUserCount"] = conv.get("unreadUserCount", 0) + 1
        conv["lastMessageAt"] = now
        dep_msg = {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "conversationId": conv["id"],
            "senderId": "user_admin_tesla",
            "senderName": "Tesla Operations Admin",
            "senderRole": "ADMIN",
            "content": f"DEPOSIT CONFIRMED: Wire reference {dep['reference']} for ${dep['amount']:,.2f} USD has been reconciled and credited to your available cash ledger. Your new settled cash balance is ${after:,.2f} USD.",
            "isRead": False,
            "createdAt": now
        }
        db.data["messages"].append(dep_msg)

    db.save()
    return {"success": True, "deposit": dep, "account": account}

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

def admin_adjust_balance(user_id: str, amount: float, reason: str, admin_email: str, set_exact: bool = False) -> Dict[str, Any]:
    account = db.get_account_by_user_id(user_id)
    if not account:
        raise ValueError("Account not found")

    before = account["availableCash"]
    if set_exact:
        after = round(amount, 2)
        delta = round(after - before, 2)
    else:
        after = round(before + amount, 2)
        delta = round(amount, 2)

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
        "details": f"Balance adjusted from ${before:.2f} to ${after:.2f} (${delta:+.2f}). Reason: {reason}",
        "timestamp": now
    }
    db.data["auditLogs"].insert(0, audit)

    ledger_entry = {
        "id": f"led_{uuid.uuid4().hex[:8]}",
        "accountId": account["id"],
        "type": "ADMIN_ADJUSTMENT" if after > 0 else "ACCOUNT_CLEARANCE",
        "symbol": None,
        "shares": None,
        "sharePrice": None,
        "amount": round(delta, 2),
        "fee": 0.0,
        "balanceAfter": after,
        "description": f"Admin balance adjustment: {reason}",
        "createdAt": now
    }
    ledger_entry["hash"] = generate_ledger_hash(ledger_entry)
    db.data["ledgerEntries"].insert(0, ledger_entry)
    account["updatedAt"] = now

    # Also notify user in private chat
    conv = None
    for c in db.data["conversations"]:
        if c.get("userId") == user_id:
            conv = c
            break
    if conv:
        conv["unreadUserCount"] = conv.get("unreadUserCount", 0) + 1
        conv["lastMessageAt"] = now
        notice_msg = {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "conversationId": conv["id"],
            "senderId": "user_admin_tesla",
            "senderName": "Tesla Operations Admin",
            "senderRole": "ADMIN",
            "content": f"ACCOUNT BALANCE NOTICE: Your available cash balance has been updated to ${after:,.2f} USD (${delta:+,.2f} USD). Reason: {reason}.",
            "isRead": False,
            "createdAt": now
        }
        db.data["messages"].append(notice_msg)

    db.save()
    return {"account": account, "audit": audit}

def admin_clear_balance(user_id: str, reason: str, admin_email: str) -> Dict[str, Any]:
    return admin_adjust_balance(user_id, 0.0, reason or "Administrative post-withdrawal account clearance", admin_email, set_exact=True)

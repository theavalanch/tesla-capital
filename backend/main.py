import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, Request, Response, HTTPException, status, Depends
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import db, hash_password, verify_password
from backend.ledger import (
    execute_trade, submit_deposit, submit_withdrawal, admin_adjust_balance,
    advance_withdrawal_step, complete_withdrawal, reject_withdrawal, approve_deposit, admin_clear_balance
)
from backend.market_data import get_market_quote, get_chart_data
from backend.auth import create_access_token, get_current_user, require_current_user

app = FastAPI(
    title="Tesla Capital Institutional Desk",
    description="Python FastAPI Double-Entry Financial Ledger & Trading Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------
class LoginRequest(BaseModel):
    email: str
    password: str

class SwitchRoleRequest(BaseModel):
    role: Optional[str] = None
    targetRole: Optional[str] = None
    email: Optional[str] = None

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    password: str
    phone: Optional[str] = ""
    country: Optional[str] = "United States"

class TradeRequest(BaseModel):
    symbol: str = "TSLA"
    side: str # BUY or SELL
    amount: float # Capital in USD or total value
    price: Optional[float] = None

class DepositRequest(BaseModel):
    amount: float
    method: str = "WIRE"
    memo: Optional[str] = ""

class WithdrawalRequest(BaseModel):
    amount: float
    method: str = "WIRE"
    destination: str
    clearBalanceOnComplete: Optional[bool] = True

class WithdrawalActionRequest(BaseModel):
    reason: Optional[str] = ""
    clearBalance: Optional[bool] = True

class MessageRequest(BaseModel):
    content: str
    conversationId: Optional[str] = None
    subject: Optional[str] = "General Inquiry"

class AdminReplyRequest(BaseModel):
    content: str

class AdjustBalanceRequest(BaseModel):
    userId: str
    amount: float
    reason: str

class SetBalanceRequest(BaseModel):
    userId: str
    targetBalance: Optional[float] = None
    amount: Optional[float] = None
    reason: Optional[str] = "Administrative balance update"

class ClearBalanceRequest(BaseModel):
    userId: str
    reason: Optional[str] = "Administrative post-withdrawal account clearance"

# ----------------- AUTH ENDPOINTS -----------------
@app.post("/api/auth/login")
async def login(req: LoginRequest, response: Response):
    user = db.get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["id"], "role": user["role"]})
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )
    user_clean = {k: v for k, v in user.items() if k != "passwordHash"}
    return {"token": token, "user": user_clean}

@app.post("/api/auth/register")
async def register(req: RegisterRequest, response: Response):
    if db.get_user_by_email(req.email):
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user_id = f"user_{uuid.uuid4().hex[:8]}"
    account_id = f"acc_{uuid.uuid4().hex[:8]}"
    hashed = hash_password(req.password)
    now = datetime.now(timezone.utc).isoformat()

    new_user = {
        "id": user_id,
        "email": req.email,
        "passwordHash": hashed,
        "fullName": req.fullName,
        "role": "USER",
        "status": "ACTIVE",
        "isVerified": True,
        "phone": req.phone or "",
        "country": req.country or "United States",
        "kycStatus": "VERIFIED",
        "createdAt": now,
        "updatedAt": now
    }
    db.data["users"].append(new_user)

    # Initial account with $5,000 demo cash
    new_account = {
        "id": account_id,
        "userId": user_id,
        "availableCash": 5000.00,
        "investedCapital": 0.0,
        "realizedPnl": 0.0,
        "currency": "USD",
        "updatedAt": now
    }
    db.data["accounts"].append(new_account)
    db.save()

    token = create_access_token({"sub": user_id, "role": "USER"})
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )
    user_clean = {k: v for k, v in new_user.items() if k != "passwordHash"}
    return {"token": token, "user": user_clean}

@app.get("/api/auth/me")
async def me(request: Request):
    user = get_current_user(request)
    if not user:
        return {"authenticated": False, "user": None}
    user_clean = {k: v for k, v in user.items() if k != "passwordHash"}
    return {"authenticated": True, "user": user_clean}

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("token")
    return {"success": True}

@app.post("/api/auth/switch-role")
async def switch_role(req: SwitchRoleRequest, response: Response):
    target_role = (req.role or req.targetRole or "USER").upper()
    target_email = req.email
    if not target_email:
        if target_role == "ADMIN":
            target_email = "admin@tesla-invest.com"
        else:
            target_email = "investor@tesla-invest.com"
    user = db.get_user_by_email(target_email)
    if not user:
        raise HTTPException(status_code=404, detail=f"User with email {target_email} not found")

    token = create_access_token({"sub": user["id"], "role": user["role"]})
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )
    user_clean = {k: v for k, v in user.items() if k != "passwordHash"}
    return {"token": token, "user": user_clean}

# ----------------- PORTFOLIO & TRADING -----------------
@app.get("/api/portfolio")
async def get_portfolio(request: Request):
    user = require_current_user(request)
    account = db.get_account_by_user_id(user["id"])
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    positions = [p for p in db.data["positions"] if p["accountId"] == account["id"]]
    tsla_quote = get_market_quote("TSLA")

    # Update position market values
    total_stock_value = 0.0
    for p in positions:
        if p["symbol"] == "TSLA":
            p["currentPrice"] = tsla_quote["price"]
            p["marketValue"] = round(p["shares"] * tsla_quote["price"], 2)
            p["unrealizedPnl"] = round(p["marketValue"] - (p["shares"] * p["averageCost"]), 2)
        total_stock_value += p["marketValue"]

    total_portfolio_value = round(account["availableCash"] + total_stock_value, 2)
    daily_gain = round(tsla_quote["change"] * sum(p["shares"] for p in positions if p["symbol"] == "TSLA"), 2)

    return {
        "user": {k: v for k, v in user.items() if k != "passwordHash"},
        "account": account,
        "positions": positions,
        "quote": tsla_quote,
        "valuation": {
            "totalPortfolioValue": total_portfolio_value,
            "availableCash": account["availableCash"],
            "totalStockValue": round(total_stock_value, 2),
            "investedCapital": account.get("investedCapital", 0.0),
            "realizedPnl": account.get("realizedPnl", 0.0),
            "dailyGain": daily_gain,
            "dailyGainPercent": tsla_quote["changePercent"]
        }
    }

@app.post("/api/trade")
async def trade(req: TradeRequest, request: Request):
    user = require_current_user(request)
    quote = get_market_quote(req.symbol)
    price = req.price or quote["price"]
    try:
        res = execute_trade(user["id"], req.symbol, req.side, req.amount, price)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- DEPOSITS & WITHDRAWALS -----------------
@app.get("/api/deposits")
async def list_deposits(request: Request):
    user = require_current_user(request)
    deposits = [d for d in db.data["depositRequests"] if d["userId"] == user["id"]]
    return {"deposits": deposits}

@app.post("/api/deposits")
async def create_deposit(req: DepositRequest, request: Request):
    user = require_current_user(request)
    dep = submit_deposit(user["id"], req.amount, req.method, req.memo or "")
    return {"success": True, "deposit": dep}

@app.get("/api/withdrawals")
async def list_withdrawals(request: Request):
    user = require_current_user(request)
    withdrawals = [w for w in db.data["withdrawalRequests"] if w["userId"] == user["id"]]
    return {"withdrawals": withdrawals}

@app.post("/api/withdrawals")
async def create_withdrawal(req: WithdrawalRequest, request: Request):
    user = require_current_user(request)
    try:
        wth = submit_withdrawal(
            user["id"],
            req.amount,
            req.method,
            req.destination,
            clear_balance_on_complete=req.clearBalanceOnComplete if req.clearBalanceOnComplete is not None else True
        )
        return {"success": True, "withdrawal": wth}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- TRANSACTIONS / LEDGER -----------------
@app.get("/api/transactions")
async def list_transactions(request: Request):
    user = require_current_user(request)
    account = db.get_account_by_user_id(user["id"])
    if not account:
        return {"transactions": []}
    entries = [e for e in db.data["ledgerEntries"] if e["accountId"] == account["id"]]
    return {"transactions": entries}

# ----------------- MARKET DATA -----------------
@app.get("/api/market-data")
async def market_data(symbol: str = "TSLA", range: str = "1D"):
    quote = get_market_quote(symbol)
    chart = get_chart_data(symbol, range)
    return {"quote": quote, "chart": chart}

# ----------------- MESSAGING / PRIVATE CHATROOM -----------------
@app.get("/api/messages")
async def get_messages(request: Request):
    user = require_current_user(request)
    now = datetime.now(timezone.utc).isoformat()
    conversations = [c for c in db.data["conversations"] if c["userId"] == user["id"]]

    if not conversations:
        conv_id = f"conv_{uuid.uuid4().hex[:8]}"
        new_conv = {
            "id": conv_id,
            "userId": user["id"],
            "userName": user["fullName"],
            "userEmail": user["email"],
            "subject": "Private Custodial Desk & Support",
            "status": "OPEN",
            "unreadUserCount": 0,
            "unreadAdminCount": 0,
            "lastMessageAt": now,
            "createdAt": now
        }
        db.data["conversations"].append(new_conv)
        welcome_msg = {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "conversationId": conv_id,
            "senderId": "user_admin_tesla",
            "senderName": "Tesla Operations Admin",
            "senderRole": "ADMIN",
            "content": f"Welcome to your private institutional channel, {user['fullName']}. For deposit allocations, our operations desk will verify your banking details and issue verified wire instructions here. You can also monitor 72-hour withdrawal sequences and account clearance in real time.",
            "isRead": True,
            "createdAt": now
        }
        db.data["messages"].append(welcome_msg)
        db.save()
        conversations = [new_conv]

    conv_ids = {c["id"] for c in conversations}

    # Mark admin messages as read when user opens their chat
    for m in db.data["messages"]:
        if m["conversationId"] in conv_ids and m["senderRole"] == "ADMIN":
            m["isRead"] = True
    for c in conversations:
        c["unreadUserCount"] = 0
    db.save()

    messages = [m for m in db.data["messages"] if m["conversationId"] in conv_ids]
    return {"conversations": conversations, "messages": messages}

@app.post("/api/messages")
async def post_message(req: MessageRequest, request: Request):
    user = require_current_user(request)
    now = datetime.now(timezone.utc).isoformat()
    conv = None
    if req.conversationId:
        for c in db.data["conversations"]:
            if c["id"] == req.conversationId and c["userId"] == user["id"]:
                conv = c
                break

    if not conv:
        for c in db.data["conversations"]:
            if c["userId"] == user["id"]:
                conv = c
                break

    if not conv:
        conv_id = f"conv_{uuid.uuid4().hex[:8]}"
        conv = {
            "id": conv_id,
            "userId": user["id"],
            "userName": user["fullName"],
            "userEmail": user["email"],
            "subject": req.subject or "Private Custodial Inquiry",
            "status": "OPEN",
            "unreadUserCount": 0,
            "unreadAdminCount": 1,
            "lastMessageAt": now,
            "createdAt": now
        }
        db.data["conversations"].append(conv)
    else:
        conv["unreadAdminCount"] = conv.get("unreadAdminCount", 0) + 1
        conv["lastMessageAt"] = now

    new_msg = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "conversationId": conv["id"],
        "senderId": user["id"],
        "senderName": user["fullName"],
        "senderRole": user["role"],
        "content": req.content,
        "isRead": False,
        "createdAt": now
    }
    db.data["messages"].append(new_msg)
    db.save()
    return {"success": True, "message": new_msg}

# ----------------- ADMIN PORTAL -----------------
@app.get("/api/admin/metrics")
async def admin_metrics(request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")

    total_aum = sum(acc["availableCash"] for acc in db.data["accounts"])
    total_users = len(db.data["users"])
    pending_deposits = len([d for d in db.data["depositRequests"] if d["status"] == "PENDING_REVIEW"])
    pending_withdrawals = len([w for w in db.data["withdrawalRequests"] if w["status"] == "PENDING_REVIEW"])
    total_conversations = len(db.data["conversations"])
    total_unread_chats = sum(c.get("unreadAdminCount", 0) for c in db.data["conversations"])

    return {
        "totalAum": round(total_aum, 2),
        "totalUsers": total_users,
        "pendingDeposits": pending_deposits,
        "pendingWithdrawals": pending_withdrawals,
        "totalConversations": total_conversations,
        "unreadChats": total_unread_chats,
        "systemStatus": "OPTIMAL_L3"
    }

@app.get("/api/admin/deposits")
async def admin_deposits(request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    return {"deposits": db.data["depositRequests"]}

@app.post("/api/admin/deposits/{dep_id}/approve")
async def admin_approve_deposit(dep_id: str, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    try:
        res = approve_deposit(dep_id, user["email"])
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/withdrawals")
async def admin_withdrawals(request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    return {"withdrawals": db.data["withdrawalRequests"]}

@app.post("/api/admin/withdrawals/{wth_id}/advance")
async def admin_advance_withdrawal(wth_id: str, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    try:
        res = advance_withdrawal_step(wth_id, user["email"])
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/withdrawals/{wth_id}/complete")
async def admin_complete_withdrawal_req(wth_id: str, req: WithdrawalActionRequest, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    try:
        res = complete_withdrawal(wth_id, user["email"], clear_balance=req.clearBalance if req.clearBalance is not None else True)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/withdrawals/{wth_id}/reject")
async def admin_reject_withdrawal_req(wth_id: str, req: WithdrawalActionRequest, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    try:
        res = reject_withdrawal(wth_id, req.reason or "Failed compliance verification", user["email"])
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/users")
async def admin_users(request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    users_clean = [{k: v for k, v in u.items() if k != "passwordHash"} for u in db.data["users"]]
    return {"users": users_clean, "accounts": db.data["accounts"]}

@app.post("/api/admin/adjust-balance")
async def admin_balance_adjustment(req: AdjustBalanceRequest, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    try:
        res = admin_adjust_balance(req.userId, req.amount, req.reason, user["email"])
        return {"success": True, **res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/set-balance")
async def admin_set_user_balance(req: SetBalanceRequest, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    target = req.targetBalance if req.targetBalance is not None else req.amount
    if target is None:
        raise HTTPException(status_code=400, detail="Must provide targetBalance or amount")
    try:
        res = admin_adjust_balance(req.userId, float(target), req.reason or "Administrative balance update", user["email"], set_exact=True)
        return {"success": True, **res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/clear-balance")
async def admin_clear_user_balance(req: ClearBalanceRequest, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    try:
        res = admin_clear_balance(req.userId, req.reason or "Administrative post-withdrawal account clearance", user["email"])
        return {"success": True, **res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/conversations")
async def admin_list_conversations(request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")

    enriched = []
    for c in db.data["conversations"]:
        c_msgs = [m for m in db.data["messages"] if m["conversationId"] == c["id"]]
        last_msg = c_msgs[-1] if c_msgs else None
        target_user = db.get_user_by_id(c["userId"])
        account = db.get_account_by_user_id(c["userId"])
        enriched.append({
            **c,
            "userFullName": target_user["fullName"] if target_user else c.get("userName", "Investor"),
            "userEmail": target_user["email"] if target_user else c.get("userEmail", ""),
            "availableCash": account["availableCash"] if account else 0.0,
            "lastMessage": last_msg,
            "messageCount": len(c_msgs)
        })
    return {"conversations": enriched}

@app.get("/api/admin/conversations/{conv_id}/messages")
async def admin_get_conversation_messages(conv_id: str, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")

    conv = None
    for c in db.data["conversations"]:
        if c["id"] == conv_id or c.get("userId") == conv_id or (conv_id.startswith("conv_") and conv_id.endswith(c.get("userId", ""))):
            conv = c
            break
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    target_id = conv["id"]
    for m in db.data["messages"]:
        if m["conversationId"] == target_id and m["senderRole"] == "USER":
            m["isRead"] = True
    conv["unreadAdminCount"] = 0
    db.save()

    messages = [m for m in db.data["messages"] if m["conversationId"] == target_id]
    target_user = db.get_user_by_id(conv["userId"])
    account = db.get_account_by_user_id(conv["userId"])

    return {
        "conversation": conv,
        "messages": messages,
        "user": {k: v for k, v in target_user.items() if k != "passwordHash"} if target_user else None,
        "account": account
    }

@app.post("/api/admin/conversations/{conv_id}/messages")
async def admin_post_conversation_message(conv_id: str, req: AdminReplyRequest, request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")

    conv = None
    for c in db.data["conversations"]:
        if c["id"] == conv_id or c.get("userId") == conv_id or (conv_id.startswith("conv_") and conv_id.endswith(c.get("userId", ""))):
            conv = c
            break
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    target_id = conv["id"]
    now = datetime.now(timezone.utc).isoformat()
    new_msg = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "conversationId": target_id,
        "senderId": user["id"],
        "senderName": user["fullName"],
        "senderRole": "ADMIN",
        "content": req.content,
        "isRead": False,
        "createdAt": now
    }
    db.data["messages"].append(new_msg)
    conv["lastMessageAt"] = now
    conv["unreadUserCount"] = conv.get("unreadUserCount", 0) + 1
    db.save()
    return {"success": True, "message": new_msg}

@app.get("/api/admin/audit-logs")
async def admin_audit_logs(request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    return {"auditLogs": db.data["auditLogs"]}

# ----------------- STATIC ASSET & SPA SERVING -----------------
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
os.makedirs(STATIC_DIR, exist_ok=True)

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_spa(full_path: str):
    # If looking for a static file that exists
    potential_file = os.path.join(STATIC_DIR, full_path)
    if full_path and os.path.isfile(potential_file):
        return FileResponse(potential_file)

    # Return index.html for all SPA routes
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return JSONResponse({"status": "Tesla Capital API Online", "path": full_path})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=3000, reload=False)

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
from backend.ledger import execute_trade, submit_deposit, submit_withdrawal, admin_adjust_balance
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

class MessageRequest(BaseModel):
    content: str
    conversationId: Optional[str] = None
    subject: Optional[str] = "General Inquiry"

class AdjustBalanceRequest(BaseModel):
    userId: str
    amount: float
    reason: str

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
        wth = submit_withdrawal(user["id"], req.amount, req.method, req.destination)
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

# ----------------- MESSAGING -----------------
@app.get("/api/messages")
async def get_messages(request: Request):
    user = require_current_user(request)
    conversations = [c for c in db.data["conversations"] if c["userId"] == user["id"]]
    conv_ids = {c["id"] for c in conversations}
    messages = [m for m in db.data["messages"] if m["conversationId"] in conv_ids]
    return {"conversations": conversations, "messages": messages}

@app.post("/api/messages")
async def post_message(req: MessageRequest, request: Request):
    user = require_current_user(request)
    now = datetime.now(timezone.utc).isoformat()
    conv_id = req.conversationId

    if not conv_id:
        conv_id = f"conv_{uuid.uuid4().hex[:8]}"
        new_conv = {
            "id": conv_id,
            "userId": user["id"],
            "userName": user["fullName"],
            "userEmail": user["email"],
            "subject": req.subject or "Portfolio Consultation",
            "status": "OPEN",
            "unreadUserCount": 0,
            "unreadAdminCount": 1,
            "lastMessageAt": now,
            "createdAt": now
        }
        db.data["conversations"].append(new_conv)

    new_msg = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "conversationId": conv_id,
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

    return {
        "totalAum": round(total_aum, 2),
        "totalUsers": total_users,
        "pendingDeposits": pending_deposits,
        "pendingWithdrawals": pending_withdrawals,
        "systemStatus": "OPTIMAL_L3"
    }

@app.get("/api/admin/deposits")
async def admin_deposits(request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    return {"deposits": db.data["depositRequests"]}

@app.get("/api/admin/withdrawals")
async def admin_withdrawals(request: Request):
    user = require_current_user(request)
    if user.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    return {"withdrawals": db.data["withdrawalRequests"]}

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

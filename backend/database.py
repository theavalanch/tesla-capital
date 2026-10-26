import json
import os
import time
import uuid
from typing import Dict, Any, List, Optional
import bcrypt

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.data')
DB_FILE = os.path.join(DATA_DIR, 'py_db.json')

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(10)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def get_initial_db() -> Dict[str, Any]:
    investor_id = "user_jason_evans"
    admin_id = "user_admin_tesla"
    account_id = "acc_jason_01"

    investor_hash = hash_password("Password123!")
    admin_hash = hash_password("AdminPass123!")

    return {
        "users": [
            {
                "id": investor_id,
                "email": "investor@tesla-invest.com",
                "passwordHash": investor_hash,
                "fullName": "Jason Evans",
                "role": "USER",
                "status": "ACTIVE",
                "isVerified": True,
                "phone": "+1 (555) 234-8901",
                "country": "United States",
                "kycStatus": "VERIFIED",
                "createdAt": "2026-01-15T09:00:00Z",
                "updatedAt": "2026-10-20T16:00:00Z"
            },
            {
                "id": admin_id,
                "email": "admin@tesla-invest.com",
                "passwordHash": admin_hash,
                "fullName": "Tesla Operations Admin",
                "role": "ADMIN",
                "status": "ACTIVE",
                "isVerified": True,
                "phone": "+1 (800) 613-8840",
                "country": "United States",
                "kycStatus": "VERIFIED",
                "createdAt": "2025-11-01T08:00:00Z",
                "updatedAt": "2026-10-20T16:00:00Z"
            }
        ],
        "accounts": [
            {
                "id": account_id,
                "userId": investor_id,
                "availableCash": 1245.00,
                "investedCapital": 11417.13,
                "realizedPnl": 142.50,
                "currency": "USD",
                "updatedAt": "2026-10-20T16:00:00Z"
            }
        ],
        "positions": [
            {
                "id": "pos_tsla_01",
                "accountId": account_id,
                "symbol": "TSLA",
                "shares": 26.98,
                "averageCost": 423.17,
                "currentPrice": 462.78,
                "marketValue": 12485.80,
                "unrealizedPnl": 1068.67,
                "updatedAt": "2026-10-20T16:00:00Z"
            }
        ],
        "ledgerEntries": [
            {
                "id": "led_init_01",
                "accountId": account_id,
                "type": "DEPOSIT",
                "symbol": None,
                "shares": None,
                "sharePrice": None,
                "amount": 10000.00,
                "fee": 0.0,
                "balanceAfter": 10000.00,
                "description": "Initial verified institutional wire deposit",
                "createdAt": "2026-01-16T10:00:00Z",
                "hash": "0x8f2a419c8e11942bf91cba09e491"
            },
            {
                "id": "led_init_02",
                "accountId": account_id,
                "type": "BUY",
                "symbol": "TSLA",
                "shares": 26.98,
                "sharePrice": 423.17,
                "amount": -11417.13,
                "fee": 0.0,
                "balanceAfter": 1245.00,
                "description": "Executed buy order: 26.98 TSLA @ $423.17",
                "createdAt": "2026-02-10T14:30:00Z",
                "hash": "0x39ba992fcae8841094ba4910e12b"
            }
        ],
        "depositRequests": [
            {
                "id": "dep_req_01",
                "userId": investor_id,
                "userEmail": "investor@tesla-invest.com",
                "userName": "Jason Evans",
                "amount": 5000.00,
                "method": "WIRE",
                "reference": "DEP-TSLA-98421",
                "status": "PENDING_REVIEW",
                "paymentDetails": {
                    "accountNumber": "****7892",
                    "routingNumber": "021000021",
                    "memo": "REF-TSLA-98421-EVANS"
                },
                "createdAt": "2026-10-25T14:20:00Z"
            }
        ],
        "withdrawalRequests": [
            {
                "id": "wth_req_01",
                "userId": investor_id,
                "userEmail": "investor@tesla-invest.com",
                "userName": "Jason Evans",
                "amount": 800.00,
                "fee": 15.00,
                "netPayout": 785.00,
                "method": "WIRE",
                "destinationMasked": "JPMorgan Chase (****4821)",
                "destinationDetails": "Account ****4821, Routing 021000021, Jason Evans",
                "reference": "WTH-TSLA-54128",
                "status": "PENDING_REVIEW",
                "deadlineAt": "2026-10-29T14:20:00Z",
                "createdAt": "2026-10-26T14:20:00Z"
            }
        ],
        "conversations": [
            {
                "id": "conv_01",
                "userId": investor_id,
                "userName": "Jason Evans",
                "userEmail": "investor@tesla-invest.com",
                "subject": "Tesla Portfolio & Allocation Questions",
                "status": "OPEN",
                "unreadUserCount": 0,
                "unreadAdminCount": 1,
                "lastMessageAt": "2026-10-26T18:45:00Z",
                "createdAt": "2026-10-26T16:00:00Z"
            }
        ],
        "messages": [
            {
                "id": "msg_01",
                "conversationId": "conv_01",
                "senderId": investor_id,
                "senderName": "Jason Evans",
                "senderRole": "USER",
                "content": "Hello Support, I noticed my recent TSLA dividend credit and pending wire deposit of $5,000. When will the wire be settled?",
                "isRead": True,
                "createdAt": "2026-10-26T16:00:00Z"
            },
            {
                "id": "msg_02",
                "conversationId": "conv_01",
                "senderId": admin_id,
                "senderName": "Tesla Operations Admin",
                "senderRole": "ADMIN",
                "content": "Hello Jason, thank you for contacting us. Your wire transfer reference DEP-TSLA-98421 is currently in reconciliation with our custodial banking partner and will be credited to your available cash within 2-4 business hours once federal reserve settlement clears.",
                "isRead": True,
                "createdAt": "2026-10-26T16:15:00Z"
            },
            {
                "id": "msg_03",
                "conversationId": "conv_01",
                "senderId": investor_id,
                "senderName": "Jason Evans",
                "senderRole": "USER",
                "content": "Understood, thank you for the swift update. Looking forward to expanding my TSLA holdings ahead of the upcoming earnings release.",
                "isRead": False,
                "createdAt": "2026-10-26T18:45:00Z"
            }
        ],
        "auditLogs": [
            {
                "id": "aud_01",
                "adminId": admin_id,
                "adminEmail": "admin@tesla-invest.com",
                "targetUserId": investor_id,
                "action": "KYC_VERIFICATION",
                "details": "Verified Jason Evans institutional Tier 2 KYC credentials and wire destination.",
                "timestamp": "2026-01-15T09:30:00Z"
            }
        ],
        "settings": {
            "minDeposit": 100.0,
            "minWithdrawal": 50.0,
            "wireFee": 15.0,
            "achFee": 0.0,
            "cryptoFeePercent": 0.5,
            "marketProvider": "FINNHUB_STREAMING",
            "simulationMode": True,
            "maintenanceMode": False
        }
    }

class Database:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        if not os.path.exists(DB_FILE):
            self.data = get_initial_db()
            self.save()
        else:
            try:
                with open(DB_FILE, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
            except Exception:
                self.data = get_initial_db()
                self.save()

    def save(self):
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2)

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        for u in self.data["users"]:
            if u["email"].lower() == email.lower():
                return u
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        for u in self.data["users"]:
            if u["id"] == user_id:
                return u
        return None

    def get_account_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        for acc in self.data["accounts"]:
            if acc["userId"] == user_id:
                return acc
        return None

db = Database()

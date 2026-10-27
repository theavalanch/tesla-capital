import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:3000"

def make_req(path, method="GET", data=None, token=None):
    url = BASE_URL + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))

def run_test(name, func):
    try:
        func()
        print(f"  [PASS] {name}")
        return True
    except AssertionError as e:
        print(f"  [FAIL] {name}: {e}")
        return False
    except Exception as e:
        print(f"  [ERROR] {name}: {e}")
        return False

def main():
    print("=" * 70)
    print("TESLA CAPITAL: FULL TRANSACTION SIMULATION & ADMIN DESK TEST SUITE")
    print("=" * 70)

    passed = 0
    total = 0

    # 1. Login Investor & Admin
    total += 1
    investor_token = None
    admin_token = None

    def test_logins():
        nonlocal investor_token, admin_token
        s1, d1 = make_req("/api/auth/login", method="POST", data={
            "email": "investor@tesla-invest.com", "password": "Password123!"
        })
        assert s1 == 200 and d1["user"]["fullName"] == "Jason Evans"
        investor_token = d1["token"]

        s2, d2 = make_req("/api/auth/login", method="POST", data={
            "email": "admin@tesla-invest.com", "password": "AdminPass123!"
        })
        assert s2 == 200 and d2["user"]["role"] == "ADMIN"
        admin_token = d2["token"]
    if run_test("1. Authentication (Investor & Admin Desks)", test_logins): passed += 1

    # 2. 1-Click Role Switch Endpoint
    total += 1
    def test_role_switch():
        s, d = make_req("/api/auth/switch-role", method="POST", token=investor_token, data={
            "targetRole": "admin"
        })
        assert s == 200 and d["user"]["role"] == "ADMIN"
        s2, d2 = make_req("/api/auth/switch-role", method="POST", token=admin_token, data={
            "targetRole": "investor"
        })
        assert s2 == 200 and d2["user"]["role"] == "USER"
    if run_test("2. Instant 1-Click Perspective Switching", test_role_switch): passed += 1

    # 3. Deposit Process & Chatroom Workflow
    total += 1
    def test_deposit_and_chat():
        # User deposits wire enquiry
        s1, d1 = make_req("/api/deposits", method="POST", token=investor_token, data={
            "amount": 5000.0, "method": "WIRE", "memo": "REF-TSLA-DEPOSIT-SIM"
        })
        assert s1 == 200 and d1["success"] is True
        dep_id = d1["deposit"]["id"]

        # User sends message to Admin via private chatroom
        s2, d2 = make_req("/api/messages", method="POST", token=investor_token, data={
            "content": "Requesting verified custodial wire coordinates for $5,000.00 USD incoming transfer.",
            "subject": "Deposit Coordination"
        })
        assert s2 == 200 and d2["success"] is True

        # Admin fetches conversations
        s3, d3 = make_req("/api/admin/conversations", token=admin_token)
        assert s3 == 200 and len(d3["conversations"]) >= 1

        # Admin replies to Jason Evans
        conv_id = d3["conversations"][0]["id"]
        s4, d4 = make_req(f"/api/admin/conversations/{conv_id}/messages", method="POST", token=admin_token, data={
            "content": "Wire instructions dispatched. Routing: 021000021, Account: 482199042, Beneficiary: Tesla Capital Escrow."
        })
        assert s4 == 200 and d4["success"] is True

        # User fetches messages and sees Admin reply
        s5, d5 = make_req("/api/messages", token=investor_token)
        assert s5 == 200
        admin_msgs = [m for m in d5["messages"] if m.get("senderRole", "").upper() == "ADMIN"]
        assert len(admin_msgs) >= 1, "User should receive admin reply in private chat"

        # Admin approves deposit
        s6, d6 = make_req(f"/api/admin/deposits/{dep_id}/approve", method="POST", token=admin_token)
        assert s6 == 200 and d6["success"] is True
    if run_test("3. Deposit Flow & 1-on-1 Encrypted Chatroom Desk", test_deposit_and_chat): passed += 1

    # 4. Admin User Balance Adjustment & Immediate Reflection
    total += 1
    def test_balance_management():
        # Set exact balance
        s1, d1 = make_req("/api/admin/set-balance", method="POST", token=admin_token, data={
            "userId": "user_jason_evans",
            "amount": 3500.00,
            "reason": "Institutional simulated allocation"
        })
        assert s1 == 200 and d1["success"] is True

        # Check investor portfolio immediately
        s2, d2 = make_req("/api/portfolio", token=investor_token)
        assert s2 == 200
        assert abs(d2["valuation"]["availableCash"] - 3500.00) < 0.01, f"Expected 3500.00, got {d2['valuation']['availableCash']}"

        # Adjust delta (-500)
        s3, d3 = make_req("/api/admin/adjust-balance", method="POST", token=admin_token, data={
            "userId": "user_jason_evans",
            "amount": -500.00,
            "reason": "Simulated escrow transfer"
        })
        assert s3 == 200 and d3["success"] is True

        # Verify balance is 3000.00
        s4, d4 = make_req("/api/portfolio", token=investor_token)
        assert abs(d4["valuation"]["availableCash"] - 3000.00) < 0.01
    if run_test("4. Real-Time Balance Setting & Delta Adjustment", test_balance_management): passed += 1

    # 5. Withdrawal Request, 72h Sequential Processing, and Balance Clearance
    total += 1
    def test_withdrawal_sequence_and_clearance():
        # User submits withdrawal for $2,985 ($3,000 cash minus $15 wire fee)
        s1, d1 = make_req("/api/withdrawals", method="POST", token=investor_token, data={
            "amount": 2985.00,
            "method": "WIRE",
            "destination": "JPMorgan Chase (Acct ****4821)",
            "clearBalanceOnComplete": True
        })
        assert s1 == 200 and d1["success"] is True
        w_id = d1["withdrawal"]["id"]
        assert d1["withdrawal"]["step"] == 1
        assert d1["withdrawal"]["hoursRemaining"] == 72.0

        # Admin advances step 1 -> step 2
        s2, d2 = make_req(f"/api/admin/withdrawals/{w_id}/advance", method="POST", token=admin_token)
        assert s2 == 200 and d2["withdrawal"]["step"] == 2
        assert d2["withdrawal"]["hoursRemaining"] == 48.0

        # Admin advances step 2 -> step 3
        s3, d3 = make_req(f"/api/admin/withdrawals/{w_id}/advance", method="POST", token=admin_token)
        assert s3 == 200 and d3["withdrawal"]["step"] == 3
        assert d3["withdrawal"]["hoursRemaining"] == 24.0

        # Admin completes withdrawal with balance clearance
        s4, d4 = make_req(f"/api/admin/withdrawals/{w_id}/complete", method="POST", token=admin_token, data={
            "clearBalance": True
        })
        assert s4 == 200 and d4["success"] is True
        assert d4["withdrawal"]["status"] == "COMPLETED"
        assert d4["withdrawal"]["hoursRemaining"] == 0.0

        # Verify User cash balance is cleared to $0.00
        s5, d5 = make_req("/api/portfolio", token=investor_token)
        assert s5 == 200
        assert d5["valuation"]["availableCash"] == 0.0, f"Expected cash to be cleared to 0.0, got {d5['valuation']['availableCash']}"

        # Verify audit ledger contains cryptographic entries
        s6, d6 = make_req("/api/transactions", token=investor_token)
        assert s6 == 200
        txs = d6["transactions"]
        clearance_tx = [t for t in txs if t["type"] == "ACCOUNT_CLEARANCE"]
        settled_tx = [t for t in txs if t["type"] == "WITHDRAWAL_SETTLED"]
        assert len(clearance_tx) >= 1, "ACCOUNT_CLEARANCE ledger entry missing"
        assert len(settled_tx) >= 1, "WITHDRAWAL_SETTLED ledger entry missing"
        assert "hash" in clearance_tx[0], "Cryptographic hash missing"
    if run_test("5. 72-Hour Sequential Payout & Account Clearance to $0.00", test_withdrawal_sequence_and_clearance): passed += 1

    print("=" * 70)
    print(f"SIMULATION SUITE RESULTS: {passed}/{total} PASSED")
    print("=" * 70)

    if passed == total:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

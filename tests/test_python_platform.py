import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:3000"

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

def make_req(path, method="GET", data=None, token=None):
    url = BASE_URL + path
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), json.loads(resp.read().decode("utf-8"))

def main():
    print("=" * 60)
    print("TESLA CAPITAL PYTHON & REACT PLATFORM VERIFICATION")
    print("=" * 60)

    passed = 0
    total = 0

    investor_token = None
    admin_token = None

    # Test 1: Investor Login
    total += 1
    def test_investor_login():
        nonlocal investor_token
        status, data = make_req("/api/auth/login", method="POST", data={
            "email": "investor@tesla-invest.com",
            "password": "Password123!"
        })
        assert status == 200, f"Expected 200, got {status}"
        assert data["user"]["fullName"] == "Jason Evans", "Expected user Jason Evans"
        assert "token" in data, "Token missing"
        investor_token = data["token"]
    if run_test("Investor Login (Jason Evans)", test_investor_login): passed += 1

    # Test 2: Admin Login
    total += 1
    def test_admin_login():
        nonlocal admin_token
        status, data = make_req("/api/auth/login", method="POST", data={
            "email": "admin@tesla-invest.com",
            "password": "AdminPass123!"
        })
        assert status == 200, f"Expected 200, got {status}"
        assert data["user"]["role"] == "ADMIN", "Expected ADMIN role"
        assert "token" in data, "Token missing"
        admin_token = data["token"]
        
        # Ensure investor has sufficient testing liquidity for repeatable tests
        make_req("/api/admin/adjust-balance", method="POST", token=admin_token, data={
            "userId": "user_jason_evans",
            "amount": 2500.00,
            "reason": "Replenish test liquidity harness"
        })
    if run_test("Admin Login (Tesla Operations Admin)", test_admin_login): passed += 1

    # Test 3: Portfolio Retrieval
    total += 1
    def test_portfolio():
        status, data = make_req("/api/portfolio", token=investor_token)
        assert status == 200, f"Expected 200, got {status}"
        assert "valuation" in data, "Valuation missing"
        assert data["valuation"]["availableCash"] > 0, "Expected positive cash balance"
        assert len(data["positions"]) >= 1, "Expected at least 1 position"
    if run_test("Portfolio Ledger & Valuation Retrieval", test_portfolio): passed += 1

    # Test 4: Market Data API
    total += 1
    def test_market():
        status, data = make_req("/api/market-data?symbol=TSLA")
        assert status == 200, f"Expected 200, got {status}"
        assert data["quote"]["symbol"] == "TSLA", "Expected TSLA symbol"
        assert len(data["chart"]) > 0, "Expected chart points"
    if run_test("NASDAQ Streaming Market Telemetry", test_market): passed += 1

    # Test 5: Atomic Double-Entry Trade Execution
    total += 1
    def test_trade_buy():
        status, data = make_req("/api/trade", method="POST", token=investor_token, data={
            "symbol": "TSLA",
            "side": "BUY",
            "amount": 250.00
        })
        assert status == 200, f"Expected 200, got {status}"
        assert data["success"] is True, "Trade failed"
        assert "hash" in data["ledger"], "Double-entry hash missing"
    if run_test("Atomic Equity BUY & Ledger Balancing", test_trade_buy): passed += 1

    # Test 6: Overdraft Prevention
    total += 1
    def test_overdraft():
        try:
            make_req("/api/trade", method="POST", token=investor_token, data={
                "symbol": "TSLA",
                "side": "BUY",
                "amount": 999999999.00
            })
            assert False, "Should have thrown overdraft exception"
        except urllib.error.HTTPError as e:
            assert e.code == 400, f"Expected 400 bad request, got {e.code}"
    if run_test("Insufficient Funds Overdraft Prevention", test_overdraft): passed += 1

    # Test 7: Withdrawal 72h SLA Booking
    total += 1
    def test_withdrawal():
        status, data = make_req("/api/withdrawals", method="POST", token=investor_token, data={
            "amount": 100.00,
            "method": "WIRE",
            "destination": "Chase Checking ****9921"
        })
        assert status == 200, f"Expected 200, got {status}"
        assert data["success"] is True, "Withdrawal failed"
        assert "deadlineAt" in data["withdrawal"], "72-hour deadline missing"
        assert data["withdrawal"]["fee"] == 15.0, "Expected $15 wire fee"
    if run_test("72-Hour Guaranteed Settlement SLA Reservation", test_withdrawal): passed += 1

    # Test 8: Deposit Request Generation
    total += 1
    def test_deposit():
        status, data = make_req("/api/deposits", method="POST", token=investor_token, data={
            "amount": 2500.00,
            "method": "WIRE",
            "memo": "REF-VERIFIED-TEST"
        })
        assert status == 200, f"Expected 200, got {status}"
        assert data["success"] is True, "Deposit failed"
        assert "reference" in data["deposit"], "Deposit reference missing"
    if run_test("Deposit Slip & Reference Generation", test_deposit): passed += 1

    # Test 9: Admin Audit & Balance Adjustment
    total += 1
    def test_admin_adjustment():
        status, data = make_req("/api/admin/adjust-balance", method="POST", token=admin_token, data={
            "userId": "user_jason_evans",
            "amount": 200.00,
            "reason": "Test audit ledger credit"
        })
        assert status == 200, f"Expected 200, got {status}"
        assert data["success"] is True, "Adjustment failed"
        assert "audit" in data, "Audit record missing"
    if run_test("Admin Balance Adjustment with Audit Trail", test_admin_adjustment): passed += 1

    # Test 10: HTML & React Bundle Serving
    total += 1
    def test_static_html():
        url = BASE_URL + "/"
        with urllib.request.urlopen(url) as resp:
            content = resp.read().decode("utf-8")
            assert resp.getcode() == 200, "Expected 200 for index.html"
            assert '<div id="root"></div>' in content, "Root element missing in HTML"
            assert "/static/bundle.js" in content, "React bundle script missing"
    if run_test("HTML5 Root & React Bundle Script Serving", test_static_html): passed += 1

    print("=" * 60)
    print(f"TEST RESULTS: {passed}/{total} PASSED")
    print("=" * 60)

    if passed == total:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

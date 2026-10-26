# TESLA CAPITAL | INSTITUTIONAL INVESTMENT DESK

A high-frequency institutional equity brokerage & custody platform built exclusively with **Python (FastAPI)**, **React.js**, and **HTML5**. Features double-entry financial ledger accounting, live streaming NASDAQ telemetry feeds, dedicated investor workstation, dedicated operations administrative clearinghouse, verified institutional testimonials, and audited 72-hour guaranteed settlement SLA workflows.

---

## 1. Core Architecture & Technology Stack

- **Backend (Python 3.13 / FastAPI):**
  - High-performance asynchronous REST API powered by Starlette & Uvicorn.
  - Double-entry financial ledger accounting engine (`backend/ledger.py`) with cryptographic SHA-256 audit chaining.
  - Sub-second synthetic and live NASDAQ market telemetry engine (`backend/market_data.py`).
  - Bcrypt password hashing with HTTP-only JWT bearer authentication (`backend/auth.py`).
  - Atomic JSON database store (`backend/database.py`) with persistent ACID-like writes.
- **Frontend (React.js + HTML5):**
  - Clean modular React components (`src_frontend/index.jsx`) bundled to `static/bundle.js` via `esbuild`.
  - Modern HTML5 shell (`static/index.html`) utilizing Inter and JetBrains Mono fonts with Tailwind CSS.
  - Lucide React icon system and custom interactive SVG financial charting canvas.
  - No bloated runtime dependencies.

---

## 2. Institutional Authentication & Pre-Seeded Portfolios

The platform enforces clean, discrete institutional authentication with zero demo shortcuts:

| Portal | User | Email | Password | Portfolio / Role |
| :--- | :--- | :--- | :--- | :--- |
| **Investor Workstation** | Jason Evans | `investor@tesla-invest.com` | `Password123!` | **$12,482.36 NAV** (26.98 TSLA shares + $1,245.00 settled cash, JPMorgan Chase custody) |
| **Operations Clearinghouse** | Tesla Admin | `admin@tesla-invest.com` | `AdminPass123!` | Double-entry ledger audit, balance adjustments, trade oversight, settlement dispatch |

---

## 3. Platform Capabilities & Workflows

### Public Landing & Institutional Validation
- **Hero & Market Telemetry:** Live NASDAQ execution matching (&lt;15ms latency), TSLA live quotes, and Megapack energy / Cybercab robotaxi allocation tranches.
- **Institutional Testimonials:** Verified reviews from accredited institutional LPs:
  - **Marcus Vance** (Managing Partner, Apex Alpha Capital • $42M AUM)
  - **Elena Rostova** (CIO, Horizon Grid Ventures • $18.5M AUM)
  - **David Sterling** (Senior PM, Silicon Horizon Tech Fund • $25M AUM)
- **Trust Matrix:** Over $4.8B+ audited volume, 100% double-entry ledger reconciliation, and 72-hour guaranteed settlement SLA.

### Distinct Investor Workstation
- **Cockpit Header:** Displays Tier 2 Verified badge, Account `#TSLA-INV-8942`, JPMorgan Chase N.A. custody verification, and direct L3 feed indicator.
- **Net Asset Value (NAV):** Real-time equity mark-to-market calculations and multi-interval charts (1D, 1W, 1M, 1Y, ALL).
- **KPI Matrix & Positions:** Real-time settled cash liquidity, invested capital basis, realized P&L, and position trade execution.
- **SLA Countdown & Deposits:** Automated 72-hour withdrawal countdown tracking and wire transfer deposit slip generator.

### Dedicated Administrative Portal (`/admin-login`)
- **Restricted Access Vault:** Styled in obsidian and crimson with security MFA token validation (`8942-AUTH`).
- **Clearinghouse Operations:** Real-time ledger entries inspection, customer balance adjustments with mandatory audit reason logging, and compliance oversight.

---

## 4. Local Installation & Startup

### Prerequisites
- Python 3.10+
- Node.js 18+ (for bundling frontend)

### Setup
```bash
# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Build the React frontend
node build_frontend.js

# 3. Launch the FastAPI server
python backend/main.py
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Automated Testing
Run the comprehensive test suite verifying authentication, trades, ledger reconciliation, SLA reservation, and static file delivery:
```bash
python tests/test_python_platform.py
```
All 10/10 automated tests pass.

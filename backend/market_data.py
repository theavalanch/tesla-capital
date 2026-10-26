import math
import random
import time
from typing import Dict, Any, List

BASE_PRICES = {
    "TSLA": 462.78,
    "CYBERCAB": 128.40,
    "FLEET": 89.15
}

def get_market_quote(symbol: str = "TSLA") -> Dict[str, Any]:
    symbol = symbol.upper()
    base = BASE_PRICES.get(symbol, 462.78)
    # Micro drift
    jitter = (random.random() - 0.48) * 0.45
    price = round(max(10.0, base + jitter), 2)
    change = round(price - (base * 0.972), 2)
    change_pct = round((change / (base * 0.972)) * 100, 2)

    return {
        "symbol": symbol,
        "price": price,
        "change": change,
        "changePercent": change_pct,
        "marketCap": "$842.5B" if symbol == "TSLA" else "$120.8B",
        "open": round(base * 0.975, 2),
        "high": round(price * 1.015, 2),
        "low": round(price * 0.985, 2),
        "volume": "34.2M" if symbol == "TSLA" else "12.8M",
        "sla": "< 12ms",
        "lastUpdated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

def get_chart_data(symbol: str = "TSLA", timeframe: str = "1D") -> List[Dict[str, Any]]:
    symbol = symbol.upper()
    base = BASE_PRICES.get(symbol, 462.78)
    points = []
    count = 36

    for i in range(count):
        hour = 9 + int((i * 6.5) / count)
        minute = int(((i * 6.5) % 1) * 60)
        time_str = f"{hour:02d}:{minute:02d} EST"
        noise = math.sin(i * 0.4) * 3.8 + (i / count) * 6.5
        p = round(base - 10 + noise, 2)
        vol = int(120000 + abs(math.sin(i)) * 450000)
        points.append({"time": time_str, "price": p, "volume": vol})

    # Ensure last point matches current price
    if points:
        points[-1]["price"] = base
    return points

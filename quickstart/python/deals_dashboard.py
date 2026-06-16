"""Tutorial 03 — A cheap-flights board: cheapest deal from one origin to many destinations.

Run: RAPIDAPI_KEY=... RAPIDAPI_HOST=... python deals_dashboard.py [ORIGIN] [DEST,DEST,...]
"""
import sys
from concurrent.futures import ThreadPoolExecutor
from client import TurismocityClient

# Print UTF-8 (airline names) correctly on Windows consoles too.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

api = TurismocityClient()
args = sys.argv[1:]
ORIGIN = args[0] if len(args) > 0 else "EZE"
DESTS = (args[1] if len(args) > 1 else "MAD,MIA,GRU,SCL,PUJ,MEX").split(",")


def fetch(to: str) -> dict:
    try:
        d = api.deals(to=to, currency="USD", **{"from": ORIGIN})
        top = (d.get("deals") or [None])[0]
        return {
            "to": to,
            "cheapest": d["cheapest"],
            "roundtrip": d["byType"]["roundtrip"],
            "when": f'{top["outbound"]} -> {top.get("inbound") or "one-way"}' if top else "",
            "airline": (top or {}).get("airlineName", ""),
        }
    except Exception:
        return {"to": to, "cheapest": None}


with ThreadPoolExecutor(max_workers=6) as pool:
    rows = list(pool.map(fetch, DESTS))

rows.sort(key=lambda r: r["cheapest"] if r["cheapest"] is not None else 1e9)

print(f"\nCheapest flights from {ORIGIN} (USD)\n")
print("DEST   CHEAPEST   ROUND-TRIP   DATES                    AIRLINE")
print("-" * 72)
for r in rows:
    if r["cheapest"] is None:
        print(f'{r["to"]:<6} (no data)')
        continue
    print(
        f'{r["to"]:<6} ${str(r["cheapest"]):<8} ${str(r["roundtrip"]):<10} '
        f'{r["when"]:<24} {r["airline"]}'
    )

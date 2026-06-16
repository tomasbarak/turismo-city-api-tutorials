"""Tutorial 01 — Autocomplete -> search -> best fares with booking links.

Run: RAPIDAPI_KEY=... RAPIDAPI_HOST=... python search_booking.py [FROM] [TO] [DEPART] [RETURN]
"""
import re
import sys
import time
from datetime import date, timedelta
from client import TurismocityClient

# Print UTF-8 (airline names) correctly on Windows consoles too.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

api = TurismocityClient()
args = sys.argv[1:]
FROM = args[0] if len(args) > 0 else "EZE"
TO = args[1] if len(args) > 1 else "MAD"
depart = args[2] if len(args) > 2 else (date.today() + timedelta(days=30)).isoformat()
ret = args[3] if len(args) > 3 else (date.today() + timedelta(days=37)).isoformat()


def resolve(code_or_name: str) -> str:
    if re.fullmatch(r"[A-Za-z]{3}", code_or_name):
        return code_or_name.upper()
    results = api.airports(code_or_name)["results"]
    if not results:
        raise SystemExit(f'No airport for "{code_or_name}"')
    print(f'Resolved "{code_or_name}" -> {results[0]["iata"]} ({results[0]["name"]})')
    return results[0]["iata"]


frm, to = resolve(FROM), resolve(TO)
print(f"\nSearching {frm} -> {to}  {depart} / {ret} ...")
result = api.search(to=to, departDate=depart, returnDate=ret, currency="USD", **{"from": frm})

# First search may be "partial" while slow providers finish — poll briefly.
tries = 0
while result.get("status") != "complete" and tries < 3:
    tries += 1
    time.sleep(2.5)
    result = api.poll_search(result["searchId"], currency="USD")

print(f'\nStatus: {result["status"]} · {result["totalItineraries"]} itineraries')
print(f'Cheapest: ${result["cheapestPrice"]} {result["currency"]}')

print("\nBest options:")
for b in result["best"]:
    print(f'  {b["kind"]:<16} ${b["price"]}  ->  {b["bookingUrl"]}')

print("\nCheapest by airline:")
for a in result["airlines"][:5]:
    print(f'  {a["iata"]}  {a["name"]:<24} ${a["lowestPrice"]}')

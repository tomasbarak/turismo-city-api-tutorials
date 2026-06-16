"""Quickstart: autocomplete -> deals -> search.

Run:  RAPIDAPI_KEY=... RAPIDAPI_HOST=... python quickstart.py
"""
import sys
from datetime import date, timedelta
from client import TurismocityClient

# Print UTF-8 (airline names) correctly on Windows consoles too.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

api = TurismocityClient()


def in_days(n: int) -> str:
    return (date.today() + timedelta(days=n)).isoformat()


# 1) Look up an airport
airports = api.airports("madr", iso="AR")
first = airports["results"][0]
print("Airport:", first["iata"], first["name"])

# 2) Cheapest deals EZE -> MIA  ("from" is a Python keyword, so pass via dict)
deals = api.deals(to="MIA", currency="USD", **{"from": "EZE"})
print(f"Cheapest EZE->MIA: ${deals['cheapest']} (round-trip ${deals['byType']['roundtrip']})")

# 3) Live search a round-trip ~30 days out
search = api.search(
    to="MAD", departDate=in_days(30), returnDate=in_days(37), currency="USD", **{"from": "EZE"}
)
print(f"\nEZE->MAD: {search['totalItineraries']} itineraries, cheapest ${search['cheapestPrice']}")
top = ", ".join(f"{a['name']} ${a['lowestPrice']}" for a in search["airlines"][:3])
print("Top airlines:", top)
best = next((b for b in search["best"] if b["kind"] == "bestPrice"), None)
if best:
    print("Book the cheapest:", best["bookingUrl"])

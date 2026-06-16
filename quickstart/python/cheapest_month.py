"""Tutorial 02 — Find the cheapest month to fly a route (calendar feed).

Run: RAPIDAPI_KEY=... RAPIDAPI_HOST=... python cheapest_month.py [FROM] [TO]
"""
import sys
from client import TurismocityClient

api = TurismocityClient()
args = sys.argv[1:]
FROM = args[0] if len(args) > 0 else "EZE"
TO = args[1] if len(args) > 1 else "MAD"
MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

cal = api.calendar(to=TO, currency="USD", **{"from": FROM})
months = sorted(cal["months"], key=lambda m: m["minPrice"])

print(f"Cheapest months for {FROM} -> {TO} (USD):\n")
for i, m in enumerate(months):
    tag = "  <-- cheapest" if i == 0 else ""
    print(f'  {MONTHS[m["month"]]} {m["year"]}   ${m["minPrice"]}{tag}')

best = months[0]
print(
    f'\nFly in {MONTHS[best["month"]]} {best["year"]} for ~${best["minPrice"]} '
    f'(vs ${months[-1]["minPrice"]} in the priciest month).'
)

"""Tutorial 04 — Price-drop alert: current price vs a threshold, with 90-day context.

Run once: RAPIDAPI_KEY=... RAPIDAPI_HOST=... python price_alert.py EZE MAD 2026-09-15 2026-09-22 1200
Schedule it with cron/Task Scheduler, or use the loop at the bottom.
"""
import sys
import time
from datetime import date, timedelta
from client import TurismocityClient

api = TurismocityClient()
args = sys.argv[1:]
FROM = args[0] if len(args) > 0 else "EZE"
TO = args[1] if len(args) > 1 else "MAD"
depart = args[2] if len(args) > 2 else (date.today() + timedelta(days=30)).isoformat()
ret = args[3] if len(args) > 3 else (date.today() + timedelta(days=37)).isoformat()
threshold = float(args[4]) if len(args) > 4 else 1200.0


def notify(message: str) -> None:
    # Swap for email/Slack/Telegram/push in production.
    print(f"ALERT: {message}")


def check_once() -> float | None:
    # 1) Current cheapest from a live search.
    r = api.search(to=TO, departDate=depart, returnDate=ret, currency="USD", **{"from": FROM})
    tries = 0
    while r.get("status") != "complete" and tries < 3:
        tries += 1
        time.sleep(2.5)
        r = api.poll_search(r["searchId"], currency="USD")
    price = r["cheapestPrice"]

    # 2) 90-day average for context.
    hist = api.history(FROM, TO, departDate=depart, returnDate=ret, currency="USD")
    points = hist["upstream90d"]
    avg = sum(p["avgPrice"] for p in points) / len(points) if points else None
    vs = f" (90-day avg ~${avg:.0f}, {'below' if price < avg else 'above'} average)" if avg else ""
    print(f"{FROM}->{TO} {depart}/{ret}: cheapest ${price}{vs}")

    book = next((b["bookingUrl"] for b in r["best"] if b["kind"] == "bestPrice"), None)
    if price is not None and price <= threshold:
        notify(f"{FROM}->{TO} dropped to ${price} (<= ${threshold}). Book: {book}")
    return price


if __name__ == "__main__":
    check_once()
    # To poll continuously instead of via system cron:
    # while True:
    #     time.sleep(6 * 3600)
    #     check_once()

# Tutorial 4 — Price-drop alerts

**Goal:** watch a route and get notified when the fare drops below your target — with
90-day history to judge whether it's *actually* a good price.

Runnable: [`quickstart/javascript/price-alert.mjs`](../quickstart/javascript/price-alert.mjs) ·
[`quickstart/python/price_alert.py`](../quickstart/python/price_alert.py)

## The idea

On a schedule (say every 6 hours):

1. Get the **current cheapest** via `/v1/flights/search` (poll until `complete`).
2. Pull the **90-day average** via `/v1/routes/{from}/{to}/history` for context.
3. If current ≤ your threshold (or well below the average), **notify**.

## Why use history

A "$1,200 EZE→MAD" deal means nothing without context. The history endpoint gives the
route's recent average so you can frame it:

```json
{ "origin": "EZE", "destination": "MAD",
  "upstream90d": [ { "date": "2026-03-21", "avgPrice": 1081.02 }, ... ] }
```

```js
const hist = await api.history("EZE", "MAD", { departDate, returnDate, currency: "USD" });
const avg = hist.upstream90d.reduce((s, p) => s + p.avgPrice, 0) / hist.upstream90d.length;
const verdict = price < avg ? "below" : "above";
```

> Pass `stored=true` to also get the API's own long-term series (it accumulates history
> beyond the upstream 90-day window), great for longer trend lines.

## Wire up a notifier

The examples log to the console — swap `notify()` for your channel:

```js
async function notify(message) {
  await fetch("https://hooks.slack.com/services/XXX", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: message }),
  });
}
```

(Email via SendGrid, Telegram bot, web-push, etc. all work the same way.)

## Run it

```bash
# args: FROM TO DEPART RETURN THRESHOLD
node quickstart/javascript/price-alert.mjs EZE MAD 2026-09-15 2026-09-22 1200
python quickstart/python/price_alert.py EZE MAD 2026-09-15 2026-09-22 1200
```

## Schedule it

- **Linux/macOS cron** (every 6h):
  ```cron
  0 */6 * * * RAPIDAPI_KEY=... RAPIDAPI_HOST=... node /path/price-alert.mjs EZE MAD 2026-09-15 2026-09-22 1200
  ```
- **Windows Task Scheduler:** run the script on a 6-hour trigger.
- **Always-on process:** uncomment the `setInterval` / `while True` loop at the bottom of
  the script.

## Mind your quota

Each check does one search (+ a few polls) and one history call. At every 6 hours that's
~5 calls/day per watched route — comfortably within a paid plan. If you watch many routes,
batch them and stagger to respect your plan's rate limit.

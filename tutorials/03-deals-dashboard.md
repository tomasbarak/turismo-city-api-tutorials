# Tutorial 3 — Build a cheap-flights deals board

**Goal:** a "flights from Buenos Aires" board — the cheapest current fare to a list of
destinations, sorted by price. Great for a homepage widget or a daily digest.

Runnable: [`quickstart/javascript/deals-dashboard.mjs`](../quickstart/javascript/deals-dashboard.mjs) ·
[`quickstart/python/deals_dashboard.py`](../quickstart/python/deals_dashboard.py)

## The endpoint

`GET /v1/deals?to=MIA&from=EZE` returns the cheapest fares to a destination, including
concrete date pairs:

```json
{
  "destination": "MIA",
  "origin": "EZE",
  "cheapest": 568,
  "byType": { "roundtrip": 568, "oneway": 312, "multi": 690 },
  "deals": [
    { "origin": "EZE", "destination": "MIA", "price": 568,
      "outbound": "2026-07-12", "inbound": "2026-07-20", "airlineName": "American Airlines" }
  ]
}
```

> `/v1/deals` is **pre-warmed server-side** for popular routes, so it's fast and cheap —
> ideal for a board you refresh often.

## Fan out across destinations

Fetch all destinations in parallel, then sort:

```js
const destinations = ["MAD", "MIA", "GRU", "SCL", "PUJ", "MEX"];
const rows = await Promise.all(
  destinations.map((to) => api.deals({ from: "EZE", to, currency: "USD" })),
);
rows.sort((a, b) => a.cheapest - b.cheapest);
```

Python uses a thread pool (`ThreadPoolExecutor`) for the same effect — see the script.

## Run it

```bash
node quickstart/javascript/deals-dashboard.mjs EZE MAD,MIA,GRU,SCL,PUJ,MEX
python quickstart/python/deals_dashboard.py EZE MAD,MIA,GRU,SCL
```

Example output:

```
✈  Cheapest flights from EZE (USD)

DEST   CHEAPEST   ROUND-TRIP   DATES                    AIRLINE
------------------------------------------------------------------------
SCL    $164       $164         2026-07-03 → 2026-07-10  JetSmart
GRU    $238       $238         2026-07-09 → 2026-07-16  GOL
PUJ    $562       $562         2026-08-02 → 2026-08-12  Arajet
MIA    $568       $568         2026-07-12 → 2026-07-20  American Airlines
...
```

## Make it a product

- **Daily email digest:** run on a cron, render the rows to HTML, send the top N.
- **Homepage board:** cache the result for ~10–30 min on your side and serve statically.
- **Per-user origins:** detect the user's nearest airport (or let them pick), then fan out.
- Link each row to a full search (Tutorial 1) for live options + booking.

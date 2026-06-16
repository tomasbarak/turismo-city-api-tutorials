# Tutorial 1 — Search flights and surface booking links

**Goal:** turn a city name into a flight search, then show the cheapest fares with
direct booking links. This is the backbone of any flight app.

Runnable: [`quickstart/javascript/search-booking.mjs`](../quickstart/javascript/search-booking.mjs) ·
[`quickstart/python/search_booking.py`](../quickstart/python/search_booking.py)

## The flow

1. **Autocomplete** the origin/destination to IATA codes (`/v1/airports`).
2. **Search** (`/v1/flights/search`).
3. The first response may be `status: "partial"` — slow OTAs are still reporting.
   **Poll** `/v1/flights/search/{searchId}` a few times until `complete`.
4. Read `cheapestPrice`, `airlines[]`, and `best[]` (each `best` option has a
   `bookingUrl` deep link).

## Why polling?

Flight metasearch is asynchronous — the API queries dozens of airlines/agencies. You get
usable results in a couple seconds (`partial`), and the full set settles shortly after.
For a snappy UX: render `partial` immediately, then refresh from the poll endpoint.

```js
let result = await api.search({ from, to, departDate, returnDate, currency: "USD" });
let tries = 0;
while (result.status !== "complete" && tries++ < 3) {
  await new Promise((r) => setTimeout(r, 2500));
  result = await api.pollSearch(result.searchId, { currency: "USD" });
}
```

## Reading the result

```jsonc
{
  "status": "complete",
  "cheapestPrice": 1314.04,
  "airlines": [{ "iata": "AA", "name": "American Airlines", "lowestPrice": 1314.04 }],
  "best": [
    { "kind": "bestPrice",        "price": 1314.04, "bookingUrl": "https://..." },
    { "kind": "bestDuration",     "price": 1519.20, "bookingUrl": "https://..." },
    { "kind": "bestPriceDuration","price": 1519.20, "bookingUrl": "https://..." }
  ]
}
```

- `best.bestPrice` → cheapest overall. `best.bestDuration` → fastest. `bestPriceDuration`
  → the best balance. Send users straight to `bookingUrl`.
- `airlines[]` and `providers[]` give per-airline / per-agency minimums for filters.

## Run it

```bash
# Node — defaults to EZE -> MAD; pass your own:
node quickstart/javascript/search-booking.mjs EZE MIA 2026-10-01 2026-10-09
# Python — accepts city names too (auto-resolves via autocomplete):
python quickstart/python/search_booking.py "Buenos Aires" Madrid
```

## Production tips

- Cache identical searches on your side too — the API caches upstream, but you can avoid
  even the round trip for repeated queries.
- Show the `status` to users ("still searching…") and refresh, rather than blocking.
- Always send users to the `bookingUrl`; never quote a price as final (it's an estimate).

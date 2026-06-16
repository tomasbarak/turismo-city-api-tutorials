# Tutorial 2 — Find the cheapest month to fly

**Goal:** answer "when is it cheapest to fly EZE → MAD?" without running 12 searches.

Runnable: [`quickstart/javascript/cheapest-month.mjs`](../quickstart/javascript/cheapest-month.mjs) ·
[`quickstart/python/cheapest_month.py`](../quickstart/python/cheapest_month.py)

## The endpoint

`GET /v1/flights/calendar?to=MAD&from=EZE` returns the cheapest fare per month:

```json
{
  "origin": "EZE",
  "destination": "MAD",
  "currency": "USD",
  "months": [
    { "year": 2026, "month": 6, "minPrice": 923 },
    { "year": 2026, "month": 7, "minPrice": 933 },
    { "year": 2026, "month": 8, "minPrice": 880 }
  ]
}
```

## Find the cheapest

Just sort by `minPrice`:

```js
const cal = await api.calendar({ from: "EZE", to: "MAD", currency: "USD" });
const cheapest = [...cal.months].sort((a, b) => a.minPrice - b.minPrice)[0];
console.log(`Cheapest: ${cheapest.month}/${cheapest.year} at $${cheapest.minPrice}`);
```

```python
cal = api.calendar(to="MAD", currency="USD", **{"from": "EZE"})
cheapest = sorted(cal["months"], key=lambda m: m["minPrice"])[0]
```

## Run it

```bash
node quickstart/javascript/cheapest-month.mjs EZE MAD
python quickstart/python/cheapest_month.py EZE GRU
```

Example output:

```
Cheapest months for EZE -> MAD (USD):

  Aug 2026   $880  <-- cheapest
  Jun 2026   $923
  Jul 2026   $933
  ...
Fly in Aug 2026 for ~$880 (vs $1340 in the priciest month).
```

## Combine with search

Once you know the cheapest month, drill in: build dates in that month and call
`/v1/flights/search` (see [Tutorial 1](01-search-and-booking-links.md)) to get concrete
itineraries and booking links.

## Ideas

- Render `months` as a bar chart ("price by month").
- Add `oneWay=true` for one-way travelers.
- Use `/v1/deals` (which includes `monthsBestPrices` plus concrete `deals[]`) when you
  also want specific cheap date pairs, not just the monthly minimum.

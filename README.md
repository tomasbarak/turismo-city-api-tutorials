# Turismocity Flights API — Tutorials & Examples

Runnable examples and step-by-step tutorials for the **Turismocity Flights API** —
cheap flight search, deals, fare calendar, and price history for Argentina & Latin America.

> Get the API on RapidAPI, grab your key, and you're a few lines from live flight prices.

- 📖 Quickstarts: [cURL](quickstart/curl.md) · [JavaScript / Node](quickstart/javascript) · [Python](quickstart/python) · [PHP](quickstart/php)
- 🧑‍🍳 Tutorials: [Search + booking links](tutorials/01-search-and-booking-links.md) · [Cheapest-month finder](tutorials/02-cheapest-month-finder.md) · [Deals dashboard](tutorials/03-deals-dashboard.md) · [Price-drop alert](tutorials/04-price-drop-alert.md)

---

## 1. Authentication & base URL

You call the API **through the RapidAPI gateway**. Every request needs two headers:

| Header | Value |
|---|---|
| `X-RapidAPI-Key` | your key from the RapidAPI dashboard |
| `X-RapidAPI-Host` | your API's host, e.g. `turismocity-flights.p.rapidapi.com` |

The base URL is `https://<X-RapidAPI-Host>`. All examples read these from environment
variables so you never hard-code secrets:

```bash
export RAPIDAPI_KEY="your-key-here"
export RAPIDAPI_HOST="turismocity-flights.p.rapidapi.com"
```

> Replace the host with the exact one shown on your RapidAPI **Endpoints** tab.

## 2. Endpoints at a glance

| Method & path | Description | Key params |
|---|---|---|
| `GET /v1/airports` | Airport/city autocomplete | `q` (required), `iso`, `from` |
| `GET /v1/flights/search` | Search round-trip / one-way | `from`,`to`,`departDate` (required), `returnDate`, `adults`,`cabinClass`,`currency`,`iso` |
| `GET /v1/flights/search/{searchId}` | Poll an existing search | `currency` |
| `GET /v1/deals` | Cheapest flights to a destination | `to` (required), `from`,`currency`,`iso`,`oneWay`,`directOnly` |
| `GET /v1/flights/calendar` | Cheapest price per month | `to` (required), `from`,`currency`,`iso`,`oneWay` |
| `GET /v1/routes/{from}/{to}/history` | 90-day price history | `departDate` (required), `returnDate`,`currency`,`iso`,`stored` |

**Conventions**
- IATA codes are 3 letters (`EZE`, `MAD`). Use `/v1/airports` to look them up.
- Dates are `YYYY-MM-DD`. Omit `returnDate` for one-way.
- `currency`: `USD` (default), `ARS`, `BRL`, `CLP`, `MXN`, …
- `iso` (market): `AR` (default), `BR`, `CL`, `MX`, `CO`, `PE`, `UY`, …

## 3. 30-second quickstart

<details open><summary><b>cURL</b></summary>

```bash
curl --request GET \
  --url "https://$RAPIDAPI_HOST/v1/deals?to=MIA&from=EZE&currency=USD" \
  --header "X-RapidAPI-Key: $RAPIDAPI_KEY" \
  --header "X-RapidAPI-Host: $RAPIDAPI_HOST"
```
</details>

<details><summary><b>JavaScript / Node</b></summary>

```js
const host = process.env.RAPIDAPI_HOST;
const res = await fetch(`https://${host}/v1/deals?to=MIA&from=EZE&currency=USD`, {
  headers: {
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": host,
  },
});
console.log(await res.json());
```
</details>

<details><summary><b>Python</b></summary>

```python
import os, requests
host = os.environ["RAPIDAPI_HOST"]
r = requests.get(
    f"https://{host}/v1/deals",
    params={"to": "MIA", "from": "EZE", "currency": "USD"},
    headers={"X-RapidAPI-Key": os.environ["RAPIDAPI_KEY"], "X-RapidAPI-Host": host},
)
print(r.json())
```
</details>

<details><summary><b>PHP</b></summary>

```php
<?php
$host = getenv('RAPIDAPI_HOST');
$ch = curl_init("https://$host/v1/deals?to=MIA&from=EZE&currency=USD");
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "X-RapidAPI-Key: " . getenv('RAPIDAPI_KEY'),
    "X-RapidAPI-Host: $host",
  ],
]);
echo curl_exec($ch);
```
</details>

## 4. Response shapes you'll use most

**Search** (`/v1/flights/search`) — trimmed:
```json
{
  "status": "complete",
  "currency": "USD",
  "cheapestPrice": 1314.04,
  "airlines": [{ "iata": "AA", "name": "American Airlines", "lowestPrice": 1314.04 }],
  "providers": [{ "name": "Despegar", "bestPrice": 1314.04, "installments": 1 }],
  "best": [{ "kind": "bestPrice", "price": 1314.04, "bookingUrl": "https://..." }]
}
```

**Deals** (`/v1/deals`):
```json
{
  "cheapest": 568,
  "byType": { "roundtrip": 568, "oneway": 312, "multi": 690 },
  "monthsBestPrices": [{ "year": 2026, "month": 7, "minPrice": 568 }],
  "deals": [{ "origin": "EZE", "destination": "MIA", "price": 568, "outbound": "2026-07-12", "inbound": "2026-07-20", "airlineName": "American Airlines" }]
}
```

**History** (`/v1/routes/{from}/{to}/history`):
```json
{ "origin": "EZE", "destination": "MIA", "upstream90d": [{ "date": "2026-03-21", "avgPrice": 1081.02 }] }
```

## 5. Notes

- **First search takes a few seconds** (it polls many providers); repeats are cached and
  instant. For a snappy UI, kick off the search, then poll `/v1/flights/search/{searchId}`.
- Prices are aggregated estimates — always confirm on the provider via the booking link.
- Mind your plan's rate limit; the examples are deliberately gentle.

## Running the examples locally

```bash
# Node
cd quickstart/javascript && npm install && node quickstart.mjs

# Python
cd quickstart/python && pip install -r requirements.txt && python quickstart.py

# PHP
cd quickstart/php && php quickstart.php
```

Every example also accepts `BASE_URL` to point at a non-RapidAPI deployment (e.g. a direct
URL during development): `BASE_URL=https://your-app.up.railway.app node quickstart.mjs`.

## License

MIT — see [LICENSE](LICENSE). Not affiliated with Turismocity or any airline/agency.

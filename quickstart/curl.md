# cURL Quickstart

Set your credentials once:

```bash
export RAPIDAPI_KEY="your-key-here"
export RAPIDAPI_HOST="turismocity-api.p.rapidapi.com"
```

A reusable helper (optional) — every call needs the two headers:

```bash
tc() { curl -s --url "https://$RAPIDAPI_HOST$1" \
  --header "X-RapidAPI-Key: $RAPIDAPI_KEY" \
  --header "X-RapidAPI-Host: $RAPIDAPI_HOST"; }
```

> Tip: pipe any response through `| jq` for readable JSON.

## Autocomplete airports/cities

```bash
tc "/v1/airports?q=madr&iso=AR"
```

## Search flights (round-trip)

```bash
tc "/v1/flights/search?from=EZE&to=MAD&departDate=2026-09-15&returnDate=2026-09-22&currency=USD"
```

One-way — just omit `returnDate`:

```bash
tc "/v1/flights/search?from=EZE&to=MIA&departDate=2026-09-15&currency=USD"
```

With passengers and cabin:

```bash
tc "/v1/flights/search?from=EZE&to=GRU&departDate=2026-10-01&returnDate=2026-10-08&adults=2&children=1&cabinClass=Business"
```

## Poll an existing search

```bash
# searchId comes from the search response
tc "/v1/flights/search/abc123def456?currency=USD"
```

## Cheapest deals to a destination

```bash
tc "/v1/deals?to=MIA&from=EZE&currency=USD"
# one-way only:
tc "/v1/deals?to=MIA&from=EZE&oneWay=true"
# direct flights only:
tc "/v1/deals?to=MAD&from=EZE&directOnly=true"
```

## Fare calendar (cheapest per month)

```bash
tc "/v1/flights/calendar?to=MAD&from=EZE&currency=USD"
```

## Price history (90-day)

```bash
tc "/v1/routes/EZE/MAD/history?departDate=2026-09-15&returnDate=2026-09-22&currency=USD"
# include long-term stored series too:
tc "/v1/routes/EZE/MAD/history?departDate=2026-09-15&stored=true"
```

## Other markets / currencies

```bash
# Brazil market, in BRL
tc "/v1/deals?to=MIA&from=GRU&iso=BR&currency=BRL"
# Mexico market, in MXN
tc "/v1/deals?to=CUN&from=MEX&iso=MX&currency=MXN"
```

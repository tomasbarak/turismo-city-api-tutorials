// Tutorial 04 — Price-drop alert: check a route's current price vs a threshold,
// using 90-day history for context. Run it on a schedule (cron) and wire up a notifier.
//
// Run once:  RAPIDAPI_KEY=... RAPIDAPI_HOST=... node price-alert.mjs EZE MAD 2026-09-15 2026-09-22 1200
import { TurismocityClient } from "./client.mjs";

const api = new TurismocityClient();
const [, , FROM = "EZE", TO = "MAD", DEPART, RETURN, THRESHOLD = "1200"] = process.argv;
const depart = DEPART ?? new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const ret = RETURN ?? new Date(Date.now() + 37 * 864e5).toISOString().slice(0, 10);
const threshold = Number(THRESHOLD);

// Swap this for email/Slack/Telegram/push in production.
async function notify(message) {
  console.log(`🔔 ALERT: ${message}`);
}

async function checkOnce() {
  // 1) Current cheapest from a live search.
  let r = await api.search({ from: FROM, to: TO, departDate: depart, returnDate: ret, currency: "USD" });
  let tries = 0;
  while (r.status !== "complete" && tries++ < 3) {
    await new Promise((res) => setTimeout(res, 2500));
    r = await api.pollSearch(r.searchId, { currency: "USD" });
  }
  const price = r.cheapestPrice;

  // 2) 90-day average for context ("is this actually a good price?").
  const hist = await api.history(FROM, TO, { departDate: depart, returnDate: ret, currency: "USD" });
  const avg =
    hist.upstream90d.length > 0
      ? hist.upstream90d.reduce((s, p) => s + p.avgPrice, 0) / hist.upstream90d.length
      : null;

  const vsAvg = avg ? ` (90-day avg ~$${avg.toFixed(0)}, ${price < avg ? "below" : "above"} average)` : "";
  console.log(`${FROM}->${TO} ${depart}/${ret}: cheapest $${price}${vsAvg}`);

  const book = r.best.find((b) => b.kind === "bestPrice")?.bookingUrl;
  if (price != null && price <= threshold) {
    await notify(`${FROM}->${TO} dropped to $${price} (≤ $${threshold}). Book: ${book}`);
  }
  return price;
}

await checkOnce();

// To poll continuously instead of via system cron, uncomment:
// setInterval(() => checkOnce().catch(console.error), 6 * 60 * 60 * 1000); // every 6h

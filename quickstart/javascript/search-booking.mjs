// Tutorial 01 — Autocomplete -> search -> best fares with booking links.
// Run: RAPIDAPI_KEY=... RAPIDAPI_HOST=... node search-booking.mjs [FROM] [TO] [DEPART] [RETURN]
import { TurismocityClient } from "./client.mjs";

const api = new TurismocityClient();
const [, , FROM = "EZE", TO = "MAD", DEPART, RETURN] = process.argv;
const depart = DEPART ?? new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const ret = RETURN ?? new Date(Date.now() + 37 * 864e5).toISOString().slice(0, 10);

// Helpful: resolve a city name to an IATA code if the user passed text.
async function resolve(codeOrName) {
  if (/^[A-Za-z]{3}$/.test(codeOrName)) return codeOrName.toUpperCase();
  const { results } = await api.airports(codeOrName);
  if (!results.length) throw new Error(`No airport for "${codeOrName}"`);
  console.log(`Resolved "${codeOrName}" -> ${results[0].iata} (${results[0].name})`);
  return results[0].iata;
}

const from = await resolve(FROM);
const to = await resolve(TO);

console.log(`\nSearching ${from} -> ${to}  ${depart} / ${ret} ...`);
let result = await api.search({ from, to, departDate: depart, returnDate: ret, currency: "USD" });

// The first search may return "partial" while slow providers finish — poll briefly.
let tries = 0;
while (result.status !== "complete" && tries++ < 3) {
  await new Promise((r) => setTimeout(r, 2500));
  result = await api.pollSearch(result.searchId, { currency: "USD" });
}

console.log(`\nStatus: ${result.status} · ${result.totalItineraries} itineraries`);
console.log(`Cheapest: $${result.cheapestPrice} ${result.currency}`);

console.log("\nBest options:");
for (const b of result.best) {
  console.log(`  ${b.kind.padEnd(16)} $${b.price}  ->  ${b.bookingUrl}`);
}

console.log("\nCheapest by airline:");
for (const a of result.airlines.slice(0, 5)) {
  console.log(`  ${a.iata}  ${a.name.padEnd(24)} $${a.lowestPrice}`);
}

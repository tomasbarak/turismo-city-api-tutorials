// Quickstart: autocomplete -> deals -> search.
// Run:  RAPIDAPI_KEY=... RAPIDAPI_HOST=... node quickstart.mjs
import { TurismocityClient } from "./client.mjs";

const api = new TurismocityClient();

function dateInDays(n) {
  return new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
}

// 1) Look up an airport
const airports = await api.airports("madr", { iso: "AR" });
console.log("Airport:", airports.results[0]?.iata, airports.results[0]?.name);

// 2) Cheapest deals EZE -> MIA
const deals = await api.deals({ to: "MIA", from: "EZE", currency: "USD" });
console.log(`Cheapest EZE->MIA: $${deals.cheapest} (round-trip $${deals.byType.roundtrip})`);

// 3) Live search a round-trip ~30 days out
const search = await api.search({
  from: "EZE",
  to: "MAD",
  departDate: dateInDays(30),
  returnDate: dateInDays(37),
  currency: "USD",
});
console.log(`\nEZE->MAD: ${search.totalItineraries} itineraries, cheapest $${search.cheapestPrice}`);
console.log("Top airlines:", search.airlines.slice(0, 3).map((a) => `${a.name} $${a.lowestPrice}`).join(", "));
const best = search.best.find((b) => b.kind === "bestPrice");
if (best) console.log("Book the cheapest:", best.bookingUrl);

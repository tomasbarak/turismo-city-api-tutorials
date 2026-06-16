// Tutorial 03 — A cheap-flights board: cheapest deal from one origin to many destinations.
// Run: RAPIDAPI_KEY=... RAPIDAPI_HOST=... node deals-dashboard.mjs [ORIGIN] [DEST,DEST,...]
import { TurismocityClient } from "./client.mjs";

const api = new TurismocityClient();
const [, , ORIGIN = "EZE", DESTS = "MAD,MIA,GRU,SCL,PUJ,MEX"] = process.argv;
const destinations = DESTS.split(",");

// Fetch all destinations in parallel, then sort by price.
const rows = await Promise.all(
  destinations.map(async (to) => {
    try {
      const d = await api.deals({ from: ORIGIN, to, currency: "USD" });
      const top = d.deals?.[0];
      return {
        to,
        cheapest: d.cheapest,
        roundtrip: d.byType.roundtrip,
        when: top ? `${top.outbound} → ${top.inbound ?? "one-way"}` : "",
        airline: top?.airlineName ?? "",
      };
    } catch {
      return { to, cheapest: null };
    }
  }),
);

rows.sort((a, b) => (a.cheapest ?? 1e9) - (b.cheapest ?? 1e9));

console.log(`\n✈  Cheapest flights from ${ORIGIN} (USD)\n`);
console.log("DEST   CHEAPEST   ROUND-TRIP   DATES                    AIRLINE");
console.log("-".repeat(72));
for (const r of rows) {
  if (r.cheapest == null) {
    console.log(`${r.to.padEnd(6)} (no data)`);
    continue;
  }
  console.log(
    `${r.to.padEnd(6)} $${String(r.cheapest).padEnd(8)} $${String(r.roundtrip).padEnd(10)} ` +
      `${(r.when || "").padEnd(24)} ${r.airline}`,
  );
}

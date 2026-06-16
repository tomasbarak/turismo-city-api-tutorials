// Tutorial 02 — Find the cheapest month to fly a route (calendar feed).
// Run: RAPIDAPI_KEY=... RAPIDAPI_HOST=... node cheapest-month.mjs [FROM] [TO]
import { TurismocityClient } from "./client.mjs";

const api = new TurismocityClient();
const [, , FROM = "EZE", TO = "MAD"] = process.argv;
const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const cal = await api.calendar({ from: FROM, to: TO, currency: "USD" });
const months = [...cal.months].sort((a, b) => a.minPrice - b.minPrice);

console.log(`Cheapest months for ${FROM} -> ${TO} (USD):\n`);
months.forEach((m, i) => {
  const tag = i === 0 ? "  <-- cheapest" : "";
  console.log(`  ${MONTHS[m.month]} ${m.year}   $${m.minPrice}${tag}`);
});

const best = months[0];
console.log(
  `\nFly in ${MONTHS[best.month]} ${best.year} for ~$${best.minPrice}` +
    ` (vs $${months.at(-1).minPrice} in the priciest month).`,
);

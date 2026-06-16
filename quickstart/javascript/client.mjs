// Minimal reusable client for the Turismocity Flights API.
// Works against the RapidAPI gateway (set RAPIDAPI_KEY + RAPIDAPI_HOST)
// or a direct deployment (set BASE_URL).
//
//   import { TurismocityClient } from "./client.mjs";
//   const api = new TurismocityClient();
//   const deals = await api.deals({ to: "MIA", from: "EZE" });

export class TurismocityClient {
  constructor(opts = {}) {
    this.host = opts.host ?? process.env.RAPIDAPI_HOST ?? "turismocity-api.p.rapidapi.com";
    this.key = opts.key ?? process.env.RAPIDAPI_KEY ?? "";
    this.baseUrl = opts.baseUrl ?? process.env.BASE_URL ?? `https://${this.host}`;
  }

  #headers() {
    // When going through RapidAPI, send the gateway headers. A direct BASE_URL in
    // "open mode" needs none.
    return this.key ? { "X-RapidAPI-Key": this.key, "X-RapidAPI-Host": this.host } : {};
  }

  async #get(path, params = {}) {
    const url = new URL(this.baseUrl + path);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    const res = await fetch(url, { headers: this.#headers() });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API ${res.status} ${res.statusText} for ${path} :: ${body.slice(0, 200)}`);
    }
    return res.json();
  }

  airports(q, params = {}) {
    return this.#get("/v1/airports", { q, ...params });
  }

  search({ from, to, departDate, returnDate, ...rest } = {}) {
    return this.#get("/v1/flights/search", { from, to, departDate, returnDate, ...rest });
  }

  pollSearch(searchId, params = {}) {
    return this.#get(`/v1/flights/search/${encodeURIComponent(searchId)}`, params);
  }

  deals({ to, from, ...rest } = {}) {
    return this.#get("/v1/deals", { to, from, ...rest });
  }

  calendar({ to, from, ...rest } = {}) {
    return this.#get("/v1/flights/calendar", { to, from, ...rest });
  }

  history(from, to, { departDate, returnDate, ...rest } = {}) {
    return this.#get(
      `/v1/routes/${encodeURIComponent(from)}/${encodeURIComponent(to)}/history`,
      { departDate, returnDate, ...rest },
    );
  }
}

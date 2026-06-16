"""Minimal reusable client for the Turismocity Flights API.

Works against the RapidAPI gateway (RAPIDAPI_KEY + RAPIDAPI_HOST) or a direct
deployment (BASE_URL).

    from client import TurismocityClient
    api = TurismocityClient()
    deals = api.deals(to="MIA", **{"from": "EZE"})
"""
from __future__ import annotations

import os
from typing import Any
import requests


class TurismocityClient:
    def __init__(self, key: str | None = None, host: str | None = None, base_url: str | None = None):
        self.host = host or os.getenv("RAPIDAPI_HOST", "turismocity-api.p.rapidapi.com")
        self.key = key or os.getenv("RAPIDAPI_KEY", "")
        self.base_url = base_url or os.getenv("BASE_URL") or f"https://{self.host}"
        self.session = requests.Session()

    def _headers(self) -> dict[str, str]:
        # RapidAPI gateway needs these; a direct BASE_URL in open mode needs none.
        if self.key:
            return {"X-RapidAPI-Key": self.key, "X-RapidAPI-Host": self.host}
        return {}

    def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        clean = {k: v for k, v in (params or {}).items() if v is not None}
        res = self.session.get(self.base_url + path, params=clean, headers=self._headers(), timeout=40)
        if not res.ok:
            raise RuntimeError(f"API {res.status_code} for {path}: {res.text[:200]}")
        return res.json()

    def airports(self, q: str, **params: Any) -> Any:
        return self._get("/v1/airports", {"q": q, **params})

    def search(self, **params: Any) -> Any:
        return self._get("/v1/flights/search", params)

    def poll_search(self, search_id: str, **params: Any) -> Any:
        return self._get(f"/v1/flights/search/{search_id}", params)

    def deals(self, **params: Any) -> Any:
        return self._get("/v1/deals", params)

    def calendar(self, **params: Any) -> Any:
        return self._get("/v1/flights/calendar", params)

    def history(self, origin: str, destination: str, **params: Any) -> Any:
        return self._get(f"/v1/routes/{origin}/{destination}/history", params)

<?php
/**
 * Minimal reusable client for the Turismocity Flights API (cURL, no dependencies).
 *
 * Works against the RapidAPI gateway (RAPIDAPI_KEY + RAPIDAPI_HOST) or a direct
 * deployment (BASE_URL).
 *
 *   require 'client.php';
 *   $api = new TurismocityClient();
 *   $deals = $api->deals(['to' => 'MIA', 'from' => 'EZE']);
 */

class TurismocityClient
{
    private string $host;
    private string $key;
    private string $baseUrl;

    public function __construct(?string $key = null, ?string $host = null, ?string $baseUrl = null)
    {
        $this->host = $host ?: (getenv('RAPIDAPI_HOST') ?: 'turismocity-flights.p.rapidapi.com');
        $this->key = $key ?: (getenv('RAPIDAPI_KEY') ?: '');
        $this->baseUrl = $baseUrl ?: (getenv('BASE_URL') ?: "https://{$this->host}");
    }

    private function headers(): array
    {
        // RapidAPI gateway needs these; a direct BASE_URL in open mode needs none.
        if ($this->key !== '') {
            return ["X-RapidAPI-Key: {$this->key}", "X-RapidAPI-Host: {$this->host}"];
        }
        return [];
    }

    private function get(string $path, array $params = [])
    {
        $params = array_filter($params, fn($v) => $v !== null);
        $url = $this->baseUrl . $path . ($params ? '?' . http_build_query($params) : '');
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $this->headers(),
            CURLOPT_TIMEOUT => 40,
        ]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($status < 200 || $status >= 300) {
            throw new RuntimeException("API $status for $path: " . substr((string)$body, 0, 200));
        }
        return json_decode($body, true);
    }

    public function airports(string $q, array $params = [])
    {
        return $this->get('/v1/airports', array_merge(['q' => $q], $params));
    }

    public function search(array $params)
    {
        return $this->get('/v1/flights/search', $params);
    }

    public function pollSearch(string $searchId, array $params = [])
    {
        return $this->get('/v1/flights/search/' . rawurlencode($searchId), $params);
    }

    public function deals(array $params)
    {
        return $this->get('/v1/deals', $params);
    }

    public function calendar(array $params)
    {
        return $this->get('/v1/flights/calendar', $params);
    }

    public function history(string $from, string $to, array $params = [])
    {
        return $this->get("/v1/routes/{$from}/{$to}/history", $params);
    }
}

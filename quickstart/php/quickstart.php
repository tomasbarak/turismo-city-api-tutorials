<?php
// Quickstart: autocomplete -> deals -> search.
// Run:  RAPIDAPI_KEY=... RAPIDAPI_HOST=... php quickstart.php
require __DIR__ . '/client.php';

$api = new TurismocityClient();

$inDays = fn(int $n) => date('Y-m-d', time() + $n * 86400);

// 1) Look up an airport
$airports = $api->airports('madr', ['iso' => 'AR']);
$first = $airports['results'][0] ?? null;
if ($first) {
    echo "Airport: {$first['iata']} {$first['name']}\n";
}

// 2) Cheapest deals EZE -> MIA
$deals = $api->deals(['to' => 'MIA', 'from' => 'EZE', 'currency' => 'USD']);
echo "Cheapest EZE->MIA: \${$deals['cheapest']} (round-trip \${$deals['byType']['roundtrip']})\n";

// 3) Live search a round-trip ~30 days out
$search = $api->search([
    'from' => 'EZE',
    'to' => 'MAD',
    'departDate' => $inDays(30),
    'returnDate' => $inDays(37),
    'currency' => 'USD',
]);
echo "\nEZE->MAD: {$search['totalItineraries']} itineraries, cheapest \${$search['cheapestPrice']}\n";
$names = array_map(fn($a) => "{$a['name']} \${$a['lowestPrice']}", array_slice($search['airlines'], 0, 3));
echo 'Top airlines: ' . implode(', ', $names) . "\n";
foreach ($search['best'] as $b) {
    if ($b['kind'] === 'bestPrice') {
        echo "Book the cheapest: {$b['bookingUrl']}\n";
        break;
    }
}

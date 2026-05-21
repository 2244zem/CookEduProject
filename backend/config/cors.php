<?php

$origins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,https://cook-edu.fiksfaa.workers.dev'))
)));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_merge($origins, [
        'https://cook-edu.fiksfaa.workers.dev',
    ]),
    // Cloudflare Workers/Pages preview and production hosts
    'allowed_origins_patterns' => [
        '#^https://[a-z0-9-]+\.([a-z0-9-]+\.)?workers\.dev$#',
        '#^https://[a-z0-9-]+\.pages\.dev$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];

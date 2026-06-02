<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MidtransCoinController extends Controller
{
    private const COIN_PACKAGES = [
        'starter' => [
            'name' => 'CookEdu Coin Starter',
            'coins' => 100,
            'amount' => 10000,
        ],
        'plus' => [
            'name' => 'CookEdu Coin Plus',
            'coins' => 275,
            'amount' => 25000,
        ],
        'pro' => [
            'name' => 'CookEdu Coin Pro',
            'coins' => 600,
            'amount' => 50000,
        ],
    ];

    public function chargeQris(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'nullable|string|in:starter,plus,pro',
            'user_id' => 'nullable|string|max:80',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
        ]);

        $packageId = $validated['package_id'] ?? 'starter';
        $package = self::COIN_PACKAGES[$packageId];
        $orderId = $this->makeOrderId();
        $baseUrl = $this->midtransBaseUrl();
        $serverKey = (string) config('services.midtrans.server_key');

        if ($serverKey === '') {
            return response()->json([
                'status' => 'error',
                'message' => 'MIDTRANS_SERVER_KEY belum dikonfigurasi.',
            ], 500);
        }

        $payload = [
            'payment_type' => 'gopay',
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $package['amount'],
            ],
            'item_details' => [[
                'id' => $packageId,
                'price' => $package['amount'],
                'quantity' => 1,
                'name' => $package['name'],
            ]],
            'customer_details' => array_filter([
                'first_name' => $validated['customer_name'] ?? 'CookEdu User',
                'email' => $validated['customer_email'] ?? null,
            ]),
            'custom_field1' => $validated['user_id'] ?? null,
            'custom_field2' => $packageId,
            'custom_field3' => (string) $package['coins'],
            'gopay' => [
                'enable_callback' => false,
            ],
        ];

        if ($payload['custom_field1'] === null) {
            unset($payload['custom_field1']);
        }

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->acceptJson()
                ->asJson()
                ->timeout(20)
                ->post("{$baseUrl}/v2/charge", $payload)
                ->throw()
                ->json();
        } catch (RequestException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $exception->response?->json('status_message') ?? 'Gagal membuat QRIS Midtrans.',
            ], $exception->response?->status() ?: 502);
        }

        return response()->json([
            'status' => 'success',
            'order_id' => $orderId,
            'qris_image_url' => $this->extractQrisImageUrl($response, $baseUrl, $orderId),
        ]);
    }

    private function makeOrderId(): string
    {
        return 'COOKEDU-QRIS-' . now()->format('ymdHis') . random_int(100, 999);
    }

    private function midtransBaseUrl(): string
    {
        $isProduction = (bool) config('services.midtrans.is_production');

        return $isProduction
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

    private function extractQrisImageUrl(array $payload, string $baseUrl, string $orderId): string
    {
        foreach ($payload['actions'] ?? [] as $action) {
            $url = $action['url'] ?? '';
            if (is_string($url) && Str::contains($url, 'qr-code')) {
                return $url;
            }
        }

        return "{$baseUrl}/v2/gopay/{$orderId}/qr-code";
    }
}

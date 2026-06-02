<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'user_id' => 'required|string|max:80',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
        ]);

        $packageId = $validated['package_id'] ?? 'starter';
        $package = self::COIN_PACKAGES[$packageId];
        $orderId = $this->makeOrderId();
        $baseUrl = $this->midtransBaseUrl();
        $serverKey = (string) config('services.midtrans.server_key');

        if ($serverKey === '') {
            if (! $this->isProductionMode()) {
                $this->recordPendingPurchase($orderId, $validated['user_id'], $package);

                return response()->json([
                    'status' => 'success',
                    'order_id' => $orderId,
                    'qris_image_url' => $this->sandboxQrPlaceholderUrl($orderId, $package),
                ]);
            }

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
            if (! $this->isProductionMode()) {
                $this->recordPendingPurchase($orderId, $validated['user_id'], $package);

                return response()->json([
                    'status' => 'success',
                    'order_id' => $orderId,
                    'qris_image_url' => $this->sandboxQrPlaceholderUrl($orderId, $package),
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => $exception->response?->json('status_message') ?? 'Gagal membuat QRIS Midtrans.',
            ], $exception->response?->status() ?: 502);
        }

        $this->recordPendingPurchase($orderId, $validated['user_id'], $package);

        return response()->json([
            'status' => 'success',
            'order_id' => $orderId,
            'qris_image_url' => $this->extractQrisImageUrl($response, $baseUrl, $orderId),
        ]);
    }

    public function bypassSuccess(Request $request)
    {
        if ($this->isProductionMode()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sandbox bypass dinonaktifkan pada mode production.',
            ], 403);
        }

        $validated = $request->validate([
            'order_id' => 'required|string|max:120',
        ]);

        return DB::transaction(function () use ($validated) {
            $purchase = DB::table('public.coin_purchases')
                ->where('order_id', $validated['order_id'])
                ->lockForUpdate()
                ->first();

            if (! $purchase) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Order koin tidak ditemukan.',
                ], 404);
            }

            if ($purchase->status !== 'pending') {
                return response()->json([
                    'status' => 'success',
                    'order_id' => $purchase->order_id,
                    'purchase_status' => $purchase->status,
                    'coins_added' => 0,
                    'coin_balance' => $this->walletBalance($purchase->user_id),
                ]);
            }

            DB::table('public.coin_purchases')
                ->where('order_id', $purchase->order_id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'settlement',
                    'updated_at' => now(),
                ]);

            $coinAmount = (int) $purchase->coin_amount;

            DB::statement(
                'insert into public.user_wallets (user_id, coin_balance)
                 values (?, ?)
                 on conflict (user_id) do update
                 set coin_balance = coalesce(public.user_wallets.coin_balance, 0) + excluded.coin_balance',
                [$purchase->user_id, $coinAmount]
            );

            return response()->json([
                'status' => 'success',
                'order_id' => $purchase->order_id,
                'purchase_status' => 'settlement',
                'coins_added' => $coinAmount,
                'coin_balance' => $this->walletBalance($purchase->user_id),
            ]);
        });
    }

    private function makeOrderId(): string
    {
        return 'COOKEDU-QRIS-' . now()->format('ymdHis') . random_int(100, 999);
    }

    private function midtransBaseUrl(): string
    {
        return $this->isProductionMode()
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

    private function isProductionMode(): bool
    {
        return filter_var(config('services.midtrans.is_production'), FILTER_VALIDATE_BOOL);
    }

    private function recordPendingPurchase(string $orderId, string $userId, array $package): void
    {
        DB::table('public.coin_purchases')->insert([
            'order_id' => $orderId,
            'user_id' => $userId,
            'coin_amount' => $package['coins'],
            'gross_amount' => $package['amount'],
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function walletBalance(string $userId): int
    {
        return (int) (DB::table('public.user_wallets')
            ->where('user_id', $userId)
            ->value('coin_balance') ?? 0);
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

    private function sandboxQrPlaceholderUrl(string $orderId, array $package): string
    {
        $amount = number_format($package['amount'], 0, ',', '.');
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="28" fill="#f8fafc"/>
  <rect x="34" y="34" width="188" height="188" rx="18" fill="#ffffff" stroke="#0891b2" stroke-width="4"/>
  <rect x="54" y="54" width="46" height="46" rx="8" fill="#0f172a"/>
  <rect x="156" y="54" width="46" height="46" rx="8" fill="#0f172a"/>
  <rect x="54" y="156" width="46" height="46" rx="8" fill="#0f172a"/>
  <rect x="116" y="74" width="14" height="14" fill="#0891b2"/>
  <rect x="132" y="90" width="14" height="14" fill="#0f172a"/>
  <rect x="116" y="122" width="14" height="14" fill="#0f172a"/>
  <rect x="148" y="122" width="14" height="14" fill="#0891b2"/>
  <rect x="132" y="148" width="14" height="14" fill="#0f172a"/>
  <rect x="164" y="164" width="14" height="14" fill="#0891b2"/>
  <rect x="180" y="148" width="14" height="14" fill="#0f172a"/>
  <text x="128" y="232" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#0f172a">Sandbox QRIS Rp{$amount}</text>
</svg>
SVG;

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }
}

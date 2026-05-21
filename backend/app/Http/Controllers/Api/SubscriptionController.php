<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function plans()
    {
        return response()->json(Plan::all());
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = $request->user();
        $plan = Plan::find($request->plan_id);

        // Here we'd integrate Midtrans API to create a payment link or snap token
        // For now, we mock the success creation
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDays($plan->duration_in_days),
            'midtrans_subscription_id' => 'mock_midtrans_' . \Illuminate\Support\Str::random(10)
        ]);

        return response()->json([
            'message' => 'Subscribed successfully (Mock Midtrans Integration)',
            'subscription' => $subscription
        ], 201);
    }

    public function charge(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'payment_method_token' => 'required|string',
        ]);

        $user = $request->user();
        $plan = Plan::findOrFail($request->plan_id);
        
        // E.g., Server-to-server call to Midtrans Core API to charge the token
        // $midtransCharge = Midtrans::charge([...]);
        
        $transactionId = 'tx_' . \Illuminate\Support\Str::uuid();
        
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'pending', // Webhook will change this to settlement
            'starts_at' => now(),
            'ends_at' => now()->addDays($plan->duration_in_days),
            'midtrans_subscription_id' => $transactionId
        ]);

        return response()->json([
            'message' => 'Charge initiated',
            'subscription' => $subscription
        ], 200);
    }

    public function webhook(Request $request)
    {
        // Basic Midtrans signature validation structure
        $orderId = $request->input('order_id');
        $statusCode = $request->input('status_code');
        $grossAmount = $request->input('gross_amount');
        $serverKey = env('MIDTRANS_SERVER_KEY');
        
        $signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        
        if ($signatureKey !== $request->input('signature_key') && !app()->isLocal()) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transactionStatus = $request->input('transaction_status');
        $subscription = Subscription::where('midtrans_subscription_id', $orderId)->first();

        if (!$subscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        if ($transactionStatus == 'settlement' || $transactionStatus == 'capture') {
            $subscription->update(['status' => 'settlement']);
            $subscription->user->update(['role' => 'premium']);
        } elseif ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            $subscription->update(['status' => $transactionStatus]);
            if ($subscription->user->role !== 'admin') {
                $subscription->user->update(['role' => 'user']);
            }
        }

        return response()->json(['message' => 'Webhook received']);
    }

    public function cancel(Request $request)
    {
        $subscription = $request->user()->subscriptions()->where('status', 'active')->first();
        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        $subscription->update(['status' => 'canceled']);
        return response()->json(['message' => 'Subscription canceled successfully']);
    }
}

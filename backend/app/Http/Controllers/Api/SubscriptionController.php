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

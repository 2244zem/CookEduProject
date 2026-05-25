<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function redirect($provider)
    {
        return redirect()->away(Socialite::driver($provider)->stateless()->redirect()->getTargetUrl());
    }

    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            
            $user = User::updateOrCreate([
                'email' => $socialUser->getEmail(),
            ], [
                'name' => $socialUser->getName(),
                'avatar' => $socialUser->getAvatar(),
                'password' => bcrypt(\Illuminate\Support\Str::random(16)), // Fallback password
                'email_verified_at' => now(), // Auto verify social accounts
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'OAuth failed', 'error' => $e->getMessage()], 401);
        }
    }
}

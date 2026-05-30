<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Storage;


use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\PasswordOtp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ], [
            'name.required' => 'Bidang Nama Lengkap wajib diisi.',
            'email.required' => 'Bidang Email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'] ?? null,
            'role' => 'user',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil!',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and create token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function profile(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Update profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'preferences' => 'nullable|array',
            'preferences.diet' => 'nullable|string',
            'preferences.skill_level' => 'nullable|in:beginner,intermediate,advanced',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $this->storeAvatar($request, $user);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Upload avatar using the shared web/native endpoint.
     */
    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user->update([
            'avatar' => $this->storeAvatar($request, $user),
        ]);

        return response()->json([
            'message' => 'Foto profil berhasil diperbarui.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    private function storeAvatar(Request $request, User $user): string
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        return $request->file('avatar')->store('avatars', 'public');
    }

    /**
     * Send OTP to email for password reset.
     */
    public function sendOTP(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $otp = rand(100000, 999999);
        
        PasswordOtp::updateOrCreate(
            ['email' => $request->email],
            [
                'otp' => $otp,
                'expires_at' => Carbon::now()->addMinutes(10)
            ]
        );

        // Simulation of sending email
        Log::info("OTP for {$request->email}: {$otp}");

        return response()->json([
            'message' => 'Kode OTP telah dikirim ke email Anda (Cek log server untuk demo).',
            'demo_otp' => $otp // For testing purposes in this environment
        ]);
    }

    /**
     * Verify OTP and change password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $otpRecord = PasswordOtp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otpRecord) {
            return response()->json(['message' => 'Kode OTP tidak valid atau sudah kedaluwarsa.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => $request->password]);

        $otpRecord->delete();

        return response()->json(['message' => 'Kata sandi berhasil diubah.']);
    }

    /**
     * Add XP to user.
     */
    public function addXp(Request $request)
    {
        $request->validate(['amount' => 'required|integer|min:1']);
        
        $user = $request->user();
        $user->increment('xp', $request->amount);

        return response()->json([
            'message' => 'XP berhasil ditambahkan!',
            'xp' => $user->xp,
            'user' => new UserResource($user->fresh())
        ]);
    }

    /**
     * Logout (revoke current token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Override a user's role (Super Admin only).
     */
    public function roleOverride(Request $request, string $id)
    {
        $request->validate([
            'role' => 'required|in:user,premium,admin'
        ]);

        $user = User::findOrFail($id);
        
        $user->update([
            'role' => $request->role
        ]);

        return response()->json([
            'message' => 'Role updated successfully',
            'user' => $user
        ]);
    }
}

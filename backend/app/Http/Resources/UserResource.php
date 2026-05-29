<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'avatar' => $this->avatar ? (
                (str_contains(config('app.url'), 'localhost') || str_contains(config('app.url'), '127.0.0.1'))
                    ? $request->getSchemeAndHttpHost() . '/storage/' . $this->avatar
                    : asset('storage/' . $this->avatar)
            ) : null,
            'avatar_url' => $this->avatar ? (
                (str_contains(config('app.url'), 'localhost') || str_contains(config('app.url'), '127.0.0.1'))
                    ? $request->getSchemeAndHttpHost() . '/storage/' . $this->avatar
                    : asset('storage/' . $this->avatar)
            ) : null,
            'xp' => $this->xp,
            'preferences' => $this->preferences,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

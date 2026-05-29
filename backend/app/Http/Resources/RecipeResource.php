<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'ingredients' => $this->ingredients,
            'steps' => $this->steps,
            'image_url' => $this->image_url ? (
                str_starts_with($this->image_url, 'http')
                    ? $this->image_url
                    : (
                        (str_contains(config('app.url'), 'localhost') || str_contains(config('app.url'), '127.0.0.1'))
                            ? $request->getSchemeAndHttpHost() . '/storage/' . $this->image_url
                            : asset('storage/' . $this->image_url)
                    )
            ) : null,
            'difficulty' => $this->difficulty,
            'cooking_time' => $this->cooking_time,
            'nutritional_info' => $this->nutritional_info,
            'is_published' => (bool) $this->is_published,
            'moderation_status' => $this->moderation_status ?? 'approved',
            'is_system' => $this->creator ? $this->creator->role === 'admin' : true,
            'creator' => [
                'id' => $this->creator?->id,
                'name' => $this->creator?->name ?? 'System',
                'role' => $this->creator?->role ?? 'Admin',
            ],
            'category' => new CategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

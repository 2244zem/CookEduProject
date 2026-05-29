<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'order_index' => $this->order_index,
            'recipes_count' => $this->whenCounted('recipes'),
            'lessons_count' => $this->whenCounted('lessons'),
        ];
    }
}

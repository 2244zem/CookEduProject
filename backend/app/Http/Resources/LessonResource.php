<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = $request->user()?->id;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'video_url' => $this->video_url,
            'content' => $this->content,
            'summary' => $this->summary,
            'thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
            'duration' => $this->duration,
            'order_index' => $this->order_index,
            'level' => $this->level,
            'level_label' => ucfirst($this->level),
            'is_published' => $this->is_published,
            'fallback_content' => $this->fallback_content,
            'prerequisite_id' => $this->prerequisite_id,
            'is_accessible' => $userId ? $this->isAccessibleByUser($userId) : true,
            'is_completed' => $userId ? $this->isCompletedByUser($userId) : false,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'prerequisite' => new LessonResource($this->whenLoaded('prerequisite')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

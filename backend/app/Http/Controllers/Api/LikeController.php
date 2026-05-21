<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\Recipe;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, Recipe $recipe)
    {
        $like = Like::where('user_id', $request->user()->id)
                    ->where('recipe_id', $recipe->id)
                    ->first();

        if ($like) {
            $like->delete();
            return response()->json(['message' => 'Unliked', 'liked' => false]);
        }

        Like::create([
            'user_id' => $request->user()->id,
            'recipe_id' => $recipe->id
        ]);

        return response()->json(['message' => 'Liked', 'liked' => true]);
    }
}

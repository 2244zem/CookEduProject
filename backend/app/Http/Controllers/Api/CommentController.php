<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Recipe;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Recipe $recipe)
    {
        $comments = $recipe->comments()->with('user:id,name,avatar')->latest()->get();
        return response()->json($comments);
    }

    public function store(Request $request, Recipe $recipe)
    {
        $request->validate([
            'content' => 'required|string|max:1000'
        ]);

        $comment = $recipe->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $request->content
        ]);

        return response()->json($comment->load('user:id,name,avatar'), 201);
    }

    public function destroy(Comment $comment, Request $request)
    {
        if ($request->user()->id !== $comment->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}

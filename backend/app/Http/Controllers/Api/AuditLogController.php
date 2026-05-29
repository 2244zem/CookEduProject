<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * List audit logs with filters.
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filter by action
        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        // Filter by model type
        if ($modelType = $request->query('model_type')) {
            $query->where('model_type', 'LIKE', "%{$modelType}%");
        }

        // Filter by user
        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        // Filter by date range
        if ($from = $request->query('from')) {
            $query->where('created_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->where('created_at', '<=', $to);
        }

        $logs = $query->paginate($request->query('per_page', 20));

        return response()->json($logs);
    }
}

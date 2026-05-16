<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Trait Auditable
 *
 * Automatically logs create, update, delete, and restore events
 * for any model that uses this trait.
 */
trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function ($model) {
            $model->logAudit('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $dirty = $model->getDirty();
            $original = array_intersect_key($model->getOriginal(), $dirty);
            $model->logAudit('updated', $original, $dirty);
        });

        static::deleted(function ($model) {
            $action = $model->isForceDeleting() ? 'force_deleted' : 'deleted';
            $model->logAudit($action, $model->getAttributes(), null);
        });

        if (method_exists(static::class, 'restored')) {
            static::restored(function ($model) {
                $model->logAudit('restored', null, $model->getAttributes());
            });
        }
    }

    /**
     * Write an audit log entry.
     */
    protected function logAudit(string $action, ?array $oldValues, ?array $newValues): void
    {
        // Don't log during seeding or testing unless explicitly enabled
        if (app()->runningInConsole() && !config('audit.log_in_console', false)) {
            return;
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}

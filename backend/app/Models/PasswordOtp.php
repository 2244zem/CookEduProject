<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PasswordOtp extends Model
{
    use HasUuids;
    protected $fillable = ['email', 'otp', 'expires_at'];
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DetectPlatform
{
    /**
     * Allowed platform values.
     */
    private const ALLOWED_PLATFORMS = ['android', 'desktop', 'tablet'];

    /**
     * Default platform when detection fails.
     */
    private const DEFAULT_PLATFORM = 'android';

    /**
     * Handle an incoming request.
     * Detects the client platform from X-Platform header or User-Agent.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Priority 1: Explicit X-Platform header
        $platform = $request->header('X-Platform');
        
        // Priority 2: Fallback to User-Agent detection
        if (!$platform) {
            $platform = $this->detectFromUserAgent($request->userAgent());
        }
        
        // Validate platform against allowed list
        if (!in_array($platform, self::ALLOWED_PLATFORMS, true)) {
            $platform = self::DEFAULT_PLATFORM;
        }
        
        // Attach platform to request attributes for downstream use
        $request->attributes->set('platform', $platform);
        
        return $next($request);
    }
    
    /**
     * Detect platform from User-Agent string.
     * 
     * @param  string|null  $userAgent
     * @return string
     */
    private function detectFromUserAgent(?string $userAgent): string
    {
        if (!$userAgent) {
            return 'desktop'; // Web default when no User-Agent
        }
        
        $ua = strtolower($userAgent);
        
        // Android mobile detection
        if (str_contains($ua, 'android') && str_contains($ua, 'mobile')) {
            return 'android';
        }
        
        // Tablet detection (iPad or Android tablet)
        if (str_contains($ua, 'ipad') || 
            (str_contains($ua, 'android') && str_contains($ua, 'tablet'))) {
            return 'tablet';
        }
        
        // Desktop default for all other cases
        return 'desktop';
    }
}

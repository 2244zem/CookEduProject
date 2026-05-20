<?php

namespace Tests\Unit;

use App\Http\Middleware\DetectPlatform;
use Illuminate\Http\Request;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

class DetectPlatformMiddlewareTest extends TestCase
{
    private DetectPlatform $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new DetectPlatform();
    }

    /**
     * Test that X-Platform header is used when present.
     */
    public function test_detects_platform_from_header(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('X-Platform', 'desktop');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('desktop', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that android platform is detected from header.
     */
    public function test_detects_android_from_header(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('X-Platform', 'android');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('android', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that tablet platform is detected from header.
     */
    public function test_detects_tablet_from_header(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('X-Platform', 'tablet');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('tablet', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that invalid platform header defaults to android.
     */
    public function test_invalid_platform_header_defaults_to_android(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('X-Platform', 'invalid-platform');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('android', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that Android mobile User-Agent is detected.
     */
    public function test_detects_android_from_user_agent(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('User-Agent', 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('android', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that iPad User-Agent is detected as tablet.
     */
    public function test_detects_ipad_as_tablet(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('tablet', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that Android tablet User-Agent is detected as tablet.
     */
    public function test_detects_android_tablet(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('User-Agent', 'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36 Tablet');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('tablet', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that desktop User-Agent is detected.
     */
    public function test_detects_desktop_from_user_agent(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('desktop', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that Windows desktop User-Agent is detected.
     */
    public function test_detects_windows_desktop(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('desktop', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that missing User-Agent defaults to desktop.
     */
    public function test_missing_user_agent_defaults_to_desktop(): void
    {
        $request = Request::create('/api/recipes', 'GET');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('desktop', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that X-Platform header takes priority over User-Agent.
     */
    public function test_header_takes_priority_over_user_agent(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('X-Platform', 'desktop');
        $request->headers->set('User-Agent', 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 Mobile Safari/537.36');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('desktop', $req->attributes->get('platform'));
            return new Response();
        });
    }

    /**
     * Test that platform is attached to request attributes.
     */
    public function test_platform_is_attached_to_request_attributes(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('X-Platform', 'android');

        $this->middleware->handle($request, function ($req) {
            $this->assertTrue($req->attributes->has('platform'));
            return new Response();
        });
    }

    /**
     * Test that middleware passes request to next handler.
     */
    public function test_middleware_passes_request_to_next(): void
    {
        $request = Request::create('/api/recipes', 'GET');
        $request->headers->set('X-Platform', 'desktop');

        $response = $this->middleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('Success', $response->getContent());
    }
}

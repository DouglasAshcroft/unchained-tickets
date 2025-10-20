/**
 * Persistent rate limiter using Upstash Redis.
 * Falls back to in-memory limiter if Redis is not configured.
 *
 * Setup:
 * 1. Install dependencies: npm install @upstash/ratelimit @upstash/redis
 * 2. Set environment variables:
 *    - UPSTASH_REDIS_REST_URL
 *    - UPSTASH_REDIS_REST_TOKEN
 */

import type { RateLimitConfig, RateLimitResult } from './rateLimit';
import { checkRateLimit as checkRateLimitMemory } from './rateLimit';

let rateLimiter: any = null;
let useUpstash = false;

/**
 * Initialize Upstash rate limiter (lazy initialization)
 */
function initializeRateLimiter() {
  if (rateLimiter !== null) {
    return;
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    console.warn(
      '⚠️  Upstash Redis not configured. Using in-memory rate limiting.\n' +
      '   For production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
    );
    useUpstash = false;
    rateLimiter = false; // Mark as initialized but not using Upstash
    return;
  }

  try {
    // Dynamically import Upstash packages
    const { Redis } = require('@upstash/redis');
    const { Ratelimit } = require('@upstash/ratelimit');

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Create different rate limiters for different use cases
    rateLimiter = {
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
        prefix: '@ratelimit/auth',
      }),
      api: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '15 m'),
        analytics: true,
        prefix: '@ratelimit/api',
      }),
      strict: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: '@ratelimit/strict',
      }),
    };

    useUpstash = true;
    console.log('✅ Upstash Redis rate limiting initialized');
  } catch (error) {
    console.warn(
      '⚠️  Failed to initialize Upstash. Using in-memory rate limiting.\n' +
      '   Error:', error instanceof Error ? error.message : 'Unknown error'
    );
    useUpstash = false;
    rateLimiter = false;
  }
}

/**
 * Check rate limit using Upstash Redis (or fallback to in-memory)
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Initialize on first use
  if (rateLimiter === null) {
    initializeRateLimiter();
  }

  // If Upstash is not available, use in-memory
  if (!useUpstash || !rateLimiter) {
    return checkRateLimitMemory(identifier, config);
  }

  try {
    // Map config to appropriate limiter
    let limiter: any;
    const windowSeconds = Math.floor(config.windowMs / 1000);

    // Use predefined limiters or create custom one
    if (config.max === 5 && windowSeconds === 900) {
      limiter = rateLimiter.auth;
    } else if (config.max === 100 && windowSeconds === 900) {
      limiter = rateLimiter.api;
    } else if (config.max === 10 && windowSeconds === 60) {
      limiter = rateLimiter.strict;
    } else {
      // For custom configs, create a new limiter
      const { Redis } = require('@upstash/redis');
      const { Ratelimit } = require('@upstash/ratelimit');

      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.max, `${windowSeconds} s`),
        analytics: true,
        prefix: '@ratelimit/custom',
      });
    }

    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetTime: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed, falling back to in-memory:', error);
    return checkRateLimitMemory(identifier, config);
  }
}

/**
 * Get client identifier from request (IP address or fallback)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (works with most proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a combination of user-agent and accept-language
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLang = request.headers.get('accept-language') || 'unknown';
  return `${userAgent}-${acceptLang}`.slice(0, 100);
}

/**
 * Standard rate limit configurations
 */
export const RateLimits = {
  /** Authentication endpoints: 5 attempts per 15 minutes */
  AUTH: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
  },
  /** General API: 100 requests per 15 minutes */
  API: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  /** Strict rate limit: 10 requests per minute */
  STRICT: {
    windowMs: 60 * 1000,
    max: 10,
  },
} as const;

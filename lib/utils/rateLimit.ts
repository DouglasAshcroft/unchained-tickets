/**
 * Simple in-memory rate limiter for API routes.
 * For production, consider using Redis-based solutions like @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests per window */
  max: number;
  /** Skip counting successful requests (useful for auth) */
  skipSuccessfulRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier Unique identifier (e.g., IP address or user ID)
 * @param config Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  // No existing entry or expired - create new
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      resetTime,
    };
  }

  // Within window - check limit
  if (entry.count >= config.max) {
    return {
      success: false,
      limit: config.max,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    limit: config.max,
    remaining: config.max - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Mark a request as successful (used with skipSuccessfulRequests)
 */
export function decrementRateLimit(identifier: string): void {
  const entry = rateLimitStore.get(identifier);
  if (entry && entry.count > 0) {
    entry.count--;
  }
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
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
  // Not perfect but better than nothing for local development
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

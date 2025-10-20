import { NextResponse } from 'next/server';

/**
 * Standard API error codes
 */
export enum ApiErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * API Error class with structured error information
 */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

/**
 * Standardized error response handler for API routes
 *
 * Usage in API routes:
 * ```ts
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleApiError(error, 'Operation name');
 * }
 * ```
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  // Log error for debugging/monitoring
  const logContext = context ? `[${context}]` : '[API Error]';

  if (error instanceof ApiError) {
    console.error(`${logContext} ${error.code}:`, error.message, error.details);
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // Handle known error types
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('not found') || error.message.includes('Not found')) {
      console.error(`${logContext} Not Found:`, error.message);
      return NextResponse.json(
        {
          error: {
            code: ApiErrorCode.NOT_FOUND,
            message: error.message,
          },
        },
        { status: 404 }
      );
    }

    if (
      error.message.includes('Unauthorized') ||
      error.message.includes('No token') ||
      error.message.includes('Invalid token')
    ) {
      console.error(`${logContext} Unauthorized:`, error.message);
      return NextResponse.json(
        {
          error: {
            code: ApiErrorCode.UNAUTHORIZED,
            message: error.message,
          },
        },
        { status: 401 }
      );
    }

    if (
      error.message.includes('Admin access required') ||
      error.message.includes('Forbidden')
    ) {
      console.error(`${logContext} Forbidden:`, error.message);
      return NextResponse.json(
        {
          error: {
            code: ApiErrorCode.FORBIDDEN,
            message: error.message,
          },
        },
        { status: 403 }
      );
    }

    // Generic error
    console.error(`${logContext} Error:`, error);
    return NextResponse.json(
      {
        error: {
          code: ApiErrorCode.INTERNAL_ERROR,
          message: process.env.NODE_ENV === 'production'
            ? 'An internal error occurred'
            : error.message,
        },
      },
      { status: 500 }
    );
  }

  // Unknown error type
  console.error(`${logContext} Unknown error:`, error);
  return NextResponse.json(
    {
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

/**
 * Helper functions for common API errors
 */
export const ApiErrors = {
  badRequest: (message: string, details?: Record<string, any>) =>
    new ApiError(ApiErrorCode.BAD_REQUEST, message, 400, details),

  unauthorized: (message: string = 'Unauthorized') =>
    new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message: string = 'Forbidden') =>
    new ApiError(ApiErrorCode.FORBIDDEN, message, 403),

  notFound: (resource: string = 'Resource') =>
    new ApiError(ApiErrorCode.NOT_FOUND, `${resource} not found`, 404),

  conflict: (message: string, details?: Record<string, any>) =>
    new ApiError(ApiErrorCode.CONFLICT, message, 409, details),

  validationError: (message: string, details?: Record<string, any>) =>
    new ApiError(ApiErrorCode.VALIDATION_ERROR, message, 422, details),

  rateLimitExceeded: (message: string = 'Rate limit exceeded') =>
    new ApiError(ApiErrorCode.RATE_LIMIT_EXCEEDED, message, 429),

  internal: (message: string = 'Internal server error') =>
    new ApiError(ApiErrorCode.INTERNAL_ERROR, message, 500),

  serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
    new ApiError(ApiErrorCode.SERVICE_UNAVAILABLE, message, 503),
};

/**
 * Logger utility for API routes with structured logging
 */
export const apiLogger = {
  info: (context: string, message: string, data?: Record<string, any>) => {
    console.log(`[${context}] ${message}`, data ? JSON.stringify(data) : '');
  },

  warn: (context: string, message: string, data?: Record<string, any>) => {
    console.warn(`[${context}] ${message}`, data ? JSON.stringify(data) : '');
  },

  error: (context: string, message: string, error?: Error | unknown) => {
    console.error(`[${context}] ${message}`, error);
  },

  // For critical flows like payments, minting, etc.
  critical: (context: string, message: string, data?: Record<string, any>) => {
    console.error(`[CRITICAL][${context}] ${message}`, data ? JSON.stringify(data) : '');
    // TODO: Send to error tracking service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureMessage(message, { level: 'error', extra: data });
    // }
  },
};

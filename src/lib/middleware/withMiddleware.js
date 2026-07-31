/**
 * API Middleware Wrapper
 * Chains correlation ID tracing, global error handling, schema validations, rate limiting, and auth checks.
 */
import { cookies } from 'next/headers';
import { logger } from '../logger';
import { createErrorResponse, ERROR_CODES } from '../errors';
import { getAuthenticatedUser } from '../auth';
import { CONSTANTS } from '../constants';

// In-memory rate limiting store
const rateLimitStore = new Map();

/**
 * Clean up rate limiter memory leaks periodically (every 10 minutes)
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 600000);

export function withMiddleware(handler, options = {}) {
  return async (req, paramsContext = {}) => {
    // 1. Request Tracing (Observability)
    const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();

    try {
      // Log incoming request
      const url = new URL(req.url);
      logger.info('API_REQUEST_IN', `${req.method} ${url.pathname}`, { method: req.method, path: url.pathname }, traceId);

      // 2. Rate Limiter (SaaS Security)
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
      const now = Date.now();
      const windowMs = 60000; // 1 minute window
      const maxHits = 100; // 100 requests per minute

      let rateData = rateLimitStore.get(clientIp);
      if (!rateData || now > rateData.resetTime) {
        rateData = { hits: 0, resetTime: now + windowMs };
      }
      
      rateData.hits++;
      rateLimitStore.set(clientIp, rateData);

      if (rateData.hits > maxHits) {
        logger.warn('RATE_LIMIT_TRIGGERED', `Rate limit exceeded for IP: ${clientIp}`, { hits: rateData.hits }, traceId);
        return createErrorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests. Please try again in a minute.', 429);
      }

      const reqCtx = { traceId, user: null };

      // 3. Authentication check
      if (options.requireAuth) {
        const cookieStore = await cookies();
        const token = cookieStore.get(CONSTANTS.JWT_COOKIE_NAME)?.value;

        if (!token) {
          logger.warn('AUTH_FAILED', 'Missing authentication token', {}, traceId);
          return createErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Authentication is required.', 401);
        }

        const user = await getAuthenticatedUser();
        if (!user) {
          logger.warn('AUTH_FAILED', 'Invalid/expired or missing user session', {}, traceId);
          return createErrorResponse(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired session. Please log in again.', 401);
        }

        // Attach verified user information to context
        reqCtx.user = user;
      }

      // 4. Request validation (Zod schema checking)
      if (options.schema) {
        const { body: bodySchema, query: querySchema, params: paramsSchema } = options.schema;

        // Validate Route parameters (paramsContext.params)
        if (paramsSchema && paramsContext.params) {
          const resolvedParams = await paramsContext.params;
          const paramsResult = paramsSchema.safeParse(resolvedParams);
          if (!paramsResult.success) {
            logger.warn('VALIDATION_FAILED', 'Route parameters validation failed', paramsResult.error.format(), traceId);
            return createErrorResponse(
              ERROR_CODES.VALIDATION_ERROR, 
              paramsResult.error.errors[0]?.message || 'Invalid route parameters.', 
              400
            );
          }
          reqCtx.params = paramsResult.data;
        }

        // Validate Search query parameters
        if (querySchema) {
          const queryParams = Object.fromEntries(url.searchParams.entries());
          const queryResult = querySchema.safeParse(queryParams);
          if (!queryResult.success) {
            logger.warn('VALIDATION_FAILED', 'Query parameters validation failed', queryResult.error.format(), traceId);
            return createErrorResponse(
              ERROR_CODES.VALIDATION_ERROR, 
              queryResult.error.errors[0]?.message || 'Invalid query parameters.', 
              400
            );
          }
          reqCtx.query = queryResult.data;
        }

        // Validate JSON Request body
        if (bodySchema && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
          let bodyPayload;
          try {
            // Clone request to allow multiple reads if needed
            bodyPayload = await req.clone().json();
          } catch (_) {
            return createErrorResponse(ERROR_CODES.VALIDATION_ERROR, 'Malformed or empty JSON request body.', 400);
          }

          const bodyResult = bodySchema.safeParse(bodyPayload);
          if (!bodyResult.success) {
            logger.warn('VALIDATION_FAILED', 'Body payload validation failed', bodyResult.error.format(), traceId);
            return createErrorResponse(
              ERROR_CODES.VALIDATION_ERROR, 
              bodyResult.error.errors[0]?.message || 'Invalid request body.', 
              400
            );
          }
          reqCtx.body = bodyResult.data;
        }
      }

      // 5. Execute API Handler
      const response = await handler(req, reqCtx);
      
      // Inject traceId headers in response
      response.headers.set('x-trace-id', traceId);
      
      logger.info('API_RESPONSE_OUT', `Request completed with status ${response.status}`, { status: response.status }, traceId);
      return response;

    } catch (error) {
      // 6. Global exception catching (Production error boundary)
      logger.error('API_UNCAUGHT_EXCEPTION', 'An unhandled exception occurred in API handler', error, {}, traceId);
      
      const response = createErrorResponse(
        ERROR_CODES.INTERNAL_ERROR, 
        'An unexpected server error occurred. Please contact support.', 
        500
      );
      response.headers.set('x-trace-id', traceId);
      return response;
    }
  };
}

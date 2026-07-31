/**
 * Centralized API Error Handling Utilities
 */

/**
 * Standard Error Codes
 */
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

/**
 * Helper to build standard structured JSON error responses
 * @param {string} code - The predefined error code from ERROR_CODES
 * @param {string} message - A user-friendly error message description
 * @param {number} status - The HTTP status code (default 400)
 */
export function createErrorResponse(code, message, status = 400) {
  return Response.json({
    success: false,
    error: {
      code,
      message,
    },
  }, { status });
}

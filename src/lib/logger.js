/**
 * Structured Logging Service with PII filtering and Request Tracing support
 */

/**
 * Filter out sensitive fields like passwords, secrets, and JWT payloads
 */
function sanitize(obj) {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;

  const sanitized = { ...obj };
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'jwt', 'email'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  return sanitized;
}

function formatLog(level, event, message, details = {}, traceId = null) {
  const logObj = {
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
    details: sanitize(details),
  };

  if (traceId) {
    logObj.traceId = traceId;
  }

  return JSON.stringify(logObj);
}

export const logger = {
  info: (event, message, details = {}, traceId = null) => {
    console.log(formatLog('INFO', event, message, details, traceId));
  },
  
  warn: (event, message, details = {}, traceId = null) => {
    console.warn(formatLog('WARN', event, message, details, traceId));
  },
  
  error: (event, message, error, details = {}, traceId = null) => {
    const errorDetails = {
      ...details,
      errorMessage: error?.message,
      errorStack: error?.stack,
    };
    console.error(formatLog('ERROR', event, message, errorDetails, traceId));
  },

  auth: (userId, event, success, details = {}, traceId = null) => {
    const authDetails = { ...details, userId, success };
    console.log(formatLog('AUTH', event, `Auth event: ${event} - Success: ${success}`, authDetails, traceId));
  }
};

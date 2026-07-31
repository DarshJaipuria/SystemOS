/**
 * Centralized Application Configuration
 */
export const config = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'fallback-jwt-development-secret-key-change-in-prod',
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isProd: process.env.NODE_ENV === 'production',
};

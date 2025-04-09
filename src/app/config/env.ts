// Environment variables and their types

export const env = {
  // API configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Authentication endpoints
  AUTH_ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Other configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Challenge App',
  ENV: process.env.NODE_ENV || 'development',
} as const;

// Type for environment configuration
export type Env = typeof env;
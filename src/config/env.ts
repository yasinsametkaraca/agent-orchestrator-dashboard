export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiKey: import.meta.env.VITE_API_KEY || '',
  appName: import.meta.env.VITE_APP_NAME || 'Agent Orchestrator Dashboard',
  environment: import.meta.env.VITE_ENVIRONMENT || 'local'
} as const;

export const isLocalEnv =
  appConfig.environment === 'local' ||
  appConfig.environment === 'development' ||
  appConfig.environment === 'dev';

import axios, { AxiosError } from 'axios';
import { appConfig, isLocalEnv } from '@/config/env';
import { ApiError } from '@/types/api';

const generateRequestId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4-ish
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const httpClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000
});

httpClient.interceptors.request.use((config) => {
  const headers = config.headers ?? {};

  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (appConfig.apiKey && !headers['X-API-Key']) {
    headers['X-API-Key'] = appConfig.apiKey;
  }

  if (!headers['X-Request-Id']) {
    headers['X-Request-Id'] = generateRequestId();
  }

  config.headers = headers;

  if (isLocalEnv) {
    // Lightweight trace for debugging request flows in local dev
    // eslint-disable-next-line no-console
    console.debug('[http] request', config.method, config.url, {
      requestId: headers['X-Request-Id']
    });
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let apiError: ApiError;

    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;
      const payload = data && data.error;

      if (payload && typeof payload === 'object') {
        apiError = new ApiError({
          code: String(payload.code || 'API_ERROR'),
          message: String(payload.message || 'Request failed.'),
          status,
          details: payload.details
        });
      } else {
        apiError = new ApiError({
          code: 'HTTP_ERROR',
          message: `Request failed with status ${status}.`,
          status
        });
      }
    } else if (error.request) {
      apiError = new ApiError({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.'
      });
    } else {
      apiError = new ApiError({
        code: 'UNKNOWN_ERROR',
        message: error.message || 'Unexpected error occurred.'
      });
    }

    if (isLocalEnv) {
      // eslint-disable-next-line no-console
      console.error('[http] error', apiError.code, apiError.message, {
        status: apiError.status,
        details: apiError.details
      });
    }

    return Promise.reject(apiError);
  }
);

import { httpClient } from './httpClient';
import type { SystemMetrics } from '@/types/domain';

export const metricsApi = {
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await httpClient.get<SystemMetrics>('/v1/system/metrics');
    return response.data;
  },

  async getHealthRaw(): Promise<string> {
    const response = await httpClient.get('/health', {
      responseType: 'text'
    });
    return String(response.data);
  }
};

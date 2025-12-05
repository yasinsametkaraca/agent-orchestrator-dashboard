import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SystemMetrics } from '@/types/domain';
import { metricsApi } from '@/api/metricsApi';
import { isLocalEnv } from '@/config/env';

interface MetricsState {
  metrics: SystemMetrics | null;
  loading: boolean;
  error: string | null;
  autoRefresh: boolean;
  autoRefreshIntervalId: number | null;
  healthText: string | null;
}

export const useMetricsStore = defineStore('metrics', () => {
  const state = ref<MetricsState>({
    metrics: null,
    loading: false,
    error: null,
    autoRefresh: false,
    autoRefreshIntervalId: null,
    healthText: null
  });

  const fetchMetrics = async (): Promise<void> => {
    state.value.loading = true;
    state.value.error = null;
    try {
      const metrics = await metricsApi.getSystemMetrics();
      state.value.metrics = metrics;
      try {
        state.value.healthText = await metricsApi.getHealthRaw();
      } catch {
        // Best-effort; ignore health text errors
      }
    } catch (err: any) {
      state.value.error = err?.message || 'Failed to load system metrics.';
      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.error('[metrics] fetchMetrics error', err, {
          message: state.value.error
        });
      }
      throw err;
    } finally {
      state.value.loading = false;
    }
  };

  const startAutoRefresh = (intervalMs: number): void => {
    if (state.value.autoRefreshIntervalId !== null) return;
    state.value.autoRefresh = true;
    const id = window.setInterval(() => {
      void fetchMetrics();
    }, intervalMs);
    state.value.autoRefreshIntervalId = id;
  };

  const stopAutoRefresh = (): void => {
    state.value.autoRefresh = false;
    if (state.value.autoRefreshIntervalId !== null) {
      window.clearInterval(state.value.autoRefreshIntervalId);
      state.value.autoRefreshIntervalId = null;
    }
  };

  return {
    metrics: computed(() => state.value.metrics),
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),
    autoRefresh: computed(() => state.value.autoRefresh),
    healthText: computed(() => state.value.healthText),
    fetchMetrics,
    startAutoRefresh,
    stopAutoRefresh
  };
});

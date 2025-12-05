<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import PageHeader from '@/components/molecules/PageHeader.vue';
import SystemMetricsGrid from '@/components/organisms/SystemMetricsGrid.vue';
import SystemChartsPanel from '@/components/organisms/SystemChartsPanel.vue';
import HealthStatusRow from '@/components/molecules/HealthStatusRow.vue';
import ToggleSwitch from '@/components/atoms/ToggleSwitch.vue';
import LoaderSpinner from '@/components/atoms/LoaderSpinner.vue';
import { useMetricsStore } from '@/store/useMetricsStore';

const metricsStore = useMetricsStore();
const { metrics, loading, error, healthText } = storeToRefs(metricsStore);

const autoRefresh = computed({
  // Pinia unwraps computed properties, so this is a plain boolean here.
  get: () => metricsStore.autoRefresh,
  set: (val: boolean) => {
    if (val) {
      metricsStore.startAutoRefresh(15000);
    } else {
      metricsStore.stopAutoRefresh();
    }
  }
});

const debugPageState = (context: string) => {
  if (!import.meta.env.DEV) return;
  // eslint-disable-next-line no-console
  console.debug('[SystemMonitorPage]', context, {
    hasMetrics: !!metrics.value,
    autoRefresh: autoRefresh.value,
    loading: loading.value,
    error: error.value
  });
};

onMounted(async () => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[SystemMonitorPage] initial metrics fetch');
  }
  await metricsStore.fetchMetrics();
  metricsStore.startAutoRefresh(15000);
  debugPageState('mounted:afterFetch');
});
</script>

<template>
  <div>
    <PageHeader
      title="System Monitor"
      subtitle="Real-time system health and analytics"
    />

    <div class="mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <div>
       <span v-if="healthText">
          Health:
          <span class="font-mono">
            {{ healthText }}
          </span>
        </span>
      </div>
      <ToggleSwitch v-model="autoRefresh" label="Auto refresh" />
    </div>

    <div v-if="loading">
      <LoaderSpinner />
    </div>

    <SystemMetricsGrid :metrics="metrics" />
    <SystemChartsPanel :metrics="metrics" />

    <section class="card mt-6">
      <div class="card-inner">
        <div class="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
          System Health
        </div>
        <div class="space-y-2">
          <HealthStatusRow
            title="API Health"
            :description="
              metrics
                ? 'All endpoints responding normally'
                : 'Waiting for metrics from backend'
            "
            :healthy="!!metrics"
          />
          <HealthStatusRow
            title="MongoDB Connection"
            :description="
              metrics?.api_health.mongo === 'up'
                ? 'Connected to primary cluster'
                : 'MongoDB connectivity issues detected'
            "
            :healthy="metrics?.api_health.mongo === 'up'"
          />
          <HealthStatusRow
            title="Redis"
            :description="
              metrics?.api_health.redis === 'up'
                ? 'Queue backend responsive'
                : 'Redis connectivity issues detected'
            "
            :healthy="metrics?.api_health.redis === 'up'"
          />
          <HealthStatusRow
            title="LLM Provider"
            :description="
              metrics?.api_health.llm_provider === 'up'
                ? 'LLM requests functioning normally'
                : 'LLM provider connectivity issues detected'
            "
            :healthy="metrics?.api_health.llm_provider === 'up'"
          />
        </div>
      </div>
    </section>

    <div v-if="error" class="mt-4 text-xs text-rose-600 dark:text-rose-400">
      {{ error }}
    </div>
  </div>
</template>

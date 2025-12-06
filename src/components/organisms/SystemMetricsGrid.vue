<script setup lang="ts">
import type { SystemMetrics } from '@/types/domain';
import MetricCard from '@/components/molecules/MetricCard.vue';
import { getAgentUsageBreakdown, getAgentUsagePercentages } from '@/utils/metricsHelpers';
import { isLocalEnv } from '@/config/env';

interface Props {
  metrics: SystemMetrics | null;
}

defineProps<Props>();

const computePercentages = (metrics: SystemMetrics | null) => {
  const allTimeBreakdown = getAgentUsageBreakdown(metrics?.all_time?.tasks_per_agent);
  const allTimePercentages = getAgentUsagePercentages(allTimeBreakdown);

  if (isLocalEnv) {
    // eslint-disable-next-line no-console
    console.debug('[SystemMetricsGrid] all-time agent usage', {
      hasMetrics: !!metrics,
      allTimeBreakdown,
      allTimePercentages
    });
  }

  return {
    contentPct: allTimePercentages.contentPct,
    codePct: allTimePercentages.codePct
  };
};

const computeTodayCounts = (metrics: SystemMetrics | null) => {
  const todayBreakdown = getAgentUsageBreakdown(metrics?.tasks_per_agent);

  if (isLocalEnv) {
    // eslint-disable-next-line no-console
    console.debug('[SystemMetricsGrid] today agent usage', {
      hasMetrics: !!metrics,
      todayBreakdown
    });
  }

  return {
    contentToday: todayBreakdown.content,
    codeToday: todayBreakdown.code
  };
};
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <MetricCard
      title="Queued Tasks"
      :value="metrics ? String(metrics.pending_tasks) : '0'"
      helper="Waiting for processing"
      icon="clock"
    />
    <MetricCard
      title="Today’s Processed"
      :value="metrics ? String(metrics.total_tasks) : '0'"
      helper="Completed tasks today"
      icon="check"
    />
    <MetricCard
      v-if="metrics"
      title="ContentAgent Usage"
      :value="`${computePercentages(metrics).contentPct}%`"
      :helper="`${computeTodayCounts(metrics).contentToday} tasks today`"
      icon="chart"
    />
    <MetricCard
      v-else
      title="ContentAgent Usage"
      value="0%"
      helper="0 tasks today"
      icon="chart"
    />
    <MetricCard
      v-if="metrics"
      title="CodeAgent Usage"
      :value="`${computePercentages(metrics).codePct}%`"
      :helper="`${computeTodayCounts(metrics).codeToday} tasks today`"
      icon="history"
    />
    <MetricCard
      v-else
      title="CodeAgent Usage"
      value="0%"
      helper="0 tasks today"
      icon="history"
    />
  </div>
</template>

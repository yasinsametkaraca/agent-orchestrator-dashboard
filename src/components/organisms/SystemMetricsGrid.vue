<script setup lang="ts">
import type { SystemMetrics } from '@/types/domain';
import MetricCard from '@/components/molecules/MetricCard.vue';

interface Props {
  metrics: SystemMetrics | null;
}

defineProps<Props>();

const computePercentages = (metrics: SystemMetrics | null) => {
  if (!metrics) return { contentPct: 0, codePct: 0 };
  const content = metrics.tasks_per_agent['ContentAgent'] || 0;
  const code = metrics.tasks_per_agent['CodeAgent'] || 0;
  const total = content + code;
  if (!total) return { contentPct: 0, codePct: 0 };
  return {
    contentPct: Math.round((content / total) * 100),
    codePct: Math.round((code / total) * 100)
  };
};
</script>

<template>
  <div class="grid gap-4 md:grid-cols-4">
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
      :helper="`${metrics.tasks_per_agent['ContentAgent'] || 0} tasks today`"
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
      :helper="`${metrics.tasks_per_agent['CodeAgent'] || 0} tasks today`"
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

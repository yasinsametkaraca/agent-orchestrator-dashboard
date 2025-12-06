<script setup lang="ts">
import { computed } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import type { SystemMetrics } from '@/types/domain';
import {
  getAgentUsageBreakdown,
  getAgentUsagePercentages,
  buildDailyTaskSeriesFromLastDays
} from '@/utils/metricsHelpers';
import { isLocalEnv } from '@/config/env';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

interface Props {
  metrics: SystemMetrics | null;
}

const props = defineProps<Props>();

const resolveChartColors = () => {
  if (typeof window === 'undefined') {
    return {
      barBg: '#3476FA',
      barBorder: '#2756B8',
      donutContent: '#3476FA',
      donutCode: '#06B6D4',
      donutOther: '#94A3B8'
    };
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  if (prefersDark || document.documentElement.classList.contains('dark')) {
    return {
      // Dark mode: daha açık, opaklığı yüksek mavi
      barBg: 'rgba(52, 118, 250, 0.7)',
      barBorder: 'rgba(191, 219, 254, 1)',
      donutContent: 'rgba(96, 165, 250, 1)',
      donutCode: 'rgba(34, 211, 238, 1)',
      donutOther: 'rgba(148, 163, 184, 1)'
    };
  }

  // Light mode: figmadaki maviye yakın
  return {
    barBg: 'rgba(52, 118, 250, 0.85)',
    barBorder: 'rgba(37, 99, 235, 1)',
    donutContent: 'rgba(59, 130, 246, 1)',
    donutCode: 'rgba(6, 182, 212, 1)',
    donutOther: 'rgba(148, 163, 184, 1)'
  };
};

const chartColors = resolveChartColors();

const barData = computed(() => {
  const series = buildDailyTaskSeriesFromLastDays(props.metrics?.last_5_days);

  const chartData = {
    labels: series.labels,
    datasets: [
      {
        label: 'Daily Task Volume',
        data: series.values,
        backgroundColor: chartColors.barBg,
        borderColor: chartColors.barBorder,
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 32
      }
    ]
  };

  if (isLocalEnv) {
    // eslint-disable-next-line no-console
    console.debug('[SystemChartsPanel] barData', chartData);
  }

  return chartData;
});

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        precision: 0
      }
    }
  }
};

const donutData = computed(() => {
  const metrics = props.metrics;
  const breakdown = getAgentUsageBreakdown(metrics?.all_time?.tasks_per_agent);
  const percentages = getAgentUsagePercentages(breakdown);

  const labels: string[] = ['ContentAgent', 'CodeAgent'];
  const values: number[] = [breakdown.content, breakdown.code];

  let hasOther = false;
  if (breakdown.other > 0) {
    labels.push('Other');
    values.push(breakdown.other);
    hasOther = true;
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          chartColors.donutContent,
          chartColors.donutCode,
          ...(hasOther ? [chartColors.donutOther] : [])
        ],
        borderWidth: 0
      }
    ],
    meta: {
      contentPct: percentages.contentPct,
      codePct: percentages.codePct,
      otherPct: percentages.otherPct,
      hasOther
    }
  };

  if (isLocalEnv) {
    // eslint-disable-next-line no-console
    console.debug('[SystemChartsPanel] donutData', chartData);
  }

  return chartData;
});

const donutOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    }
  },
  cutout: '60%'
};
</script>

<template>
  <div class="mt-6 grid gap-4 lg:grid-cols-2">
    <section class="card">
      <div class="card-inner">
        <div class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Daily Task Volume
        </div>
        <Bar :data="barData" :options="barOptions" />
      </div>
    </section>

    <section class="card">
      <div class="card-inner">
        <div class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
          Agent Distribution
        </div>
        <div class="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
          <div class="mx-auto h-40 w-40 lg:mx-0">
            <Doughnut :data="donutData" :options="donutOptions" />
          </div>
          <div class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-blue-500" />
              <span>
                ContentAgent (
                {{ donutData.meta?.contentPct ?? 0 }}%)
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-cyan-500" />
              <span>
                CodeAgent (
                {{ donutData.meta?.codePct ?? 0 }}%)
              </span>
            </div>
            <div
              v-if="donutData.meta?.hasOther"
              class="flex items-center gap-2"
            >
              <span class="h-2 w-2 rounded-full bg-slate-400" />
              <span>
                Other Agents (
                {{ donutData.meta?.otherPct ?? 0 }}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

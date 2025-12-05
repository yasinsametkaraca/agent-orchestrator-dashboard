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

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

interface Props {
  metrics: SystemMetrics | null;
}

const props = defineProps<Props>();

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const barData = computed(() => {
  const values = new Array(7).fill(0);
  if (props.metrics) {
    const date = new Date(props.metrics.date);
    const idx = date.getDay(); // 0-6, Sun-Sat
    const mappedIdx = idx === 0 ? 6 : idx - 1; // Map Sun->6, Mon->0
    values[mappedIdx] = props.metrics.total_tasks;
  }
  return {
    labels: daysOfWeek,
    datasets: [
      {
        label: 'Tasks',
        data: values
      }
    ]
  };
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
  const content = metrics?.tasks_per_agent['ContentAgent'] || 0;
  const code = metrics?.tasks_per_agent['CodeAgent'] || 0;
  const total = content + code || 1;
  const contentPct = Math.round((content / total) * 100);
  const codePct = 100 - contentPct;
  return {
    labels: ['ContentAgent', 'CodeAgent'],
    datasets: [
      {
        data: [content, code]
      }
    ],
    meta: {
      contentPct,
      codePct
    }
  };
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
  <div class="mt-6 grid gap-4 md:grid-cols-2">
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
        <div class="flex items-center gap-6">
          <div class="h-40 w-40">
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
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

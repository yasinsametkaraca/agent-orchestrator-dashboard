<script setup lang="ts">
import type { TaskStatus } from '@/types/domain';

interface Props {
  status: TaskStatus;
}

const props = defineProps<Props>();

const statusMap: Record<
  TaskStatus,
  {
    label: string;
    classes: string;
  }
> = {
  queued: {
    label: 'queued',
    classes:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
  },
  processing: {
    label: 'processing',
    classes:
      'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/60'
  },
  completed: {
    label: 'completed',
    classes:
      'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/60'
  },
  failed: {
    label: 'failed',
    classes:
      'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700/60'
  }
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
      statusMap[status].classes
    ]"
  >
    {{ statusMap[status].label }}
  </span>
</template>

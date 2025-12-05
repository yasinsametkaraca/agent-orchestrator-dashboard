<script setup lang="ts">
import type { TaskLogEntry } from '@/types/domain';
import { formatTime } from '@/utils/taskHelpers';

interface Props {
  logs: TaskLogEntry[];
}

defineProps<Props>();
</script>

<template>
  <section class="card mt-6">
    <div class="card-inner">
      <div class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Logs
      </div>
      <div v-if="!logs.length" class="text-xs text-slate-500 dark:text-slate-400">
        No log entries yet.
      </div>
      <div v-else class="divide-y divide-slate-100 text-sm dark:divide-slate-800">
        <div v-for="log in logs" :key="`${log.timestamp}-${log.message}`" class="flex gap-3 py-2">
          <div class="w-20 text-xs font-mono text-slate-500 dark:text-slate-400">
            {{ formatTime(log.timestamp) }}
          </div>
          <div class="flex-1 text-sm text-slate-700 dark:text-slate-200">
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

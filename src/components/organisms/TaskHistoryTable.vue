<script setup lang="ts">
import type { TaskSummary } from '@/types/domain';
import StatusBadge from '@/components/atoms/StatusBadge.vue';
import BadgePill from '@/components/atoms/BadgePill.vue';
import Icon from '@/components/atoms/Icon.vue';
import { formatDateTime } from '@/utils/taskHelpers';

interface Props {
  tasks: TaskSummary[];
}

defineProps<Props>();

const emit = defineEmits<{
  view: [taskId: string];
}>();

const agentKind = (selectedAgent: string | null | undefined) => {
  if (selectedAgent === 'ContentAgent') return 'content-agent';
  if (selectedAgent === 'CodeAgent') return 'code-agent';
  return 'neutral';
};

const agentLabel = (t: TaskSummary) => t.selected_agent || t.agent_type || 'Unknown';
</script>

<template>
  <section class="card mt-6">
    <div class="card-inner">
      <div class="mb-3 hidden items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 md:flex">
        <div class="grid flex-1 grid-cols-12 gap-4">
          <div class="col-span-4">Task Summary</div>
          <div class="col-span-2">Agent Type</div>
          <div class="col-span-3">Created At</div>
          <div class="col-span-2">Status</div>
          <div class="col-span-1">Actions</div>
        </div>
      </div>
      <div class="h-px w-full bg-slate-100 dark:bg-slate-800" />

      <div v-if="!tasks.length" class="py-6 text-sm text-slate-500 dark:text-slate-400">
        No tasks yet.
      </div>

      <div
        v-else
        class="divide-y divide-slate-100 text-sm dark:divide-slate-800"
      >
        <div
          v-for="task in tasks"
          :key="task.task_id"
          class="grid grid-cols-1 gap-4 py-4 md:grid-cols-12"
        >
          <div class="flex flex-col md:col-span-4">
            <span class="text-sm text-slate-900 dark:text-slate-100">
              {{ task.summary || 'No summary yet' }}
            </span>
            <span class="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {{ task.task_id }}
            </span>
          </div>

          <div class="flex items-center md:col-span-2">
            <div
              class="mr-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 md:hidden"
            >
              Agent
            </div>
            <BadgePill
              :label="agentLabel(task)"
              :kind="agentKind(task.selected_agent)"
            />
          </div>

          <div
            class="flex items-center text-sm text-slate-700 dark:text-slate-200 md:col-span-3"
          >
            <div
              class="mr-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 md:hidden"
            >
              Created
            </div>
            <span>{{ formatDateTime(task.created_at) }}</span>
          </div>

          <div class="flex items-center md:col-span-2">
            <StatusBadge :status="task.status" />
          </div>

          <div
            class="flex items-center md:col-span-1"
          >
            <button
              type="button"
              class="inline-flex min-w-[72px] items-center gap-1 text-xs font-medium text-pa-blue hover:text-blue-600"
              @click="emit('view', task.task_id)"
            >
              <Icon name="eye" :size="16" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

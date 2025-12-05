<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/store/useUiStore';
import { useTaskStore } from '@/store/useTaskStore';
import TaskStatusTimeline from '@/components/molecules/TaskStatusTimeline.vue';
import BadgePill from '@/components/atoms/BadgePill.vue';
import MarkdownRenderer from '@/components/molecules/MarkdownRenderer.vue';
import Icon from '@/components/atoms/Icon.vue';
import { buildTaskLogs, formatTime } from '@/utils/taskHelpers';

const uiStore = useUiStore();
const taskStore = useTaskStore();
const { currentTask } = storeToRefs(taskStore);

const isOpen = computed(
  () => uiStore.isTaskDetailModalOpen && !!uiStore.selectedTaskIdForModal
);

const task = currentTask;
const logs = computed(() => buildTaskLogs(task.value));

onMounted(async () => {
  if (uiStore.selectedTaskIdForModal) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[TaskDetailModal] fetching task detail', {
        taskId: uiStore.selectedTaskIdForModal
      });
    }
    await taskStore.fetchTaskDetail(uiStore.selectedTaskIdForModal);
  }
});

const close = () => {
  uiStore.closeTaskDetailModal();
};
</script>

<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-8"
    >
      <div class="card max-h-[80vh] w-full max-w-2xl overflow-hidden">
        <div class="card-inner max-h-[80vh] overflow-y-auto">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Task Details
              </h2>
            </div>
            <button
              type="button"
              class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              @click="close"
            >
              <Icon name="close" :size="16" />
            </button>
          </div>

          <div v-if="task" class="mt-4 space-y-4">
            <div>
              <div class="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Task ID
              </div>
              <div class="mt-1 font-mono text-sm text-slate-900 dark:text-slate-100">
                {{ task.task_id }}
              </div>
            </div>

            <div>
              <div class="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Full Task
              </div>
              <div class="mt-1 text-sm text-slate-900 dark:text-slate-100">
                {{ task.input_text }}
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                  Agent
                </div>
                <div class="mt-1">
                  <BadgePill
                    :label="task.selected_agent || task.agent_type || 'Unknown'"
                    :kind="
                      task.selected_agent === 'ContentAgent'
                        ? 'content-agent'
                        : task.selected_agent === 'CodeAgent'
                          ? 'code-agent'
                          : 'neutral'
                    "
                  />
                </div>
              </div>
            </div>

            <div>
              <div class="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Status
              </div>
              <TaskStatusTimeline :status="task.status" />
            </div>

            <div v-if="task.result?.raw_output" class="mt-2">
              <div class="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Output
              </div>
              <div
                class="mt-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              >
                <MarkdownRenderer :content="task.result.raw_output" />
              </div>
            </div>

            <div class="mt-4">
              <div class="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Logs
              </div>
              <div
                class="mt-2 max-h-48 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <div v-if="!logs.length" class="text-xs text-slate-500 dark:text-slate-400">
                  No logs yet.
                </div>
                <div
                  v-else
                  class="space-y-2 text-sm text-slate-800 dark:text-slate-100"
                >
                  <div
                    v-for="log in logs"
                    :key="`${log.timestamp}-${log.message}`"
                    class="flex items-start gap-3 text-xs"
                  >
                    <span
                      class="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400"
                    >
                      {{ formatTime(log.timestamp) }}
                    </span>
                    <span>{{ log.message }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { TaskDetail } from '@/types/domain';
import TaskStatusTimeline from '@/components/molecules/TaskStatusTimeline.vue';
import BadgePill from '@/components/atoms/BadgePill.vue';
import MarkdownRenderer from '@/components/molecules/MarkdownRenderer.vue';

interface Props {
  task: TaskDetail | null;
}

defineProps<Props>();
</script>

<template>
  <section v-if="task" class="card mt-6">
    <div class="card-inner">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Task Result
          </div>
          <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Task ID:
            <span class="font-mono text-slate-700 dark:text-slate-200">
              {{ task.task_id }}
            </span>
          </div>
          <div v-if="task.peer_routing_reason" class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Routed because:
            <span class="italic">
              {{ task.peer_routing_reason }}
            </span>
          </div>
        </div>

        <div v-if="task.selected_agent">
          <BadgePill
            :label="task.selected_agent"
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

      <TaskStatusTimeline :status="task.status" />

      <div class="mt-6">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Output
        </div>
        <div
          class="mt-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
        >
          <p class="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Content generated for:
            <span class="font-medium text-slate-800 dark:text-slate-100">
              {{ task.input_text }}
            </span>
          </p>
          <div v-if="task.result?.raw_output">
            <MarkdownRenderer :content="task.result.raw_output" />
          </div>
          <p v-else class="text-sm text-slate-500 dark:text-slate-400">
            Task output will appear here once processing is completed.
          </p>
        </div>

        <div v-if="task.result?.citations?.length" class="mt-4">
          <div class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            References
          </div>
          <ul class="list-inside list-disc text-xs text-slate-600 dark:text-slate-300">
            <li v-for="c in task.result.citations" :key="`${c.source}-${c.url}`">
              <span class="font-medium">{{ c.source }}</span>
              <template v-if="c.url">
                -
                <a
                  :href="c.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-pa-blue hover:underline"
                >
                  {{ c.title || c.url }}
                </a>
              </template>
            </li>
          </ul>
        </div>

        <div v-if="task.status === 'failed' && task.error" class="mt-4">
          <div class="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <div class="font-semibold">Task failed</div>
            <div class="mt-1">
              {{ (task.error as any).message || 'Unknown error.' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

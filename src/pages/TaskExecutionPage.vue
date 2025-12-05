<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import PageHeader from '@/components/molecules/PageHeader.vue';
import TaskInputCard from '@/components/organisms/TaskInputCard.vue';
import TaskResultCard from '@/components/organisms/TaskResultCard.vue';
import TaskLogsCard from '@/components/organisms/TaskLogsCard.vue';
import LoaderSpinner from '@/components/atoms/LoaderSpinner.vue';
import { useTaskStore } from '@/store/useTaskStore';
import { useErrorHandler } from '@/composables/useErrorHandler';

const taskStore = useTaskStore();
const { handleError } = useErrorHandler();

// Keep store reactivity by converting store properties to refs.
const { loading, currentTask, currentTaskLogs, error } = storeToRefs(taskStore);

const taskText = ref('');
const sessionId = ref<string | null>(null);

const logs = currentTaskLogs;

const debugPageState = (context: string) => {
  if (!import.meta.env.DEV) return;
  // eslint-disable-next-line no-console
  console.debug('[TaskExecutionPage]', context, {
    hasCurrentTask: !!currentTask.value,
    currentTaskId: currentTask.value?.task_id ?? null,
    loading: loading.value,
    error: error.value,
    sessionId: sessionId.value
  });
};

onMounted(() => {
  debugPageState('mounted');

  const existingTask = currentTask.value;
  if (existingTask) {
    taskText.value = existingTask.input_text;
    sessionId.value = existingTask.session_id;
  }
});

const execute = async () => {
  debugPageState('execute:start');
  try {
    await taskStore.executeTask(taskText.value, sessionId.value ?? undefined);
    const updatedTask = currentTask.value;
    if (updatedTask) {
      sessionId.value = updatedTask.session_id;
    }
    debugPageState('execute:success');
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[TaskExecutionPage] executeTask failed', err, {
        sessionId: sessionId.value
      });
    }
    handleError(err, 'Failed to execute task.');
    debugPageState('execute:error');
  }
};

</script>

<template>
  <div>
    <PageHeader
      title="Execute Task using Peer Agent"
      subtitle="Submit any task. Peer Agent will analyze and route it to the appropriate specialized agent."
    />

    <TaskInputCard :model-value="taskText" :loading="loading" @update:model-value="taskText = $event" @execute="execute" />

    <div v-if="loading && !currentTask" class="mt-4">
      <LoaderSpinner />
    </div>

    <div v-if="error" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
      {{ error }}
    </div>

    <TaskResultCard :task="currentTask" />
    <TaskLogsCard v-if="currentTask" :logs="logs" />
  </div>
</template>

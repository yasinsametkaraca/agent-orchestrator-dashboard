<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import PageHeader from '@/components/molecules/PageHeader.vue';
import BaseInput from '@/components/atoms/BaseInput.vue';
import TaskHistoryTable from '@/components/organisms/TaskHistoryTable.vue';
import EmptyStateCard from '@/components/organisms/EmptyStateCard.vue';
import TaskDetailModal from '@/components/organisms/TaskDetailModal.vue';
import ToggleSwitch from '@/components/atoms/ToggleSwitch.vue';
import Icon from '@/components/atoms/Icon.vue';
import { useTaskStore } from '@/store/useTaskStore';
import { useUiStore } from '@/store/useUiStore';
import LoaderSpinner from '@/components/atoms/LoaderSpinner.vue';
import type { TaskStatus } from '@/types/domain';

const taskStore = useTaskStore();
const uiStore = useUiStore();
const { loading, history: taskHistory } = storeToRefs(taskStore);

const search = ref('');
const selectedAgent = ref<'all' | 'content' | 'code'>('all');
const selectedStatus = ref<'all' | TaskStatus>('all');

// Keep a local computed alias for readability and single responsibility.
const tasks = computed(() => taskHistory.value);
const hasTasks = computed(() => tasks.value.length > 0);

const applyFilters = async () => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[TaskHistoryPage] applyFilters', {
      search: search.value,
      selectedAgent: selectedAgent.value,
      selectedStatus: selectedStatus.value
    });
  }

  taskStore.setSearchFilter(search.value);
  taskStore.setAgentTypeFilter(selectedAgent.value === 'all' ? null : selectedAgent.value);
  taskStore.setStatusFilter(selectedStatus.value === 'all' ? undefined : selectedStatus.value);

  try {
    await taskStore.loadHistory();
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[TaskHistoryPage] loadHistory failed', err);
    }
    // The store already sets a user-facing error message.
  }
};

onMounted(async () => {
  await applyFilters();
});

watch([selectedAgent, selectedStatus], async () => {
  await applyFilters();
});

watch(
  () => search.value,
  (val) => {
    taskStore.setSearchFilter(val);
  }
);

const openDetails = (taskId: string) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[TaskHistoryPage] openDetails', { taskId });
  }
  uiStore.openTaskDetailModal(taskId);
};
</script>

<template>
  <div>
    <PageHeader
      title="Task History"
      subtitle="View and manage all executed tasks"
    />

    <section class="card">
      <div class="card-inner flex flex-col gap-4 md:flex-row md:items-center">
        <div class="flex-1">
          <div class="relative">
            <span
              class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"
            >
              <Icon name="search" :size="16" />
            </span>
            <BaseInput
              v-model="search"
              placeholder="Search tasks..."
              class="pl-9"
            />
          </div>
        </div>

        <div class="flex flex-1 flex-col gap-3 md:flex-row">
          <div class="flex-1">
            <select
              v-model="selectedAgent"
              class="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-pa-blue focus:outline-none focus:ring-2 focus:ring-pa-blue/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="all">All Agents</option>
              <option value="content">ContentAgent</option>
              <option value="code">CodeAgent</option>
            </select>
          </div>
          <div class="flex-1">
            <select
              v-model="selectedStatus"
              class="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-pa-blue focus:outline-none focus:ring-2 focus:ring-pa-blue/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              <option value="queued">queued</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="failed">failed</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading" class="mt-4">
      <LoaderSpinner />
    </div>

    <TaskHistoryTable
      v-if="hasTasks"
      :tasks="tasks"
      @view="openDetails"
    />

    <EmptyStateCard v-else-if="!hasTasks" />

    <TaskDetailModal v-if="uiStore.isTaskDetailModalOpen" />
  </div>
</template>

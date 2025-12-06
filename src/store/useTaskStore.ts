import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  TaskDetail,
  TaskSummary,
  TaskStatus,
  TaskStatusEvent
} from '@/types/domain';
import type { ExecuteTaskRequest } from '@/types/domain';
import { agentApi } from '@/api/agentApi';
import { tasksApi } from '@/api/tasksApi';
import { useSseOrPolling, DEFAULT_TASK_STATUS_POLLING_INTERVAL_MS } from '@/composables/useSseOrPolling';
import { appConfig, isLocalEnv } from '@/config/env';
import { buildTaskLogs } from '@/utils/taskHelpers';

export interface TaskFilters {
  status?: TaskStatus;
  agent_type?: 'content' | 'code' | null;
  search?: string;
}

interface TaskState {
  currentTaskId: string | null;
  currentTask: TaskDetail | null;
  history: TaskSummary[];
  loading: boolean;
  polling: boolean;
  error: string | null;
  filters: TaskFilters;
  historyPage: number;
  historyPageSize: number;
}

export const useTaskStore = defineStore('tasks', () => {
  const state = ref<TaskState>({
    currentTaskId: null,
    currentTask: null,
    history: [],
    loading: false,
    polling: false,
    error: null,
    filters: {
      status: undefined,
      agent_type: null,
      search: ''
    },
    historyPage: 1,
    historyPageSize: 20
  });

  let trackingController:
    | {
        start: () => void;
        stop: () => void;
        isUsingSse: { value: boolean };
      }
    | null = null;

  const hasApiKey = computed(() => Boolean(appConfig.apiKey));

  const currentTaskLogs = computed(() => buildTaskLogs(state.value.currentTask));

  const debugState = (context: string): void => {
    if (!isLocalEnv) return;
    // eslint-disable-next-line no-console
    console.debug('[tasks]', context, {
      currentTaskId: state.value.currentTaskId,
      hasCurrentTask: !!state.value.currentTask,
      error: state.value.error,
      loading: state.value.loading,
      polling: state.value.polling,
      filters: state.value.filters,
      historyPage: state.value.historyPage,
      historyPageSize: state.value.historyPageSize
    });
  };

  const executeTask = async (taskText: string, sessionId?: string): Promise<void> => {
    const trimmed = taskText.trim();
    if (!trimmed) {
      state.value.error = 'Task cannot be empty.';
      throw new Error('Task cannot be empty.');
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const payload: ExecuteTaskRequest = {
        task: trimmed,
        session_id: sessionId ?? null
      };

      const response = await agentApi.executeTask(payload);
      state.value.currentTaskId = response.task_id;

      await fetchTaskDetail(response.task_id);
      startTaskTracking(response.task_id);
      debugState('executeTask:success');
    } catch (err: any) {
      state.value.error = err?.message || 'Failed to execute task.';
      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.error('[tasks] executeTask error', err, {
          message: state.value.error
        });
      }
      debugState('executeTask:error');
      throw err;
    } finally {
      state.value.loading = false;
    }
  };

  const fetchTaskDetail = async (taskId: string): Promise<void> => {
    try {
      const detail = await tasksApi.getTaskDetail(taskId);
      state.value.currentTask = detail;
      debugState('fetchTaskDetail:success');
    } catch (err: any) {
      state.value.error = err?.message || 'Failed to fetch task detail.';
      throw err;
    }
  };

  const startTaskTracking = (taskId: string): void => {
    stopTaskTracking();

    const controller = useSseOrPolling({
      taskId,
      hasApiKey: hasApiKey.value,
      async onStatusEvent(event: TaskStatusEvent) {
        if (!state.value.currentTask || state.value.currentTask.task_id !== taskId) {
          await fetchTaskDetail(taskId);
        } else if (state.value.currentTask.status !== event.status) {
          await fetchTaskDetail(taskId);
        }

        if (event.status === 'completed' || event.status === 'failed') {
          stopTaskTracking();
        }
      },
      async onPollingTick() {
        if (!state.value.currentTaskId) return;
        await fetchTaskDetail(state.value.currentTaskId);
        const status = state.value.currentTask?.status;
        if (status === 'completed' || status === 'failed') {
          stopTaskTracking();
        }
      },
      pollingIntervalMs: DEFAULT_TASK_STATUS_POLLING_INTERVAL_MS,
      onModeChange(mode) {
        state.value.polling = mode === 'polling';
        debugState(`startTaskTracking:mode:${mode}`);
      }
    });

    trackingController = controller;
    trackingController.start();
    debugState('startTaskTracking:init');
  };

  const stopTaskTracking = (): void => {
    if (trackingController) {
      trackingController.stop();
      trackingController = null;
    }
    state.value.polling = false;
    debugState('stopTaskTracking');
  };

  const loadHistory = async (): Promise<void> => {
    state.value.loading = true;
    state.value.error = null;
    try {
      const { status, agent_type } = state.value.filters;
      const results = await tasksApi.listTasks({
        status,
        agent_type: agent_type ?? undefined,
        page: state.value.historyPage,
        page_size: state.value.historyPageSize
      });
      state.value.history = results;
      debugState('loadHistory:success');
    } catch (err: any) {
      state.value.error = err?.message || 'Failed to load task history.';
      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.error('[tasks] loadHistory error', err, {
          filters: state.value.filters,
          page: state.value.historyPage,
          pageSize: state.value.historyPageSize
        });
      }
      debugState('loadHistory:error')
      throw err;
    } finally {
      state.value.loading = false;
    }
  };

  const setStatusFilter = (status?: TaskStatus) => {
    state.value.filters.status = status;
  };

  const setAgentTypeFilter = (agentType?: 'content' | 'code' | null) => {
    state.value.filters.agent_type = agentType ?? null;
  };

  const setSearchFilter = (search: string) => {
    state.value.filters.search = search;
  };

  const setHistoryPage = (page: number) => {
    if (page < 1) return;
    state.value.historyPage = page;
  };

  const filteredHistory = computed(() => {
    const search = (state.value.filters.search || '').toLowerCase().trim();
    if (!search) return state.value.history;
    return state.value.history.filter((task) => {
      const source = (task.summary || task.task_id || '').toLowerCase();
      return source.includes(search);
    });
  });

  return {
    state,
    currentTaskId: computed(() => state.value.currentTaskId),
    currentTask: computed(() => state.value.currentTask),
    history: filteredHistory,
    rawHistory: computed(() => state.value.history),
    loading: computed(() => state.value.loading),
    polling: computed(() => state.value.polling),
    error: computed(() => state.value.error),
    filters: computed(() => state.value.filters),
    historyPage: computed(() => state.value.historyPage),
    historyPageSize: computed(() => state.value.historyPageSize),
    currentTaskLogs,
    executeTask,
    fetchTaskDetail,
    startTaskTracking,
    stopTaskTracking,
    loadHistory,
    setStatusFilter,
    setAgentTypeFilter,
    setSearchFilter,
    setHistoryPage
  };
});

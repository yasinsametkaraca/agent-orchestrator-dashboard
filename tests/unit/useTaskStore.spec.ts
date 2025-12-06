import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type {
  ExecuteTaskResponse,
  TaskDetail,
  TaskStatus,
  TaskListResponse,
  TaskSummary
} from '@/types/domain';
import { useTaskStore } from '@/store/useTaskStore';
import { agentApi } from '@/api/agentApi';
import { tasksApi } from '@/api/tasksApi';

vi.mock('@/api/agentApi', () => ({
  agentApi: {
    executeTask: vi.fn()
  }
}));

vi.mock('@/api/tasksApi', () => ({
  tasksApi: {
    getTaskDetail: vi.fn(),
    listTasks: vi.fn()
  }
}));

vi.mock('@/composables/useSseOrPolling', () => ({
  useSseOrPolling: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    isUsingSse: { value: false }
  }),
  DEFAULT_TASK_STATUS_POLLING_INTERVAL_MS: 2500
}));

const mockedAgentApi = agentApi as Mocked<typeof agentApi>;
const mockedTasksApi = tasksApi as Mocked<typeof tasksApi>;

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('executeTask updates state and calls API', async () => {
    const store = useTaskStore();
    const response: ExecuteTaskResponse = {
      task_id: 'task-123',
      session_id: 'session-1',
      status: 'queued' as TaskStatus,
      queued_at: new Date().toISOString(),
      message: 'Task accepted and queued.',
      api_version: 'v1'
    };
    const detail: TaskDetail = {
      task_id: 'task-123',
      session_id: 'session-1',
      input_text: 'test task',
      status: 'queued',
      selected_agent: null,
      agent_type: null,
      peer_routing_reason: null,
      created_at: new Date().toISOString(),
      queued_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      result: null,
      error: null,
      agent_runs: [],
      api_version: 'v1'
    };

    mockedAgentApi.executeTask.mockResolvedValue(response);
    mockedTasksApi.getTaskDetail.mockResolvedValue(detail);

    await store.executeTask('test task');

    expect(mockedAgentApi.executeTask).toHaveBeenCalledTimes(1);
    expect(store.currentTaskId).toBe('task-123');
    expect(store.currentTask?.task_id).toBe('task-123');
  });

  it('loadHistory populates history', async () => {
    const store = useTaskStore();
    const items: TaskSummary[] = [
      {
        task_id: 'task-1',
        agent_type: 'content',
        selected_agent: 'ContentAgent',
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        summary: 'Test summary'
      }
    ];

    const listResponse: TaskListResponse = {
      items,
      meta: {
        page: 1,
        page_size: 20,
        total_items: items.length,
        total_pages: 1,
        has_next: false,
        has_previous: false
      }
    };

    mockedTasksApi.listTasks.mockResolvedValue(listResponse);

    await store.loadHistory();
    expect(store.history.length).toBe(1);
    expect(store.history[0].task_id).toBe('task-1');
    expect(store.paginationMeta?.total_items).toBe(1);
  });
});

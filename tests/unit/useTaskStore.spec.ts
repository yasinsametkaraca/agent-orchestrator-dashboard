import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTaskStore } from '@/store/useTaskStore';
import type { ExecuteTaskResponse, TaskDetail, TaskStatus } from '@/types/domain';

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
  })
}));

const mockExecuteTask = vi.importedModule<typeof import('@/api/agentApi')>('agentApi');
const mockTasksApi = vi.importedModule<typeof import('@/api/tasksApi')>('tasksApi');

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
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

    (mockExecuteTask.agentApi.executeTask as any).mockResolvedValue(response);
    (mockTasksApi.tasksApi.getTaskDetail as any).mockResolvedValue(detail);

    await store.executeTask('test task');

    expect(mockExecuteTask.agentApi.executeTask).toHaveBeenCalledTimes(1);
    expect(store.currentTaskId.value).toBe('task-123');
    expect(store.currentTask.value?.task_id).toBe('task-123');
  });

  it('loadHistory populates history', async () => {
    const store = useTaskStore();
    (mockTasksApi.tasksApi.listTasks as any).mockResolvedValue([
      {
        task_id: 'task-1',
        agent_type: 'content',
        selected_agent: 'ContentAgent',
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        summary: 'Test summary'
      }
    ]);

    await store.loadHistory();
    expect(store.history.value.length).toBe(1);
    expect(store.history.value[0].task_id).toBe('task-1');
  });
});

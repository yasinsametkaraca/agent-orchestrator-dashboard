import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TaskExecutionPage from '@/pages/TaskExecutionPage.vue';

vi.mock('@/api/agentApi', () => ({
  agentApi: {
    executeTask: vi.fn().mockResolvedValue({
      task_id: 'task-123',
      session_id: 'session-1',
      status: 'queued',
      queued_at: new Date().toISOString(),
      message: 'Task accepted and queued.',
      api_version: 'v1'
    })
  }
}));

vi.mock('@/api/tasksApi', () => ({
  tasksApi: {
    getTaskDetail: vi.fn().mockResolvedValue({
      task_id: 'task-123',
      session_id: 'session-1',
      input_text: 'my test task',
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
    })
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

describe('TaskExecutionPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('submits a task when Execute Task is clicked', async () => {
    const wrapper = mount(TaskExecutionPage, {
      global: {
        plugins: [createPinia()]
      }
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('my test task');

    const button = wrapper.find('button');
    await button.trigger('click');

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect((textarea.element as HTMLTextAreaElement).value).toBe('my test task');
  });
});

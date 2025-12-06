import { httpClient } from './httpClient';
import type { TaskDetail, TaskStatus, TaskListResponse } from '@/types/domain';

export interface ListTasksParams {
  status?: TaskStatus;
  agent_type?: 'content' | 'code';
  page?: number;
  page_size?: number;
}

export const tasksApi = {
  async listTasks(params: ListTasksParams): Promise<TaskListResponse> {
    const response = await httpClient.get<TaskListResponse>('/v1/tasks', { params });
    return response.data;
  },

  async getTaskDetail(taskId: string): Promise<TaskDetail> {
    const response = await httpClient.get<TaskDetail>(`/v1/tasks/${encodeURIComponent(taskId)}`);
    return response.data;
  }
};

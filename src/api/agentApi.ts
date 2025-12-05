import { httpClient } from './httpClient';
import type { ExecuteTaskRequest, ExecuteTaskResponse } from '@/types/domain';

export const agentApi = {
  async executeTask(payload: ExecuteTaskRequest): Promise<ExecuteTaskResponse> {
    const response = await httpClient.post<ExecuteTaskResponse>('/v1/agent/execute', payload);
    return response.data;
  }
};

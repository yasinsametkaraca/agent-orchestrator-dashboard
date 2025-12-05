export type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type AgentType = 'content' | 'code' | null;

export interface Citation {
  source: string;
  title?: string | null;
  url?: string | null;
}

export interface TaskResult {
  summary?: string | null;
  raw_output?: string | null;
  code_language?: string | null;
  citations: Citation[];
}

export interface TaskErrorInfo {
  type?: string | null;
  message?: string | null;
  stack?: string | null;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface AgentRun {
  run_id: string;
  task_id: string;
  session_id?: string | null;
  agent_name: string;
  agent_role: string; // "router" | "executor"
  input: string;
  output: string;
  model: string;
  tools_used: string[];
  started_at: string;
  finished_at: string;
  duration_ms: number;
  token_usage: TokenUsage;
}

export interface TaskSummary {
  task_id: string;
  agent_type: AgentType;
  selected_agent: string | null;
  status: TaskStatus;
  created_at: string;
  completed_at: string | null;
  summary: string | null;
}

export interface TaskDetail {
  task_id: string;
  session_id: string | null;
  input_text: string;
  status: TaskStatus;
  selected_agent: string | null;
  agent_type: AgentType;
  peer_routing_reason: string | null;
  created_at: string;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  result: TaskResult | null;
  error: Record<string, unknown> | null;
  agent_runs: AgentRun[];
  api_version: string;
}

export interface ExecuteTaskRequest {
  task: string;
  session_id?: string | null;
}

export interface ExecuteTaskResponse {
  task_id: string;
  session_id: string | null;
  status: TaskStatus;
  queued_at: string;
  message: string;
  api_version: string;
}

export interface SystemMetrics {
  date: string; // YYYY-MM-DD
  total_tasks: number;
  tasks_per_agent: Record<string, number>;
  pending_tasks: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  api_health: Record<string, string>;
  api_version: string;
}

export interface TaskStatusEvent {
  event: string;
  status: TaskStatus;
  timestamp: string;
  error_type?: string | null;
  error_message?: string | null;
}

export interface TaskLogEntry {
  timestamp: string; // ISO string
  message: string;
}

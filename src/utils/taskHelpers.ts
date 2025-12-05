import type { AgentRun, TaskDetail, TaskLogEntry } from '@/types/domain';

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
};

export const formatTime = (iso: string | null | undefined): string => {
  if (!iso) return '--:--:--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--:--:--';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const formatDurationMs = (start: string | null, end: string | null): string => {
  if (!start || !end) return '-';
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return '-';
  const ms = e - s;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
};

const findRunByRole = (runs: AgentRun[], role: string): AgentRun | undefined =>
  runs.find((r) => r.agent_role === role);

export const buildTaskLogs = (task: TaskDetail | null): TaskLogEntry[] => {
  if (!task) return [];
  const entries: TaskLogEntry[] = [];

  // Queued event
  if (task.queued_at) {
    entries.push({
      timestamp: task.queued_at,
      message: 'Task received and queued'
    });
  }

  const routerRun = findRunByRole(task.agent_runs, 'router');
  if (routerRun && task.selected_agent) {
    entries.push({
      timestamp: routerRun.finished_at || routerRun.started_at,
      message: `Routed to ${task.selected_agent}`
    });
  }

  const executorRun = findRunByRole(task.agent_runs, 'executor');
  if (executorRun) {
    entries.push({
      timestamp: executorRun.started_at,
      message: 'Processing started'
    });

    if (task.status === 'completed') {
      entries.push({
        timestamp: executorRun.finished_at,
        message: 'Task completed successfully'
      });
    } else if (task.status === 'failed') {
      entries.push({
        timestamp: executorRun.finished_at,
        message:
          (task.error && (task.error as any).message) ||
          'Task failed. Please check details for more information.'
      });
    }
  }

  return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

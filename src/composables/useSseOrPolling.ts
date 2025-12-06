import { ref } from 'vue';
import type { TaskStatusEvent } from '@/types/domain';
import { appConfig, isLocalEnv } from '@/config/env';
import { usePolling } from './usePolling';

interface UseSseOrPollingOptions {
  taskId: string;
  hasApiKey: boolean;
  onStatusEvent: (event: TaskStatusEvent) => Promise<void> | void;
  onPollingTick: () => Promise<void> | void;
  pollingIntervalMs?: number;
  onModeChange?: (mode: 'sse' | 'polling') => void;
}

export const DEFAULT_TASK_STATUS_POLLING_INTERVAL_MS = 2500;

export const useSseOrPolling = (options: UseSseOrPollingOptions) => {
  const {
    taskId,
    hasApiKey,
    onStatusEvent,
    onPollingTick,
    pollingIntervalMs = DEFAULT_TASK_STATUS_POLLING_INTERVAL_MS,
    onModeChange
  } = options;

  const isUsingSse = ref(false);
  const isActive = ref(false);

  let eventSource: EventSource | null = null;

  const polling = usePolling(async () => {
    await onPollingTick();
  }, pollingIntervalMs);

  const startPollingFallback = () => {
    if (isLocalEnv) {
      // eslint-disable-next-line no-console
      console.debug('[sse] falling back to polling for task', taskId, {
        intervalMs: pollingIntervalMs
      });
    }
    isUsingSse.value = false;
    if (onModeChange) {
      onModeChange('polling');
    }
    polling.start();
  };

  const start = () => {
    if (isActive.value) return;
    isActive.value = true;

    if (isLocalEnv) {
      // eslint-disable-next-line no-console
      console.debug('[sse] start tracking', {
        taskId,
        hasApiKey,
        apiBaseUrl: appConfig.apiBaseUrl
      });
    }

    // If EventSource is not available (very old browsers, some test environments),
    // we immediately fall back to HTTP polling.
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.debug('[sse] EventSource not available, using polling for', taskId);
      }
      startPollingFallback();
      return;
    }

    try {
      const normalizedBaseUrl = appConfig.apiBaseUrl.replace(/\/$/, '');
      const sseUrl = `${normalizedBaseUrl}/v1/tasks/${encodeURIComponent(taskId)}/events`;

      eventSource = new EventSource(sseUrl);
      isUsingSse.value = true;
      if (onModeChange) {
        onModeChange('sse');
      }

      eventSource.onopen = () => {
        if (isLocalEnv) {
          // eslint-disable-next-line no-console
          console.debug('[sse] connection opened', { taskId, sseUrl });
        }
      };

      eventSource.onmessage = async (evt: MessageEvent<string>) => {
        try {
          const data = JSON.parse(evt.data) as TaskStatusEvent;

          if (data.task_id && data.task_id !== taskId) {
            if (isLocalEnv) {
              // eslint-disable-next-line no-console
              console.warn('[sse] received event for different task id, ignoring', {
                expectedTaskId: taskId,
                eventTaskId: data.task_id
              });
            }
            return;
          }

          if (isLocalEnv) {
            // eslint-disable-next-line no-console
            console.debug('[sse] event received', { taskId, data });
          }
          await onStatusEvent(data);
        } catch (err) {
          if (isLocalEnv) {
            // eslint-disable-next-line no-console
            console.error('[sse] event parse error', err, { taskId, raw: evt.data });
          }
        }
      };

      eventSource.onerror = (evt: Event) => {
        if (isLocalEnv) {
          // eslint-disable-next-line no-console
          console.warn('[sse] connection error, switching to polling', {
            taskId,
            hasApiKey,
            event: evt
          });
        }
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        startPollingFallback();
      };
    } catch (err) {
      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.error('[sse] init error, switching to polling', err, { taskId });
      }
      startPollingFallback();
    }
  };

  const stop = () => {
    isActive.value = false;
    if (eventSource) {
      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.debug('[sse] closing connection', { taskId });
      }
      eventSource.close();
      eventSource = null;
    }
    polling.stop();
  };

  return {
    isUsingSse,
    isActive,
    start,
    stop
  };
};

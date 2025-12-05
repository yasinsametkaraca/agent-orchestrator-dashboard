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
}

export const useSseOrPolling = (options: UseSseOrPollingOptions) => {
  const { taskId, hasApiKey, onStatusEvent, onPollingTick, pollingIntervalMs = 2500 } = options;

  const isUsingSse = ref(false);
  const isActive = ref(false);

  let eventSource: EventSource | null = null;

  const polling = usePolling(async () => {
    await onPollingTick();
  }, pollingIntervalMs);

  const startPollingFallback = () => {
    if (isLocalEnv) {
      // eslint-disable-next-line no-console
      console.debug('[sse] falling back to polling for task', taskId);
    }
    isUsingSse.value = false;
    polling.start();
  };

  const start = () => {
    if (isActive.value) return;
    isActive.value = true;

    // SSE with custom headers is not possible with native EventSource.
    // If API key is configured, we go directly to polling.
    if (hasApiKey) {
      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.debug('[sse] API key detected, skipping SSE and using polling for', taskId);
      }
      startPollingFallback();
      return;
    }

    try {
      const sseUrl = `${appConfig.apiBaseUrl.replace(/\/$/, '')}/v1/tasks/${encodeURIComponent(
        taskId
      )}/events`;

      eventSource = new EventSource(sseUrl);
      isUsingSse.value = true;

      eventSource.onmessage = async (evt: MessageEvent<string>) => {
        try {
          const data = JSON.parse(evt.data) as TaskStatusEvent;
          if (isLocalEnv) {
            // eslint-disable-next-line no-console
            console.debug('[sse] event', taskId, data);
          }
          await onStatusEvent(data);
        } catch (err) {
          if (isLocalEnv) {
            // eslint-disable-next-line no-console
            console.error('[sse] parse error', err);
          }
        }
      };

      eventSource.onerror = () => {
        if (isLocalEnv) {
          // eslint-disable-next-line no-console
          console.warn('[sse] error, closing and switching to polling for', taskId);
        }
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        startPollingFallback();
      };

      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.debug('[sse] connected for task', taskId);
      }
    } catch (err) {
      if (isLocalEnv) {
        // eslint-disable-next-line no-console
        console.error('[sse] init error, switching to polling', err);
      }
      startPollingFallback();
    }
  };

  const stop = () => {
    isActive.value = false;
    if (eventSource) {
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

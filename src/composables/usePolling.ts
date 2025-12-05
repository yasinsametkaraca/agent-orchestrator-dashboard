import { ref, getCurrentInstance, onUnmounted } from 'vue';

export const usePolling = (callback: () => Promise<void> | void, intervalMs = 2000) => {
  const timerId = ref<number | null>(null);
  const isRunning = ref(false);

  const stop = () => {
    isRunning.value = false;
    if (timerId.value !== null) {
      window.clearTimeout(timerId.value);
      timerId.value = null;
    }
  };

  const tick = async () => {
    if (!isRunning.value) return;
    await callback();
    if (!isRunning.value) return;
    timerId.value = window.setTimeout(tick, intervalMs);
  };

  const start = () => {
    if (isRunning.value) return;
    isRunning.value = true;
    timerId.value = window.setTimeout(tick, intervalMs);
  };

  const instance = getCurrentInstance();
  if (instance) {
    onUnmounted(stop);
  }

  return {
    isRunning,
    start,
    stop
  };
};

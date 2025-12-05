import { defineStore } from 'pinia';
import type { Theme } from '@/composables/useTheme';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface UiState {
  theme: Theme;
  isTaskDetailModalOpen: boolean;
  selectedTaskIdForModal: string | null;
  toasts: ToastMessage[];
}

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    theme: 'light',
    isTaskDetailModalOpen: false,
    selectedTaskIdForModal: null,
    toasts: []
  }),
  actions: {
    setTheme(theme: Theme) {
      this.theme = theme;
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },
    openTaskDetailModal(taskId: string) {
      this.selectedTaskIdForModal = taskId;
      this.isTaskDetailModalOpen = true;
    },
    closeTaskDetailModal() {
      this.isTaskDetailModalOpen = false;
      this.selectedTaskIdForModal = null;
    },
    showToast(type: ToastType, message: string) {
      const id = generateId();
      this.toasts.push({ id, type, message });
      setTimeout(() => {
        this.removeToast(id);
      }, 5000);
    },
    removeToast(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }
  }
});

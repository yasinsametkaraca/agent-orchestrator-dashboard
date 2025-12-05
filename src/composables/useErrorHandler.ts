import { ApiError } from '@/types/api';
import { useUiStore } from '@/store/useUiStore';

export const useErrorHandler = () => {
  const uiStore = useUiStore();

  const getMessage = (error: unknown, fallback = 'Unexpected error occurred.') => {
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message || fallback;
    }
    return fallback;
  };

  const handleError = (error: unknown, fallback?: string) => {
    const message = getMessage(error, fallback);
    uiStore.showToast('error', message);
    return message;
  };

  return {
    getMessage,
    handleError
  };
};

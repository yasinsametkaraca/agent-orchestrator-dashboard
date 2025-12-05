import { computed } from 'vue';
import { useUiStore } from '@/store/useUiStore';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pa-theme';

export const resolveInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const applyThemeToDocument = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useTheme = () => {
  const uiStore = useUiStore();

  const setTheme = (theme: Theme) => {
    uiStore.theme = theme;
    applyThemeToDocument(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  };

  const toggleTheme = () => {
    const next: Theme = uiStore.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return {
    theme: computed(() => uiStore.theme),
    setTheme,
    toggleTheme
  };
};

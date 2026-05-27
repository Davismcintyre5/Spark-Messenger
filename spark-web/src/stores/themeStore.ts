import { create } from 'zustand';
import { Theme } from '@/types/ui';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const THEME_KEY = 'spark_theme';

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY) as Theme;
  if (saved && ['light', 'dark', 'amoled'].includes(saved)) return saved;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'amoled') {
      root.classList.add('dark');
    } else {
      root.classList.add(theme);
    }
    set({ theme });
  },
}));
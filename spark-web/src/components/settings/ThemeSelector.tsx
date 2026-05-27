import React from 'react';
import { Sun, Moon, Smartphone } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { Theme } from '@/types/ui';

const themes: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
  { value: 'amoled', label: 'AMOLED', icon: <Smartphone className="w-5 h-5" /> },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
            theme === t.value
              ? 'border-spark-500 bg-spark-50 dark:bg-spark-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <span className={theme === t.value ? 'text-spark-500' : 'text-gray-400'}>{t.icon}</span>
          <span className={`text-xs font-medium ${theme === t.value ? 'text-spark-600 dark:text-spark-400' : 'text-gray-500'}`}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}
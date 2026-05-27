import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Smartphone, Check } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { Theme } from '@/types/ui';

const themes: Array<{ value: Theme; label: string; description: string; icon: React.ReactNode }> = [
  { value: 'light', label: 'Light', description: 'Clean white interface', icon: <Sun className="w-6 h-6" /> },
  { value: 'dark', label: 'Dark', description: 'Easy on the eyes', icon: <Moon className="w-6 h-6" /> },
  { value: 'amoled', label: 'AMOLED', description: 'Pure black — saves battery', icon: <Smartphone className="w-6 h-6" /> },
];

export default function ThemesPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <header className="h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-semibold text-lg">Themes</h1>
      </header>

      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-400">Choose your preferred appearance</p>

        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              theme === t.value
                ? 'border-spark-500 bg-spark-50 dark:bg-spark-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              theme === t.value ? 'bg-spark-100 dark:bg-spark-900 text-spark-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>
              {t.icon}
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium text-sm">{t.label}</span>
              <p className="text-xs text-gray-400">{t.description}</p>
            </div>
            {theme === t.value && (
              <div className="w-6 h-6 rounded-full bg-spark-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}

        {/* Preview */}
        <div className={`mt-6 p-4 rounded-xl ${theme === 'amoled' ? 'bg-black' : theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} border border-gray-200 dark:border-gray-700`}>
          <p className="text-xs font-medium text-gray-400 uppercase mb-3">Preview</p>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full ${theme === 'light' ? 'bg-spark-100' : 'bg-spark-900/50'} flex items-center justify-center`}>
              <MessageSquare className={`w-5 h-5 ${theme === 'light' ? 'text-spark-500' : 'text-spark-400'}`} />
            </div>
            <div className="flex-1">
              <div className={`h-3 rounded w-24 ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-700'}`} />
              <div className={`h-2 rounded w-32 mt-1.5 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`} />
            <div className={`flex-1 h-2 rounded ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`} />
            <div className={`flex-1 h-2 rounded ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import MessageSquare
import { MessageSquare } from 'lucide-react';
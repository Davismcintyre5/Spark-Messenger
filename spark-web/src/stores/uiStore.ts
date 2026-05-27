import { create } from 'zustand';
import { ToastMessage } from '@/types/ui';

interface UIState {
  sidebarOpen: boolean;
  infoPanelOpen: boolean;
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleInfoPanel: () => void;
  setInfoPanelOpen: (open: boolean) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  infoPanelOpen: false,
  toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleInfoPanel: () => set((s) => ({ infoPanelOpen: !s.infoPanelOpen })),

  setInfoPanelOpen: (open) => set({ infoPanelOpen: open }),

  addToast: (toast) => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
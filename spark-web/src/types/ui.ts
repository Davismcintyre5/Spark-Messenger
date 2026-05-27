export type Theme = 'light' | 'dark' | 'amoled';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  data?: any;
}

export interface FilePreview {
  file: File;
  url: string;
  type: 'image' | 'video' | 'document';
}

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}
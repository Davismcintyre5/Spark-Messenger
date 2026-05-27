export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Spark';
export const HDM_BRAND = import.meta.env.VITE_HDM_BRAND || 'HDM';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
export const PRIMARY_COLOR = import.meta.env.VITE_PRIMARY_COLOR || '#1A73E8';

export const COUNTRY_CODES = [
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
];

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  LOCATION: 'location',
  CONTACT: 'contact',
  STICKER: 'sticker',
  GIF: 'gif',
} as const;

export const CHAT_PATTERNS = {
  MAX_PINNED: 3,
  MAX_GROUP_MEMBERS: 1024,
  MAX_GROUP_ADMINS: 10,
  EDIT_WINDOW_MINUTES: 15,
  DELETE_WINDOW_HOURS: 1,
} as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  KES: 'KSh',
  EUR: '€',
  GBP: '£',
};

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'amoled', label: 'AMOLED', icon: '🖤' },
] as const;
export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:5000',
  ADMIN_URL: import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Spark',
  HDM_BRAND: import.meta.env.VITE_HDM_BRAND || 'HDM',
  PRIMARY_COLOR: import.meta.env.VITE_PRIMARY_COLOR || '#1A73E8',
} as const;
/**
 * API設定
 */

// API基本設定
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
}

// APIエンドポイント
export const API_ENDPOINTS = {
  // 認証（認証担当者が実装）
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // 通知
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/mark-read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    SUBSCRIBE: '/notifications/subscribe',
  },

  // ファイル
  FILES: {
    UPLOAD: '/files/upload',
    GET: (id: string) => `/files/${id}`,
    DELETE: (id: string) => `/files/${id}`,
    VALIDATE: '/files/validate',
  },

  // エクスポート
  EXPORT: {
    CSV: '/export/csv',
    EXCEL: '/export/excel',
    PDF: '/export/pdf',
    STATUS: (jobId: string) => `/export/status/${jobId}`,
    DOWNLOAD: (jobId: string) => `/export/download/${jobId}`,
  },

  // エンジニア
  ENGINEERS: {
    LIST: '/engineers',
    GET: (id: string) => `/engineers/${id}`,
    CREATE: '/engineers',
    UPDATE: (id: string) => `/engineers/${id}`,
    DELETE: (id: string) => `/engineers/${id}`,
    SKILLS: (id: string) => `/engineers/${id}/skills`,
    SEARCH: '/engineers/search',
  },

  // スキルシート
  SKILL_SHEETS: {
    LIST: '/skill-sheets',
    GET: (id: string) => `/skill-sheets/${id}`,
    CREATE: '/skill-sheets',
    UPDATE: (id: string) => `/skill-sheets/${id}`,
    DELETE: (id: string) => `/skill-sheets/${id}`,
    PUBLISH: (id: string) => `/skill-sheets/${id}/publish`,
    DRAFT: (id: string) => `/skill-sheets/${id}/draft`,
  },

  // プロジェクト
  PROJECTS: {
    LIST: '/projects',
    GET: (id: string) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    ASSIGN: (id: string) => `/projects/${id}/assign`,
    UNASSIGN: (id: string) => `/projects/${id}/unassign`,
  },

  // 取引先
  CLIENTS: {
    LIST: '/clients',
    GET: (id: string) => `/clients/${id}`,
    CREATE: '/clients',
    UPDATE: (id: string) => `/clients/${id}`,
    DELETE: (id: string) => `/clients/${id}`,
  },

  // オファー
  OFFERS: {
    LIST: '/offers',
    GET: (id: string) => `/offers/${id}`,
    CREATE: '/offers',
    UPDATE: (id: string) => `/offers/${id}`,
    DELETE: (id: string) => `/offers/${id}`,
    SEND: '/offers/send',
    BATCH_SEND: '/offers/batch-send',
    STATISTICS: '/offers/statistics',
  },

  // アプローチ
  APPROACHES: {
    LIST: '/approaches',
    GET: (id: string) => `/approaches/${id}`,
    CREATE: '/approaches',
    UPDATE: (id: string) => `/approaches/${id}`,
    DELETE: (id: string) => `/approaches/${id}`,
    SEND: '/approaches/send',
    TEMPLATES: '/approaches/templates',
    SCHEDULE: '/approaches/schedule',
  },

  // ダッシュボード
  DASHBOARD: {
    KPI: '/dashboard/kpi',
    STATISTICS: '/dashboard/statistics',
    RECENT_ACTIVITIES: '/dashboard/recent-activities',
    NOTIFICATIONS: '/dashboard/notifications',
  },

  // システム
  SYSTEM: {
    HEALTH: '/system/health',
    METRICS: '/system/metrics',
    LOGS: '/system/logs',
    SETTINGS: '/system/settings',
  },
}

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

// エラーコード
export const ERROR_CODES = {
  // 認証関連
  AUTH_001: '認証エラー',
  AUTH_002: 'トークン期限切れ',
  AUTH_003: '権限不足',
  
  // バリデーション関連
  VAL_001: '入力値エラー',
  VAL_002: '必須項目未入力',
  VAL_003: 'フォーマットエラー',
  
  // ビジネスロジック関連
  BIZ_001: 'ビジネスルール違反',
  BIZ_002: 'データ不整合',
  BIZ_003: '処理対象が存在しません',
  
  // システム関連
  SYS_001: 'システムエラー',
  SYS_002: 'ネットワークエラー',
  SYS_003: 'タイムアウト',
} as const

// Content-Type
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  PDF: 'application/pdf',
  CSV: 'text/csv',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
} as const
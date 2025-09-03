/**
 * API共通型定義
 */

// ページネーションメタ情報
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// APIレスポンスのメタ情報
export interface ApiMeta {
  timestamp: string
  requestId: string
  version: string
  pagination?: PaginationMeta
}

// 成功レスポンス
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: ApiMeta
}

// エラー詳細
export interface ErrorDetail {
  field: string
  message: string
  code?: string
}

// APIエラーレスポンス
export interface ApiError {
  code: string
  message: string
  details?: ErrorDetail[]
  documentation?: string
}

// APIエラータイプのエクスポート（互換性のため）
export type ApiErrorType = ApiError

// リスト取得用のクエリパラメータ
export interface ListQueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, string | number | boolean | string[] | number[] | undefined>
}

// バッチ操作結果
export interface BatchOperationResult<T> {
  success: T[]
  failed: Array<{
    item: T
    error: ApiError
  }>
}

// ファイル情報
export interface FileInfo {
  id: string
  name: string
  size: number
  mimeType: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

// 通知
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: Record<string, unknown>
}

// エクスポートジョブ
export interface ExportJob {
  id: string
  type: 'csv' | 'excel' | 'pdf'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  url?: string
  error?: string
  createdAt: string
  completedAt?: string
}

// WebSocket イベント
export interface WebSocketEvent<T = unknown> {
  event: string
  data: T
  timestamp: string
}

// API設定
export interface ApiConfig {
  baseURL: string
  timeout?: number
  retryCount?: number
  retryDelay?: number
}

// HTTPメソッド
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// リクエスト設定
export interface RequestConfig {
  method: HttpMethod
  url: string
  data?: unknown
  params?: Record<string, string | number | boolean | string[] | number[] | undefined>
  headers?: Record<string, string>
  timeout?: number
  withCredentials?: boolean
  responseType?: 'json' | 'blob' | 'text'
  onUploadProgress?: (progressEvent: ProgressEvent) => void
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
}

// キャッシュ設定
export interface CacheConfig {
  enabled: boolean
  ttl: number // Time to live in seconds
  key?: string
}

// リトライ設定
export interface RetryConfig {
  retries: number
  retryDelay: number
  retryCondition?: (error: unknown) => boolean
}
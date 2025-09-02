/**
 * 共通型定義ファイル
 * プロジェクト全体で使用される共通の型を定義
 */

/**
 * アプリケーションエラーの詳細情報
 */
export interface AppErrorDetails {
  field?: string;
  value?: unknown;
  constraint?: string;
  [key: string]: unknown;
}

/**
 * API応答の基本構造
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

/**
 * APIエラー情報
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  details?: AppErrorDetails | AppErrorDetails[];
  timestamp?: Date | string;
  path?: string;
  method?: string;
}

/**
 * レスポンスメタデータ
 */
export interface ResponseMetadata {
  timestamp: Date | string;
  requestId?: string;
  version?: string;
  [key: string]: unknown;
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * ページネーション付きレスポンス
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

/**
 * ソート条件
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * フィルター条件の基本型
 */
export interface BaseFilterOptions {
  [key: string]: string | number | boolean | Date | undefined | null;
}

/**
 * 検索クエリパラメータ
 */
export interface SearchQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: BaseFilterOptions;
}

/**
 * データベースのタイムスタンプ
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ソフトデリート対応のタイムスタンプ
 */
export interface TimestampsWithDeleted extends Timestamps {
  deletedAt?: Date | null;
}

/**
 * IDを持つエンティティの基本型
 */
export interface BaseEntity extends Timestamps {
  id: number | bigint;
}

/**
 * JSONレスポンス用のシリアライズ済みエンティティ
 */
export interface SerializedEntity extends Timestamps {
  id: string | number;
}

/**
 * バリデーションエラーの詳細
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationErrorDetail[];
}

/**
 * 汎用的な更新データ型
 */
export type UpdateData<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;

/**
 * 汎用的な作成データ型
 */
export type CreateData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

/**
 * Nullable型のヘルパー
 */
export type Nullable<T> = T | null;

/**
 * Optional型のヘルパー
 */
export type Optional<T> = T | undefined;

/**
 * DeepPartial型のヘルパー
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
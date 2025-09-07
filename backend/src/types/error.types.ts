/**
 * エラー処理関連の型定義
 */

import { AppErrorDetails } from './common.types';

/**
 * バリデーションエラーの詳細
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Yupバリデーションエラーの型
 */
export interface YupValidationError extends Error {
  name: 'ValidationError';
  inner?: Array<{
    path: string;
    message: string;
    value?: unknown;
  }>;
}

/**
 * JWT関連のエラー型
 */
export interface JWTError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError' | 'NotBeforeError';
  expiredAt?: Date;
}

/**
 * 認証エラーの型
 */
export interface UnauthorizedError extends Error {
  name: 'UnauthorizedError';
  code?: string;
  status?: number;
}

/**
 * エラーレスポンスの構造
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: Date | string;
    path: string;
    method: string;
    details?: AppErrorDetails | AppErrorDetails[];
    stack?: string;
  };
}

/**
 * 成功レスポンスの構造
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  metadata?: {
    timestamp: Date | string;
    [key: string]: unknown;
  };
}

/**
 * APIレスポンスの統合型
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
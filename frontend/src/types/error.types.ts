/**
 * エラー関連の型定義
 */

import { AxiosError } from 'axios'

/**
 * APIエラーレスポンスの型
 */
export interface ApiErrorResponse {
  message: string
  error?: string
  statusCode?: number
  details?: Array<{
    field: string
    message: string
    code?: string
  }>
  timestamp?: string
  path?: string
}

/**
 * Axiosエラーの型ガード
 */
export function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}

/**
 * 標準Errorオブジェクトの型ガード
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * エラーメッセージの取得
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.message || 
           error.response?.data?.error || 
           error.message || 
           'ネットワークエラーが発生しました'
  }
  
  if (isError(error)) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'エラーが発生しました'
}

/**
 * HTTPステータスコードの取得
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status
  }
  return undefined
}

/**
 * エラー詳細の取得
 */
export function getErrorDetails(error: unknown): ApiErrorResponse['details'] | undefined {
  if (isAxiosError(error)) {
    return error.response?.data?.details
  }
  return undefined
}

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  public readonly statusCode?: number
  public readonly details?: ApiErrorResponse['details']
  
  constructor(message: string, statusCode?: number, details?: ApiErrorResponse['details']) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
  
  static fromUnknown(error: unknown): AppError {
    const message = getErrorMessage(error)
    const statusCode = getErrorStatusCode(error)
    const details = getErrorDetails(error)
    
    return new AppError(message, statusCode, details)
  }
}
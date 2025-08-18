/**
 * エラーハンドリングユーティリティ
 */

import { AxiosError } from 'axios'
import { ApiError, ErrorDetail } from '@/types/api.types'
import { toast } from 'react-hot-toast'
import { ERROR_CODES } from '@/api/config'

/**
 * APIエラーハンドラークラス
 */
export class ApiErrorHandler {
  private static errorCallbacks: Map<string, (error: AxiosError<ApiError>) => void> = new Map()

  /**
   * エラーハンドリング
   */
  static handle(error: AxiosError<ApiError>): void {
    if (!error.response) {
      this.handleNetworkError(error)
      return
    }

    const errorCode = error.response?.data?.code
    
    // カスタムエラーハンドラーが登録されている場合
    const customHandler = this.errorCallbacks.get(errorCode || '')
    if (customHandler) {
      customHandler(error)
      return
    }

    // デフォルトのエラーハンドリング
    switch (errorCode) {
      case 'AUTH_001':
      case 'AUTH_002':
      case 'AUTH_003':
        this.handleAuthError(error)
        break
      case 'VAL_001':
      case 'VAL_002':
      case 'VAL_003':
        this.handleValidationError(error)
        break
      case 'BIZ_001':
      case 'BIZ_002':
      case 'BIZ_003':
        this.handleBusinessError(error)
        break
      case 'SYS_001':
      case 'SYS_002':
      case 'SYS_003':
        this.handleSystemError(error)
        break
      default:
        this.handleGenericError(error)
    }
  }

  /**
   * ネットワークエラー処理
   */
  private static handleNetworkError(error: AxiosError): void {
    console.error('Network error:', error)
    toast.error('ネットワークエラーが発生しました。インターネット接続を確認してください。')
  }

  /**
   * 認証エラー処理
   */
  private static handleAuthError(error: AxiosError<ApiError>): void {
    const message = error.response?.data?.message || ERROR_CODES.AUTH_001
    toast.error(message)
    
    // 認証エラーの場合、ログイン画面へリダイレクト（認証担当者が実装）
    // TODO: 認証担当者が実装
    // window.location.href = '/login'
  }

  /**
   * バリデーションエラー処理
   */
  private static handleValidationError(error: AxiosError<ApiError>): void {
    const details = error.response?.data?.details || []
    
    if (details.length > 0) {
      // フィールドごとのエラーを表示
      details.forEach((detail: ErrorDetail) => {
        const message = `${detail.field}: ${detail.message}`
        toast.error(message)
      })
    } else {
      const message = error.response?.data?.message || ERROR_CODES.VAL_001
      toast.error(message)
    }
  }

  /**
   * ビジネスエラー処理
   */
  private static handleBusinessError(error: AxiosError<ApiError>): void {
    const message = error.response?.data?.message || ERROR_CODES.BIZ_001
    toast.error(message)
  }

  /**
   * システムエラー処理
   */
  private static handleSystemError(error: AxiosError<ApiError>): void {
    const message = error.response?.data?.message || ERROR_CODES.SYS_001
    toast.error(message)
    
    // エラーログを送信（オプション）
    this.logError(error)
  }

  /**
   * 汎用エラー処理
   */
  private static handleGenericError(error: AxiosError<ApiError>): void {
    const message = error.response?.data?.message || 'エラーが発生しました。'
    toast.error(message)
  }

  /**
   * カスタムエラーハンドラーの登録
   */
  static registerHandler(errorCode: string, handler: (error: AxiosError<ApiError>) => void): void {
    this.errorCallbacks.set(errorCode, handler)
  }

  /**
   * カスタムエラーハンドラーの削除
   */
  static unregisterHandler(errorCode: string): void {
    this.errorCallbacks.delete(errorCode)
  }

  /**
   * エラーログの送信
   */
  private static logError(error: AxiosError<ApiError>): void {
    // エラーログをサーバーに送信（実装はオプション）
    console.error('System error logged:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * エラーメッセージの取得
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || error.message || 'エラーが発生しました'
    }
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }

  /**
   * エラーの詳細情報取得
   */
  static getErrorDetails(error: unknown): ErrorDetail[] {
    if (error instanceof AxiosError && error.response?.data?.details) {
      return error.response.data.details
    }
    return []
  }

  /**
   * エラーコードの取得
   */
  static getErrorCode(error: unknown): string | null {
    if (error instanceof AxiosError && error.response?.data?.code) {
      return error.response.data.code
    }
    return null
  }

  /**
   * リトライ可能なエラーかどうかの判定
   */
  static isRetryableError(error: unknown): boolean {
    if (!(error instanceof AxiosError)) {
      return false
    }

    // ネットワークエラーまたは5xx系エラーの場合はリトライ可能
    if (!error.response) {
      return true
    }

    const status = error.response.status
    return status >= 500 && status < 600
  }

  /**
   * 認証エラーかどうかの判定
   */
  static isAuthError(error: unknown): boolean {
    if (!(error instanceof AxiosError)) {
      return false
    }

    const status = error.response?.status
    const code = error.response?.data?.code

    return status === 401 || code?.startsWith('AUTH_')
  }

  /**
   * バリデーションエラーかどうかの判定
   */
  static isValidationError(error: unknown): boolean {
    if (!(error instanceof AxiosError)) {
      return false
    }

    const status = error.response?.status
    const code = error.response?.data?.code

    return status === 422 || code?.startsWith('VAL_')
  }
}

// デフォルトエクスポート
export default ApiErrorHandler
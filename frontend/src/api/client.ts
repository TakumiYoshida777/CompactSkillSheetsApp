/**
 * APIクライアント基盤
 */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { API_CONFIG, HTTP_STATUS } from './config'
import type { ApiResponse, ApiError } from '../types/api.types'
import { toast } from 'react-hot-toast'

// カンパニーID取得（認証担当者が実装予定のため暫定）
const getCompanyId = (): string => {
  // TODO: 認証担当者が実装後、実際のカンパニーID取得ロジックに置き換え
  return localStorage.getItem('companyId') || ''
}

// カスタムAxiosインスタンスの作成
class ApiClient {
  private instance: AxiosInstance
  private requestQueue: Map<string, Promise<unknown>> = new Map()

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  /**
   * インターセプターの設定
   */
  private setupInterceptors(): void {
    // リクエストインターセプター
    this.instance.interceptors.request.use(
      (config) => {
        // カンパニーIDヘッダーの追加
        const companyId = getCompanyId()
        if (companyId) {
          config.headers['X-Company-ID'] = companyId
        }

        // 認証トークンの追加
        // Zustandストアから認証トークンを取得（動的インポートを回避）
        const authState = localStorage.getItem('auth-storage')
        if (authState) {
          try {
            const parsedState = JSON.parse(authState)
            const token = parsedState?.state?.token
            if (token) {
              config.headers['Authorization'] = `Bearer ${token}`
              console.log('[ApiClient] Authorization header set:', config.headers['Authorization'])
            }
          } catch (error) {
            console.error('[ApiClient] Failed to parse auth state:', error)
          }
        }

        // タイムスタンプの追加（キャッシュ回避）
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now(),
          }
        }

        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // レスポンスインターセプター
    this.instance.interceptors.response.use(
      (response) => {
        // 成功レスポンスの処理
        return response
      },
      async (error: AxiosError<ApiError>) => {
        // エラーレスポンスの処理
        return this.handleError(error)
      }
    )
  }

  /**
   * エラーハンドリング
   */
  private async handleError(error: AxiosError<ApiError>): Promise<never> {
    // ネットワークエラー
    if (!error.response) {
      toast.error('ネットワークエラーが発生しました。接続を確認してください。')
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // ステータスコード別の処理
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        // 認証エラー（認証担当者が詳細実装）
        toast.error('認証エラーが発生しました。再度ログインしてください。')
        // ログイン画面へリダイレクトする必要がある
        break

      case HTTP_STATUS.FORBIDDEN:
        toast.error('この操作を実行する権限がありません。')
        break

      case HTTP_STATUS.NOT_FOUND:
        toast.error('リクエストされたリソースが見つかりません。')
        break

      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        // バリデーションエラー
        if (data?.details && Array.isArray(data.details)) {
          data.details.forEach((detail) => {
            toast.error(`${detail.field}: ${detail.message}`)
          })
        } else {
          toast.error(data?.message || '入力内容を確認してください。')
        }
        break

      case HTTP_STATUS.TOO_MANY_REQUESTS:
        toast.error('リクエストが多すぎます。しばらく待ってから再試行してください。')
        break

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        toast.error('サーバーエラーが発生しました。しばらく待ってから再試行してください。')
        break

      default:
        toast.error(data?.message || 'エラーが発生しました。')
    }

    return Promise.reject(error)
  }

  /**
   * リクエストの重複排除
   */
  private dedupeRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    const existing = this.requestQueue.get(key)
    if (existing) {
      return existing as Promise<T>
    }

    const promise = request().finally(() => {
      this.requestQueue.delete(key)
    })

    this.requestQueue.set(key, promise)
    return promise
  }

  /**
   * GETリクエスト
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const key = `GET:${url}:${JSON.stringify(config?.params || {})}`
    return this.dedupeRequest(key, async () => {
      const response = await this.instance.get<ApiResponse<T>>(url, config)
      return response.data
    })
  }

  /**
   * POSTリクエスト
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * PUTリクエスト
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * PATCHリクエスト
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  /**
   * DELETEリクエスト
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  /**
   * ファイルアップロード
   */
  async upload<T>(
    url: string,
    file: File | Blob,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    // 追加データがある場合
    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        const value = additionalData[key]
        if (typeof value === 'string' || value instanceof Blob) {
          formData.append(key, value)
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value))
        }
      })
    }

    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  /**
   * ファイルダウンロード
   */
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  /**
   * バッチリクエスト
   */
  async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(requests.map((request) => request()))
  }

  /**
   * リトライ付きリクエスト
   */
  async withRetry<T>(
    request: () => Promise<T>,
    retries: number = API_CONFIG.RETRY_COUNT,
    delay: number = API_CONFIG.RETRY_DELAY
  ): Promise<T> {
    try {
      return await request()
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.withRetry(request, retries - 1, delay * 2)
      }
      throw error
    }
  }

  /**
   * Axiosインスタンスの取得（カスタム設定が必要な場合）
   */
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// シングルトンインスタンスのエクスポート
export const apiClient = new ApiClient()

// デフォルトエクスポート
export default apiClient
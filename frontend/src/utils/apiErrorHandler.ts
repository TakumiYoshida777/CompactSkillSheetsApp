/**
 * APIエラーハンドリング ユーティリティ
 */

import { AxiosError } from 'axios';

/**
 * APIエラーレスポンスの型定義
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

/**
 * カスタムAPIエラークラス
 */
export class ApiError extends Error {
  public code?: string;
  public statusCode?: number;
  public details?: Record<string, any>;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * エラーメッセージのマッピング
 */
const ERROR_MESSAGES: Record<string, string> = {
  // 認証関連
  'AUTH_INVALID_CREDENTIALS': 'メールアドレスまたはパスワードが正しくありません',
  'AUTH_TOKEN_EXPIRED': 'セッションの有効期限が切れました。再度ログインしてください',
  'AUTH_UNAUTHORIZED': 'この操作を実行する権限がありません',
  
  // バリデーション関連
  'VALIDATION_ERROR': '入力内容に誤りがあります',
  'REQUIRED_FIELD_MISSING': '必須項目が入力されていません',
  'INVALID_FORMAT': '入力形式が正しくありません',
  
  // エンジニア関連
  'ENGINEER_NOT_FOUND': '指定されたエンジニアが見つかりません',
  'ENGINEER_ALREADY_EXISTS': '同じメールアドレスのエンジニアが既に存在します',
  'ENGINEER_STATUS_INVALID': '無効なステータスです',
  
  // スキルシート関連
  'SKILL_SHEET_NOT_FOUND': 'スキルシートが見つかりません',
  'SKILL_SHEET_INCOMPLETE': 'スキルシートが未完成です',
  'SKILL_SHEET_ALREADY_PUBLISHED': 'スキルシートは既に公開されています',
  
  // システムエラー
  'INTERNAL_SERVER_ERROR': 'サーバーエラーが発生しました。しばらく経ってから再度お試しください',
  'SERVICE_UNAVAILABLE': 'サービスが一時的に利用できません',
  'NETWORK_ERROR': 'ネットワークエラーが発生しました',
  'TIMEOUT': 'リクエストがタイムアウトしました',
  
  // デフォルト
  'UNKNOWN_ERROR': '予期しないエラーが発生しました',
};

/**
 * HTTPステータスコードに基づくデフォルトメッセージ
 */
const STATUS_CODE_MESSAGES: Record<number, string> = {
  400: '不正なリクエストです',
  401: '認証が必要です',
  403: 'アクセス権限がありません',
  404: 'リソースが見つかりません',
  409: 'データの競合が発生しました',
  422: '入力データが正しくありません',
  429: 'リクエストが多すぎます。しばらく待ってから再度お試しください',
  500: 'サーバーエラーが発生しました',
  502: 'ゲートウェイエラーが発生しました',
  503: 'サービスが一時的に利用できません',
  504: 'ゲートウェイタイムアウトが発生しました',
};

/**
 * Axiosエラーから読みやすいエラーメッセージを生成
 */
export function parseApiError(error: unknown): ApiError {
  // Axiosエラーの場合
  if (error instanceof AxiosError) {
    const response = error.response;
    const data = response?.data as ApiErrorResponse | undefined;
    
    // ネットワークエラー
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        return new ApiError(ERROR_MESSAGES.TIMEOUT, 'TIMEOUT');
      }
      return new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR');
    }
    
    // APIからのエラーレスポンス
    const code = data?.code || 'UNKNOWN_ERROR';
    const message = data?.message || 
                   ERROR_MESSAGES[code] || 
                   STATUS_CODE_MESSAGES[response.status] || 
                   ERROR_MESSAGES.UNKNOWN_ERROR;
    
    return new ApiError(
      message,
      code,
      response.status,
      data?.details
    );
  }
  
  // 既にApiErrorの場合
  if (error instanceof ApiError) {
    return error;
  }
  
  // その他のエラー
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  // 不明なエラー
  return new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR, 'UNKNOWN_ERROR');
}

/**
 * エラーがリトライ可能かどうかを判定
 */
export function isRetryableError(error: ApiError): boolean {
  // ネットワークエラーや一時的なエラーはリトライ可能
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'];
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  
  return (
    (error.code && retryableCodes.includes(error.code)) ||
    (error.statusCode && retryableStatusCodes.includes(error.statusCode)) ||
    false
  );
}

/**
 * フィールドごとのバリデーションエラーを取得
 */
export function getFieldErrors(error: ApiError): Record<string, string> {
  if (error.code === 'VALIDATION_ERROR' && error.details?.errors) {
    return error.details.errors as Record<string, string>;
  }
  return {};
}

/**
 * エラーメッセージをユーザーに表示する形式に整形
 */
export function formatErrorForDisplay(error: ApiError): {
  title: string;
  description: string;
  actions?: Array<{ label: string; action: () => void }>;
} {
  let title = 'エラーが発生しました';
  let description = error.message;
  const actions: Array<{ label: string; action: () => void }> = [];
  
  // エラーコードに応じてタイトルをカスタマイズ
  if (error.statusCode === 401 || error.code === 'AUTH_TOKEN_EXPIRED') {
    title = '認証エラー';
    actions.push({
      label: 'ログイン画面へ',
      action: () => {
        window.location.href = '/login';
      },
    });
  } else if (error.statusCode === 403) {
    title = 'アクセス拒否';
  } else if (error.statusCode === 404) {
    title = 'ページが見つかりません';
  } else if (error.statusCode && error.statusCode >= 500) {
    title = 'サーバーエラー';
  } else if (error.code === 'VALIDATION_ERROR') {
    title = '入力エラー';
  }
  
  // リトライ可能なエラーの場合
  if (isRetryableError(error)) {
    actions.push({
      label: '再試行',
      action: () => {
        window.location.reload();
      },
    });
  }
  
  return { title, description, actions };
}
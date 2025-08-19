/**
 * フロントエンド用エラークラス
 */

export enum ErrorCode {
  // ネットワークエラー
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  OFFLINE = 'OFFLINE',
  
  // APIエラー
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // クライアントエラー
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // ビジネスロジックエラー
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // 状態エラー
  INVALID_STATE = 'INVALID_STATE',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
}

export interface ErrorDetails {
  field?: string;
  value?: any;
  constraint?: string;
  [key: string]: any;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly details?: ErrorDetails | ErrorDetails[];
  public readonly timestamp: Date;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode?: number,
    details?: ErrorDetails | ErrorDetails[],
    isRetryable = false
  ) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    this.isRetryable = isRetryable;
    
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * ユーザーに表示可能なメッセージを取得
   */
  getUserMessage(): string {
    // 開発環境では詳細メッセージを表示
    if (process.env.NODE_ENV === 'development') {
      return this.message;
    }

    // 本番環境では汎用的なメッセージを表示
    switch (this.code) {
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.TIMEOUT:
        return 'ネットワークエラーが発生しました。接続を確認してください。';
      case ErrorCode.OFFLINE:
        return 'オフラインです。インターネット接続を確認してください。';
      case ErrorCode.UNAUTHORIZED:
        return 'ログインが必要です。';
      case ErrorCode.FORBIDDEN:
        return 'アクセス権限がありません。';
      case ErrorCode.NOT_FOUND:
        return 'ページが見つかりません。';
      case ErrorCode.VALIDATION_ERROR:
      case ErrorCode.INVALID_INPUT:
        return '入力内容に誤りがあります。';
      case ErrorCode.SERVER_ERROR:
        return 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
      default:
        return 'エラーが発生しました。';
    }
  }

  /**
   * エラーをJSON形式で取得
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      isRetryable: this.isRetryable
    };
  }
}

/**
 * エラーファクトリクラス
 */
export class ErrorFactory {
  // ネットワーク関連
  static networkError(message = 'ネットワークエラーが発生しました'): AppError {
    return new AppError(message, ErrorCode.NETWORK_ERROR, undefined, undefined, true);
  }

  static timeout(message = 'タイムアウトしました'): AppError {
    return new AppError(message, ErrorCode.TIMEOUT, undefined, undefined, true);
  }

  static offline(): AppError {
    return new AppError(
      'オフラインです',
      ErrorCode.OFFLINE,
      undefined,
      undefined,
      true
    );
  }

  // API関連
  static fromApiError(error: any): AppError {
    const response = error.response;
    
    if (!response) {
      // ネットワークエラー
      if (error.code === 'ECONNABORTED') {
        return ErrorFactory.timeout();
      }
      return ErrorFactory.networkError();
    }

    const { status, data } = response;
    const message = data?.error?.message || data?.message || error.message;
    const details = data?.error?.details || data?.details;

    switch (status) {
      case 400:
        return new AppError(
          message || '不正なリクエストです',
          ErrorCode.VALIDATION_ERROR,
          400,
          details
        );
      case 401:
        return new AppError(
          message || '認証が必要です',
          ErrorCode.UNAUTHORIZED,
          401
        );
      case 403:
        return new AppError(
          message || 'アクセス権限がありません',
          ErrorCode.FORBIDDEN,
          403
        );
      case 404:
        return new AppError(
          message || 'リソースが見つかりません',
          ErrorCode.NOT_FOUND,
          404
        );
      case 422:
        return new AppError(
          message || 'ビジネスルール違反です',
          ErrorCode.BUSINESS_RULE_VIOLATION,
          422,
          details
        );
      case 429:
        return new AppError(
          message || 'リクエスト数が制限を超えています',
          ErrorCode.QUOTA_EXCEEDED,
          429,
          details,
          true
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new AppError(
          message || 'サーバーエラーが発生しました',
          ErrorCode.SERVER_ERROR,
          status,
          details,
          true
        );
      default:
        return new AppError(
          message || 'エラーが発生しました',
          ErrorCode.API_ERROR,
          status,
          details
        );
    }
  }

  // バリデーション関連
  static validationError(
    message = '入力内容に誤りがあります',
    details?: ErrorDetails[]
  ): AppError {
    return new AppError(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }

  static invalidInput(field: string, message?: string): AppError {
    return new AppError(
      message || `${field}の入力値が不正です`,
      ErrorCode.INVALID_INPUT,
      undefined,
      { field }
    );
  }

  static missingField(field: string): AppError {
    return new AppError(
      `${field}は必須項目です`,
      ErrorCode.MISSING_REQUIRED_FIELD,
      undefined,
      { field }
    );
  }

  static invalidFormat(field: string, format: string): AppError {
    return new AppError(
      `${field}の形式が正しくありません`,
      ErrorCode.INVALID_FORMAT,
      undefined,
      { field, format }
    );
  }

  // 状態エラー
  static invalidState(message: string): AppError {
    return new AppError(message, ErrorCode.INVALID_STATE);
  }

  static concurrentModification(): AppError {
    return new AppError(
      'データが他のユーザーによって変更されました',
      ErrorCode.CONCURRENT_MODIFICATION,
      409,
      undefined,
      true
    );
  }
}
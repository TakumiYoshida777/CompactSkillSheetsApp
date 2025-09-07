/**
 * アプリケーション共通エラークラス
 */

import { AppErrorDetails } from '../types/common.types';

export enum ErrorCode {
  // 認証・認可エラー (401, 403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  
  // バリデーションエラー (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // リソースエラー (404, 409)
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // サーバーエラー (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // ビジネスロジックエラー (422)
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // レート制限 (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: AppErrorDetails | AppErrorDetails[];
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    isOperational = true,
    details?: AppErrorDetails | AppErrorDetails[]
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();
    
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * クライアントに送信可能なエラー情報を取得
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        ...(process.env.NODE_ENV === 'development' && {
          details: this.details,
          stack: this.stack
        })
      }
    };
  }
}

// 便利なファクトリメソッド
export class ErrorFactory {
  // 400 Bad Request
  static badRequest(message = '不正なリクエストです', details?: AppErrorDetails | AppErrorDetails[]): AppError {
    return new AppError(message, 400, ErrorCode.INVALID_INPUT, true, details);
  }

  static validationError(message = '入力値が不正です', details?: AppErrorDetails | AppErrorDetails[]): AppError {
    return new AppError(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }

  // 401 Unauthorized
  static unauthorized(message = '認証が必要です'): AppError {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
  }

  static tokenExpired(message = 'トークンの有効期限が切れています'): AppError {
    return new AppError(message, 401, ErrorCode.TOKEN_EXPIRED);
  }

  static tokenInvalid(message = '無効なトークンです'): AppError {
    return new AppError(message, 401, ErrorCode.TOKEN_INVALID);
  }

  // 403 Forbidden
  static forbidden(message = 'アクセス権限がありません'): AppError {
    return new AppError(message, 403, ErrorCode.FORBIDDEN);
  }

  // 404 Not Found
  static notFound(resource = 'リソース', id?: string): AppError {
    const message = id 
      ? `${resource} (ID: ${id}) が見つかりません`
      : `${resource}が見つかりません`;
    return new AppError(message, 404, ErrorCode.NOT_FOUND);
  }

  // 409 Conflict
  static conflict(message = 'リソースが既に存在します', details?: AppErrorDetails | AppErrorDetails[]): AppError {
    return new AppError(message, 409, ErrorCode.CONFLICT, true, details);
  }

  static alreadyExists(resource = 'リソース', details?: AppErrorDetails | AppErrorDetails[]): AppError {
    return new AppError(
      `${resource}は既に存在します`,
      409,
      ErrorCode.ALREADY_EXISTS,
      true,
      details
    );
  }

  // 422 Unprocessable Entity
  static businessRuleViolation(message: string, details?: AppErrorDetails | AppErrorDetails[]): AppError {
    return new AppError(
      message,
      422,
      ErrorCode.BUSINESS_RULE_VIOLATION,
      true,
      details
    );
  }

  static invalidStateTransition(
    from: string,
    to: string,
    resource = 'リソース'
  ): AppError {
    return new AppError(
      `${resource}を${from}から${to}に変更することはできません`,
      422,
      ErrorCode.INVALID_STATE_TRANSITION,
      true,
      { from, to }
    );
  }

  // 429 Too Many Requests
  static rateLimitExceeded(retryAfter?: number): AppError {
    const details = retryAfter ? { retryAfter } : undefined;
    return new AppError(
      'リクエスト数が制限を超えています。しばらく待ってから再試行してください',
      429,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      true,
      details
    );
  }

  // 500 Internal Server Error
  static internal(
    message = 'サーバーエラーが発生しました',
    details?: AppErrorDetails | AppErrorDetails[]
  ): AppError {
    return new AppError(
      message,
      500,
      ErrorCode.INTERNAL_ERROR,
      false,
      details
    );
  }

  static database(message = 'データベースエラーが発生しました', error?: Error | unknown): AppError {
    return new AppError(
      message,
      500,
      ErrorCode.DATABASE_ERROR,
      false,
      error
    );
  }

  static externalService(
    service: string,
    error?: Error | unknown
  ): AppError {
    return new AppError(
      `外部サービス(${service})との通信に失敗しました`,
      500,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      false,
      error
    );
  }
}
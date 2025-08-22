/**
 * カスタムエラークラス
 */

/**
 * バリデーションエラー
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends Error {
  constructor(message: string = '認証が必要です') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * 認可エラー
 */
export class AuthorizationError extends Error {
  constructor(message: string = '権限がありません') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * リソース未検出エラー
 */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource}が見つかりません`);
    this.name = 'NotFoundError';
  }
}

/**
 * 競合エラー
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * レート制限エラー
 */
export class RateLimitError extends Error {
  constructor(message: string = 'リクエスト数が制限を超えました') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * ビジネスロジックエラー
 */
export class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}
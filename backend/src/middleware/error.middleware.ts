import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.util';
import { config } from '../config/environment';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// カスタムエラークラス
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(422, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '認証が必要です') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'アクセス権限がありません') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'リソース') {
    super(404, 'NOT_FOUND', `${resource}が見つかりません`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'リソースが既に存在します') {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

/**
 * グローバルエラーハンドラー
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // ログ出力（開発環境のみ詳細表示）
  if (config.env === 'development') {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }
  
  // AppErrorの場合
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      ApiResponse.error(err.code, err.message, err.details)
    );
    return;
  }
  
  // Prismaエラーの場合
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        res.status(409).json(
          ApiResponse.error('DUPLICATE_ENTRY', 'データが既に存在します', {
            field: err.meta?.target
          })
        );
        return;
      case 'P2025': // Record not found
        res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'データが見つかりません')
        );
        return;
      case 'P2003': // Foreign key constraint violation
        res.status(400).json(
          ApiResponse.error('FOREIGN_KEY_ERROR', '関連データが存在しません')
        );
        return;
      default:
        res.status(500).json(
          ApiResponse.error('DATABASE_ERROR', 'データベースエラーが発生しました')
        );
        return;
    }
  }
  
  // バリデーションエラー（express-validator等）
  if (err.name === 'ValidationError' || err.type === 'validation') {
    res.status(422).json(
      ApiResponse.error('VALIDATION_ERROR', 'バリデーションエラー', err.errors || err.details)
    );
    return;
  }
  
  // JWT関連エラー
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(
      ApiResponse.error('INVALID_TOKEN', 'トークンが無効です')
    );
    return;
  }
  
  if (err.name === 'TokenExpiredError') {
    res.status(401).json(
      ApiResponse.error('TOKEN_EXPIRED', 'トークンの有効期限が切れています')
    );
    return;
  }
  
  // SyntaxError（JSONパースエラー等）
  if (err instanceof SyntaxError) {
    res.status(400).json(
      ApiResponse.error('BAD_REQUEST', 'リクエストの形式が不正です')
    );
    return;
  }
  
  // デフォルトエラー
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'サーバーエラーが発生しました';
  
  res.status(statusCode).json(
    ApiResponse.error('INTERNAL_ERROR', message)
  );
};

/**
 * 404エラーハンドラー
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(
    ApiResponse.error('NOT_FOUND', `エンドポイントが見つかりません: ${req.method} ${req.path}`)
  );
};

/**
 * 非同期エラーハンドラーラッパー
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
/**
 * グローバルエラーハンドラー
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/AppError';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';
import { AppErrorDetails } from '../types/common.types';
import { YupValidationError, ErrorResponse } from '../types/error.types';

/**
 * エラーログの記録
 */
const logError = (error: Error | AppError, req: Request) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId,
    timestamp: new Date()
  };

  if (error instanceof AppError) {
    if (error.isOperational) {
      logger.warn('Operational error occurred', {
        ...errorInfo,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      });
    } else {
      logger.error('System error occurred', {
        ...errorInfo,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      });
    }
  } else {
    logger.error('Unexpected error occurred', errorInfo);
  }
};

/**
 * Prismaエラーの変換
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'フィールド';
      return new AppError(
        `${field}は既に使用されています`,
        409,
        ErrorCode.ALREADY_EXISTS,
        true,
        { field }
      );
    
    case 'P2025': // Record not found
      return new AppError(
        'レコードが見つかりません',
        404,
        ErrorCode.NOT_FOUND,
        true
      );
    
    case 'P2003': // Foreign key constraint violation
      return new AppError(
        '関連するレコードが存在しません',
        400,
        ErrorCode.VALIDATION_ERROR,
        true
      );
    
    case 'P2014': // Relation violation
      return new AppError(
        'リレーション制約違反です',
        400,
        ErrorCode.VALIDATION_ERROR,
        true
      );
    
    default:
      return new AppError(
        'データベースエラーが発生しました',
        500,
        ErrorCode.DATABASE_ERROR,
        false,
        { prismaCode: error.code }
      );
  }
};

/**
 * バリデーションエラーの変換
 */
const handleValidationError = (error: Error | YupValidationError): AppError => {
  if (error.name === 'ValidationError' && 'inner' in error) {
    const details: AppErrorDetails[] = error.inner?.map((err) => ({
      field: err.path,
      message: err.message,
      value: err.value
    })) || [];

    return new AppError(
      '入力値にエラーがあります',
      400,
      ErrorCode.VALIDATION_ERROR,
      true,
      details
    );
  }

  return new AppError(
    error.message || 'バリデーションエラーです',
    400,
    ErrorCode.VALIDATION_ERROR,
    true
  );
};

/**
 * エラーレスポンスの送信
 */
const sendErrorResponse = (
  error: AppError,
  req: Request,
  res: Response
) => {
  const { statusCode, code, message, timestamp, details } = error;

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      timestamp: timestamp.toISOString(),
      path: req.path,
      method: req.method
    }
  };

  // 開発環境では詳細情報を含める
  if (process.env.NODE_ENV === 'development') {
    response.error.details = details;
    response.error.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 非同期エラーハンドラーラッパー
 */
export const asyncHandler = <T = void>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * グローバルエラーハンドラーミドルウェア
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ログ記録
  logError(error, req);

  // レスポンス済みの場合は何もしない
  if (res.headersSent) {
    return next(error);
  }

  let appError: AppError;

  // エラータイプの判定と変換
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else if (error.name === 'ValidationError') {
    appError = handleValidationError(error);
  } else if (error.name === 'UnauthorizedError') {
    appError = new AppError(
      '認証が必要です',
      401,
      ErrorCode.UNAUTHORIZED,
      true
    );
  } else if (error.name === 'JsonWebTokenError') {
    appError = new AppError(
      'トークンが無効です',
      401,
      ErrorCode.TOKEN_INVALID,
      true
    );
  } else if (error.name === 'TokenExpiredError') {
    appError = new AppError(
      'トークンの有効期限が切れています',
      401,
      ErrorCode.TOKEN_EXPIRED,
      true
    );
  } else {
    // 予期しないエラー
    appError = new AppError(
      process.env.NODE_ENV === 'production'
        ? 'サーバーエラーが発生しました'
        : error.message || 'Unknown error occurred',
      500,
      ErrorCode.INTERNAL_ERROR,
      false,
      { originalError: error.message }
    );
  }

  // エラーレスポンスの送信
  sendErrorResponse(appError, req, res);
};

/**
 * 404エラーハンドラー
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `エンドポイント ${req.method} ${req.path} が見つかりません`,
    404,
    ErrorCode.NOT_FOUND,
    true,
    { method: req.method, path: req.path }
  );
  
  next(error);
};
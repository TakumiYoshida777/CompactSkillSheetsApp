import { errorLog } from '../utils/logger';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (res: Response, error: any) => {
  errorLog('エラー詳細:', error);

  // Prismaエラーの処理
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: '既に存在するデータです',
          code: error.code
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'データが見つかりません',
          code: error.code
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          message: '関連データの整合性エラーです',
          code: error.code
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'データベースエラーが発生しました',
          code: error.code
        });
    }
  }

  // バリデーションエラー
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: '入力データが不正です'
    });
  }

  // カスタムエラー
  if (error.statusCode && error.message) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }

  // その他のエラー
  return res.status(500).json({
    success: false,
    message: 'サーバーエラーが発生しました'
  });
};
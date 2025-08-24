/**
 * レート制限ミドルウェア
 * ブルートフォース攻撃やDoS攻撃を防ぐ
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * 基本的なレート制限（全API）
 */
export const generalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 最大100リクエスト
  message: 'リクエスト数が多すぎます。しばらく待ってから再試行してください。',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'リクエスト数が多すぎます。しばらく待ってから再試行してください。'
    });
  }
});

/**
 * ログイン用の厳しいレート制限
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 最大5回の試行
  message: 'ログイン試行回数が多すぎます。15分後に再試行してください。',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功したリクエストはカウントしない
  handler: (req: Request, res: Response) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}, Email: ${req.body.email}`);
    res.status(429).json({
      success: false,
      error: 'ログイン試行回数が多すぎます。15分後に再試行してください。',
      retryAfter: 900 // 秒単位
    });
  }
});

/**
 * パスワードリセット用のレート制限
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 3, // 最大3回の試行
  message: 'パスワードリセットの試行回数が多すぎます。1時間後に再試行してください。',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'パスワードリセットの試行回数が多すぎます。1時間後に再試行してください。',
      retryAfter: 3600
    });
  }
});

/**
 * API作成用のレート制限（重い処理）
 */
export const createRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 10, // 最大10回の作成
  message: '作成リクエストが多すぎます。しばらく待ってから再試行してください。',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Create rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: '作成リクエストが多すぎます。しばらく待ってから再試行してください。'
    });
  }
});

/**
 * ファイルアップロード用のレート制限
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 20, // 最大20ファイル
  message: 'アップロード数が制限を超えました。1時間後に再試行してください。',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'アップロード数が制限を超えました。1時間後に再試行してください。'
    });
  }
});

/**
 * 検索API用のレート制限
 */
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 30, // 最大30回の検索
  message: '検索リクエストが多すぎます。しばらく待ってから再試行してください。',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 特定のIPアドレスやユーザーに対するカスタムレート制限
 */
export const customRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 900000,
    max: options.max || 100,
    keyGenerator: options.keyGenerator || ((req: Request) => req.ip),
    standardHeaders: true,
    legacyHeaders: false
  });
};
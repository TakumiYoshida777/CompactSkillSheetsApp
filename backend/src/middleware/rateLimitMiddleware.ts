import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// Redis接続設定
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redisClient.on('error', (err) => {
  logger.error('Redis接続エラー:', err);
});

redisClient.on('connect', () => {
  logger.info('Redisに接続しました');
});

/**
 * 基本的なレート制限設定
 */
const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}) => {
  const useRedis = process.env.REDIS_HOST !== undefined;
  
  const config: any = {
    windowMs: options.windowMs || 15 * 60 * 1000, // 15分
    max: options.max || 100, // 最大リクエスト数
    message: options.message || 'リクエスト数が多すぎます。しばらく待ってから再試行してください。',
    standardHeaders: options.standardHeaders !== false,
    legacyHeaders: options.legacyHeaders !== false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    keyGenerator: options.keyGenerator || ((req: Request) => {
      return req.user?.id ? `user_${req.user.id}` : req.ip;
    }),
    handler: (req: Request, res: Response) => {
      logger.warn('レート制限に達しました:', {
        ip: req.ip,
        user: req.user?.id,
        path: req.path,
        method: req.method
      });
      
      res.status(429).json({
        error: options.message || 'リクエスト数が多すぎます。しばらく待ってから再試行してください。',
        retryAfter: res.getHeader('Retry-After')
      });
    }
  };

  // Redis利用可能な場合はRedisStoreを使用
  if (useRedis) {
    config.store = new RedisStore({
      client: redisClient,
      prefix: 'rl:',
    });
  }

  return rateLimit(config);
};

/**
 * API全体のレート制限
 */
export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分
  max: 1000, // 15分間で最大1000リクエスト
  message: 'APIリクエスト数が制限を超えました。15分後に再試行してください。'
});

/**
 * 認証エンドポイント用の厳しいレート制限
 */
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 15分間で最大5回の試行
  message: 'ログイン試行回数が制限を超えました。15分後に再試行してください。',
  skipSuccessfulRequests: true, // 成功したリクエストはカウントしない
  keyGenerator: (req: Request) => {
    // IPアドレスとメールアドレスの組み合わせでキーを生成
    const email = req.body?.email || 'unknown';
    return `auth_${req.ip}_${email}`;
  }
});

/**
 * パスワードリセット用のレート制限
 */
export const passwordResetRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 3, // 1時間で最大3回
  message: 'パスワードリセット要求が多すぎます。1時間後に再試行してください。',
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    return `reset_${email}`;
  }
});

/**
 * 取引先企業作成用のレート制限
 */
export const partnerCreationRateLimit = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24時間
  max: 10, // 24時間で最大10社
  message: '取引先企業の登録数が制限を超えました。24時間後に再試行してください。',
  keyGenerator: (req: Request) => {
    return req.user?.companyId ? `partner_create_${req.user.companyId}` : req.ip;
  }
});

/**
 * エンジニア検索用のレート制限
 */
export const searchRateLimit = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1分
  max: 30, // 1分間で最大30回の検索
  message: '検索リクエストが多すぎます。1分後に再試行してください。',
  keyGenerator: (req: Request) => {
    return req.user?.id ? `search_${req.user.id}` : req.ip;
  }
});

/**
 * ファイルダウンロード用のレート制限
 */
export const downloadRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 50, // 1時間で最大50回のダウンロード
  message: 'ダウンロード数が制限を超えました。1時間後に再試行してください。',
  keyGenerator: (req: Request) => {
    return req.user?.id ? `download_${req.user.id}` : req.ip;
  }
});

/**
 * メール送信用のレート制限
 */
export const emailRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 10, // 1時間で最大10通
  message: 'メール送信数が制限を超えました。1時間後に再試行してください。',
  keyGenerator: (req: Request) => {
    return req.user?.id ? `email_${req.user.id}` : req.ip;
  }
});

/**
 * 動的レート制限（ユーザーの権限に応じて制限を調整）
 */
export const dynamicRateLimit = (req: Request, res: Response, next: Function) => {
  // 管理者は制限を緩和
  if (req.user?.role === 'ADMIN') {
    return createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 5000, // 管理者は5000リクエスト/15分
    })(req, res, next);
  }
  
  // プレミアムユーザーは制限を緩和
  if (req.user?.isPremium) {
    return createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 2000, // プレミアムユーザーは2000リクエスト/15分
    })(req, res, next);
  }
  
  // 通常ユーザー
  return generalRateLimit(req, res, next);
};

/**
 * レート制限情報を取得
 */
export async function getRateLimitInfo(key: string): Promise<{
  remaining: number;
  reset: Date;
  total: number;
} | null> {
  try {
    const data = await redisClient.get(`rl:${key}`);
    if (!data) {
      return null;
    }
    
    const parsed = JSON.parse(data);
    return {
      remaining: parsed.remaining,
      reset: new Date(parsed.resetTime),
      total: parsed.total
    };
  } catch (error) {
    logger.error('レート制限情報取得エラー:', error);
    return null;
  }
}

/**
 * 特定のキーのレート制限をリセット
 */
export async function resetRateLimit(key: string): Promise<boolean> {
  try {
    await redisClient.del(`rl:${key}`);
    logger.info(`レート制限リセット: ${key}`);
    return true;
  } catch (error) {
    logger.error('レート制限リセットエラー:', error);
    return false;
  }
}

/**
 * IPアドレスをブロック
 */
export async function blockIP(ip: string, duration: number = 3600): Promise<boolean> {
  try {
    await redisClient.setex(`blocked:${ip}`, duration, '1');
    logger.warn(`IPアドレスをブロック: ${ip} (${duration}秒)`);
    return true;
  } catch (error) {
    logger.error('IPブロックエラー:', error);
    return false;
  }
}

/**
 * IPアドレスがブロックされているか確認
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  try {
    const blocked = await redisClient.get(`blocked:${ip}`);
    return blocked === '1';
  } catch (error) {
    logger.error('IPブロック確認エラー:', error);
    return false;
  }
}

/**
 * IPブロックミドルウェア
 */
export const ipBlockMiddleware = async (req: Request, res: Response, next: Function) => {
  const blocked = await isIPBlocked(req.ip);
  if (blocked) {
    logger.warn(`ブロックされたIPからのアクセス: ${req.ip}`);
    return res.status(403).json({
      error: 'アクセスが拒否されました。'
    });
  }
  next();
};

/**
 * カスタムレート制限ミドルウェア（複雑な条件）
 */
export const customRateLimit = (options: {
  points: number; // 消費ポイント数
  duration: number; // ウィンドウ期間（秒）
  blockDuration?: number; // ブロック期間（秒）
}) => {
  return async (req: Request, res: Response, next: Function) => {
    const key = req.user?.id ? `custom_${req.user.id}` : `custom_${req.ip}`;
    
    try {
      const current = await redisClient.get(key);
      const points = current ? parseInt(current) : 0;
      
      if (points >= options.points) {
        const ttl = await redisClient.ttl(key);
        
        res.setHeader('X-RateLimit-Limit', options.points.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());
        
        return res.status(429).json({
          error: 'レート制限に達しました。',
          retryAfter: ttl
        });
      }
      
      await redisClient.multi()
        .incr(key)
        .expire(key, options.duration)
        .exec();
      
      res.setHeader('X-RateLimit-Limit', options.points.toString());
      res.setHeader('X-RateLimit-Remaining', (options.points - points - 1).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + options.duration * 1000).toISOString());
      
      next();
    } catch (error) {
      logger.error('カスタムレート制限エラー:', error);
      next(); // エラーの場合は通過させる
    }
  };
};
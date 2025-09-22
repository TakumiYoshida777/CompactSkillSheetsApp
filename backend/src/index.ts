import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import logger from './config/logger';
import { errorLog } from './utils/logger';
import { morganMiddleware, responseTimeMiddleware } from './middleware/httpLogger';
import { generalRateLimiter, loginRateLimiter } from './middleware/rateLimiter';
import { debugRequestLogger, errorTracker } from './middleware/debug.middleware';
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import engineerAuthRoutes from './routes/engineer/authRoutes';
import engineerDashboardRoutes from './routes/engineer/dashboardRoutes';
import engineerSkillSheetRoutes from './routes/engineer/skillSheetRoutes';
import clientRoutes from './routes/clientRoutes';
import businessPartnerRoutes from './routes/businessPartnerRoutes';
import offerRoutes from './routes/client/offerRoutes';

// ルートのインポート
import analyticsRoutes from './routes/analytics.routes';
import notificationsRoutes from './routes/notifications.routes';
import permissionRoutes from './routes/permissionRoutes';

// v1 APIルート
import v1Routes from './routes/v1';

// 環境変数の読み込み
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// ミドルウェアの設定
app.use(helmet());

// CORS設定（環境変数を優先、複数オリジンに対応）
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];
logger.info('CORS Origins:', { corsOrigins });

app.use(cors({
  origin: (origin, callback) => {
    // originがundefinedの場合（同一オリジンからのリクエスト）は許可
    if (!origin) return callback(null, true);
    
    // 許可されたオリジンのリストに含まれているかチェック
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-ID']
}));
app.use(compression());

// HTTPログミドルウェアの追加
app.use(responseTimeMiddleware);
app.use(morganMiddleware);

// デバッグログミドルウェア（開発環境のみ）
if (process.env.NODE_ENV === 'development') {
  app.use(debugRequestLogger);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// BigIntを文字列としてシリアライズする設定（JSONでBigIntを安全に扱う）
app.set('json replacer', (_key: string, value: any) => 
  typeof value === 'bigint' ? value.toString() : value
);

// ヘルスチェックエンドポイント（レート制限なし）
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// レート制限を適用（全体）
app.use(generalRateLimiter);

// ログインエンドポイントには厳しいレート制限を適用
app.use('/api/auth/login', loginRateLimiter);
app.use('/api/client/auth/login', loginRateLimiter);
app.use('/api/engineer/auth/login', loginRateLimiter);

// APIルートの登録
app.use('/api/auth', authRoutes);
app.use('/api/auth', permissionRoutes);  // 権限管理APIルート
app.use('/api/companies', companyRoutes);
app.use('/api/engineer/auth', engineerAuthRoutes);
app.use('/api/engineers', engineerDashboardRoutes);
app.use('/api/engineer/skill-sheet', engineerSkillSheetRoutes);
app.use('/api', clientRoutes);  // 取引先企業関連のルート
app.use('/api/business-partners', businessPartnerRoutes);  // 取引先企業管理ルート
app.use('/api/client', offerRoutes);  // オファー関連のルート

// APIルートのプレースホルダー
app.get('/api/v1', (_req, res) => {
  res.json({ 
    message: 'SkillSheetsMgmtAPp API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/auth',
      engineer: {
        auth: '/api/engineer/auth',
        dashboard: '/api/engineers',
        skillSheet: '/api/engineer/skill-sheet'
      },
      test: '/api/v1/test'
    }
  });
});

// テスト用エンドポイント
app.post('/api/v1/test', (req, res) => {
  const { message } = req.body;
  res.json({
    success: true,
    echo: message || 'No message provided',
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      contentType: req.headers['content-type']
    }
  });
});

// APIルートの登録
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);

// v1 API統合ルート
app.use('/api/v1', v1Routes);

// エラートラッキングミドルウェア
app.use(errorTracker);

// 統一エラーハンドリングミドルウェア（最後に配置）
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 構造化ログ出力
  logger.error('[ERROR]', {
    status,
    message: err.message,
    code: err.code,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    meta: err.meta
  });

  // レスポンス構築
  const payload: any = {
    error: {
      message: status >= 500 && !isDevelopment 
        ? '予期しないエラーが発生しました' 
        : err.message || 'エラーが発生しました',
      code: err?.code || 'INTERNAL_ERROR',
      status
    }
  };

  // 開発環境では詳細情報を含める
  if (isDevelopment) {
    payload.error.stack = err.stack;
    payload.error.meta = err.meta || undefined;
    payload.error.details = err.details || undefined;
  }

  res.status(status).json(payload);
});

// サーバー起動
const server = app.listen(PORT, () => {
  logger.info(`🚀 サーバーが起動しました`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    url: `http://localhost:${PORT}`
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM シグナルを受信しました: HTTPサーバーを終了します');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('HTTPサーバーが終了しました');
  });
});

// エラーハンドリング
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  errorLog('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  errorLog('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import logger from './config/logger';
import { morganMiddleware, responseTimeMiddleware } from './middleware/httpLogger';
import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import engineerAuthRoutes from './routes/engineer/authRoutes';
import engineerDashboardRoutes from './routes/engineer/dashboardRoutes';
import engineerSkillSheetRoutes from './routes/engineer/skillSheetRoutes';
import clientRoutes from './routes/clientRoutes';

// ルートのインポート
import analyticsRoutes from './routes/analytics.routes';
import notificationsRoutes from './routes/notifications.routes';

// 環境変数の読み込み
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// ミドルウェアの設定
app.use(helmet());

// CORS設定（環境変数を優先）
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
logger.info('CORS Origin:', { corsOrigin });

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());

// HTTPログミドルウェアの追加
app.use(responseTimeMiddleware);
app.use(morganMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// APIルートの登録
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/engineer/auth', engineerAuthRoutes);
app.use('/api/engineers', engineerDashboardRoutes);
app.use('/api/engineer/skill-sheet', engineerSkillSheetRoutes);
app.use('/api', clientRoutes);  // 取引先企業関連のルート

// APIルートのプレースホルダー
app.get('/api/v1', (req, res) => {
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

// エラーハンドリングミドルウェア
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('エラーが発生しました', {
    error: err.stack || err.message,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query
  });
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
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

export default app;
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 環境変数の読み込み
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// ミドルウェアの設定
app.use(helmet());

// CORS設定（環境変数を優先）
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
console.log('CORS Origin:', corsOrigin);

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// APIルートのプレースホルダー
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'SkillSheetsMgmtAPp API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
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

// エラーハンドリングミドルウェア
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// サーバー起動
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server closed');
  });
});

export default app;
import dotenv from 'dotenv';
import path from 'path';

// 環境に応じた.envファイルを読み込み
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const config = {
  // 基本設定
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  
  // API設定
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    version: 'v1',
    prefix: '/api/v1'
  },
  
  // CORS設定
  cors: {
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-ID', 'X-Request-ID']
  },
  
  // データベース設定
  database: {
    url: process.env.DATABASE_URL || 'postgresql://skillsheet:password@localhost:5432/skillsheet_dev',
    pool: {
      min: 2,
      max: 10
    }
  },
  
  // Redis設定
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: 3600 // デフォルトTTL（秒）
  },
  
  // JWT設定
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: '30d'
  },
  
  // Elasticsearch設定
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
  },
  
  // ログ設定
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  },
  
  // ページネーション設定
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  },
  
  // セキュリティ設定
  security: {
    bcryptRounds: 10,
    rateLimitWindow: 15 * 60 * 1000, // 15分
    rateLimitMax: 100 // 最大リクエスト数
  },
  
  // メール送信設定
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@example.com'
  },
  
  // フロントエンドURL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

// 設定の検証
export function validateConfig(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`必須の環境変数が設定されていません: ${missingVars.join(', ')}`);
  }
}
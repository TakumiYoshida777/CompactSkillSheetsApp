import morgan from 'morgan';
import logger, { logHttpRequest } from '../config/logger';
import { Request, Response } from 'express';

// Morganのトークンをカスタマイズ
morgan.token('body', (req: Request) => {
  return JSON.stringify(req.body);
});

morgan.token('query', (req: Request) => {
  return JSON.stringify(req.query);
});

// レスポンスタイムを記録するミドルウェア
export const responseTimeMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  
  // レスポンスが終了したときの処理
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logHttpRequest(req, res, responseTime);
  });
  
  next();
};

// Morgan用のカスタムフォーマット
const morganFormat = ':method :url :status :response-time ms - :res[content-length]';

// Morgan用のストリーム設定（Winstonと連携）
const stream = {
  write: (message: string) => {
    // Morganからのメッセージをログに記録（改行を削除）
    logger.info(message.trim());
  }
};

// Morganミドルウェアの設定
export const morganMiddleware = morgan(morganFormat, {
  stream,
  skip: (req: Request, res: Response) => {
    // ヘルスチェックエンドポイントはログをスキップ（オプション）
    return req.url === '/health';
  }
});

export default morganMiddleware;
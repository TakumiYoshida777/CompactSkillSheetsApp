import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * デバッグ用リクエストロギングミドルウェア
 * すべてのリクエストの詳細情報をログに記録
 */
export const debugRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // リクエスト情報をログ
  logger.debug('受信リクエスト', {
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent'],
      authorization: req.headers.authorization ? '***' : undefined
    },
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // レスポンス完了時のログ
  const originalSend = res.send;
  res.send = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    logger.debug('レスポンス送信', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      dataSize: data ? JSON.stringify(data).length : 0,
      timestamp: new Date().toISOString()
    });
    
    // エラーレスポンスの場合は詳細をログ
    if (res.statusCode >= 400) {
      logger.error('エラーレスポンス詳細', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        requestBody: req.body,
        responseData: data,
        responseTime: `${responseTime}ms`
      });
    }
    
    return originalSend.call(this, data);
  };

  next();
};

/**
 * エラー詳細トラッキングミドルウェア
 * エラー発生時の詳細コンテキストを記録
 */
export const errorTracker = (err: any, req: Request, res: Response, next: NextFunction) => {
  // エラー発生時の詳細コンテキスト
  logger.error('エラートラッキング', {
    error: {
      message: err.message,
      name: err.name,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode || err.status,
      details: err.details,
      meta: err.meta
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers,
      ip: req.ip
    },
    session: {
      companyId: req.companyId,
      userId: req.userId
    },
    timestamp: new Date().toISOString()
  });

  next(err);
};
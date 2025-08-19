import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Logsディレクトリのパス
const logDir = path.join(__dirname, '../../Logs');

// Logsディレクトリが存在しない場合は作成
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// カスタムフォーマット
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // HTTPリクエスト情報がある場合は追加
    if (metadata.req) {
      msg += ` | Method: ${metadata.req.method}`;
      msg += ` | URL: ${metadata.req.url}`;
      msg += ` | IP: ${metadata.req.ip}`;
      msg += ` | Status: ${metadata.status || 'N/A'}`;
      msg += ` | ResponseTime: ${metadata.responseTime || 'N/A'}ms`;
    }
    
    // その他のメタデータがある場合
    const otherMetadata = { ...metadata };
    delete otherMetadata.req;
    delete otherMetadata.status;
    delete otherMetadata.responseTime;
    
    if (Object.keys(otherMetadata).length > 0) {
      msg += ` | Data: ${JSON.stringify(otherMetadata)}`;
    }
    
    return msg;
  })
);

// HTTPリクエスト用のトランスポート（日付別）
const httpTransport = new DailyRotateFile({
  filename: path.join(logDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'info',
  format: customFormat
});

// エラー専用のトランスポート（日付別）
const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: customFormat
});

// 全てのログを記録するトランスポート（日付別）
const combinedTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: customFormat
});

// Winstonロガーの作成
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    httpTransport,
    errorTransport,
    combinedTransport
  ]
});

// 開発環境ではコンソールにも出力
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// HTTPリクエストロギング用のヘルパー関数
export const logHttpRequest = (
  req: any,
  res: any,
  responseTime: number
) => {
  const logData = {
    req: {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
      query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined
    },
    status: res.statusCode,
    responseTime: responseTime
  };

  // ステータスコードに応じてログレベルを決定
  if (res.statusCode >= 500) {
    logger.error('HTTPリクエスト処理エラー', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('HTTPリクエスト処理警告', logData);
  } else {
    logger.info('HTTPリクエスト処理完了', logData);
  }
};

export default logger;
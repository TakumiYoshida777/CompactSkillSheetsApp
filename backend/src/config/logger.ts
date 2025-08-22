import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Logsディレクトリのパス
const logDir = path.join(__dirname, '../../Logs');

// Logsディレクトリが存在しない場合は作成
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// タイムスタンプ生成
const timestamp = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss'
});

// カスタムフォーマット
const customFormat = winston.format.combine(
  timestamp,
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // HTTPリクエスト情報がある場合は追加
    if (metadata.req && typeof metadata.req === 'object') {
      const reqMeta = metadata.req as any;
      msg += ` | Method: ${reqMeta.method || 'N/A'}`;
      msg += ` | URL: ${reqMeta.url || 'N/A'}`;
      msg += ` | IP: ${reqMeta.ip || 'N/A'}`;
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

// 現在の日付を取得する関数
const getDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// HTTPリクエスト用のトランスポート
const httpTransport = new winston.transports.File({
  filename: path.join(logDir, `http-${getDateString()}.log`),
  level: 'info',
  format: customFormat
});

// エラー専用のトランスポート
const errorTransport = new winston.transports.File({
  filename: path.join(logDir, `error-${getDateString()}.log`),
  level: 'error',
  format: customFormat
});

// 全てのログを記録するトランスポート
const combinedTransport = new winston.transports.File({
  filename: path.join(logDir, `combined-${getDateString()}.log`),
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
/**
 * ロガーユーティリティ
 */

import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// ログレベルの定義
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 環境に応じたログレベル
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  // 本番環境ではwarnレベル以上、開発環境ではdebugレベル
  return isDevelopment ? 'debug' : 'warn';
};

// ログフォーマット
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// フォーマット定義
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// トランスポート定義
const transports = [
  // コンソール出力
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
  // エラーログファイル
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),
  // 全ログファイル
  new winston.transports.File({
    filename: path.join(logDir, 'all.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),
];

// ロガーのインスタンス作成
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// ストリームを提供（Morgan用）
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// 環境に応じてconsole.logを制御するラッパー関数
export const debugLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' '));
  }
};

export const infoLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    logger.info(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' '));
  }
};

export const errorLog = (...args: any[]) => {
  // エラーログは本番環境でも出力（ただしwinstonのログレベル設定に従う）
  logger.error(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' '));
};

export const warnLog = (...args: any[]) => {
  // 警告ログは本番環境でも出力（ただしwinstonのログレベル設定に従う）
  logger.warn(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' '));
};

export default logger;
/**
 * フロントエンド用ロガーユーティリティ
 * 本番環境でのconsole.log出力を制御
 */

// 環境判定
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// ログレベル
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// 現在のログレベル（環境変数で制御可能）
const currentLogLevel = isProduction ? LogLevel.ERROR : LogLevel.DEBUG;

/**
 * デバッグログ（開発環境でのみ出力）
 */
export const debugLog = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.log(...args);
  }
};

/**
 * 情報ログ（開発環境でのみ出力）
 */
export const infoLog = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.INFO) {
    console.info(...args);
  }
};

/**
 * 警告ログ（本番環境でも出力）
 */
export const warnLog = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(...args);
  }
};

/**
 * エラーログ（本番環境でも出力）
 */
export const errorLog = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(...args);
  }
};

/**
 * グループログ（開発環境でのみ出力）
 */
export const groupLog = (label: string, callback: () => void): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.group(label);
    callback();
    console.groupEnd();
  } else {
    // 本番環境でもコールバックは実行（副作用がある場合のため）
    callback();
  }
};

/**
 * テーブルログ（開発環境でのみ出力）
 */
export const tableLog = (data: any): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.table(data);
  }
};

/**
 * タイマーログ（開発環境でのみ出力）
 */
export const timeLog = (label: string): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.time(label);
  }
};

export const timeEndLog = (label: string): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.timeEnd(label);
  }
};

/**
 * アサーションログ（開発環境でのみ出力）
 */
export const assertLog = (condition: boolean, ...args: any[]): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.assert(condition, ...args);
  }
};

// デフォルトエクスポート
const logger = {
  debug: debugLog,
  info: infoLog,
  warn: warnLog,
  error: errorLog,
  group: groupLog,
  table: tableLog,
  time: timeLog,
  timeEnd: timeEndLog,
  assert: assertLog
};

export default logger;
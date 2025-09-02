/**
 * Sentry エラー監視設定
 * 本番環境でのエラー追跡とパフォーマンス監視
 */

import { errorLog } from '../utils/logger';
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

/**
 * Sentry初期化設定
 */
export const initSentry = () => {
  // 本番環境でのみSentryを有効化
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true, // プライバシー保護のためテキストをマスク
          blockAllMedia: true, // メディアコンテンツをブロック
        }),
      ],
      // パフォーマンス監視
      tracesSampleRate: 0.1, // 10%のトランザクションをサンプリング
      // セッションリプレイ
      replaysSessionSampleRate: 0.1, // 10%のセッションをキャプチャ
      replaysOnErrorSampleRate: 1.0, // エラー時は100%キャプチャ
      
      // エラーフィルタリング
      beforeSend(event, hint) {
        // 開発環境のエラーを除外
        if (window.location.hostname === 'localhost') {
          return null
        }
        
        // 特定のエラーを除外
        const error = hint.originalException
        if (error && error instanceof Error) {
          // ネットワークエラーは除外（別途処理）
          if (error.message?.includes('Network') || error.message?.includes('fetch')) {
            return null
          }
          // キャンセルされたリクエストは除外
          if (error.message?.includes('aborted') || error.message?.includes('cancelled')) {
            return null
          }
        }
        
        return event
      },
    })
  }
}

/**
 * ユーザー情報をSentryに設定
 */
export const setSentryUser = (user: { id: string; email: string; role?: string } | null) => {
  if (process.env.NODE_ENV === 'production') {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        role: user.role,
      })
    } else {
      Sentry.setUser(null)
    }
  }
}

/**
 * カスタムエラーログ送信
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  errorLog('Error:', error, context)
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    })
  }
}

/**
 * カスタムメッセージログ送信
 */
export const logMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
  const sentryLevel = level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'info'
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, sentryLevel)
    if (context) {
      Sentry.setContext('additional_info', context)
    }
  }
}

/**
 * パフォーマンス計測
 */
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const transaction = Sentry.startTransaction({ name })
  Sentry.getCurrentHub().getScope()?.setSpan(transaction)
  
  const execute = async () => {
    try {
      await fn()
    } finally {
      transaction.finish()
    }
  }
  
  return execute()
}

/**
 * ブレッドクラムの追加
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    })
  }
}
/**
 * エラーハンドリングフック
 */

import { errorLog, groupLog } from '../utils/logger';
import React, { useCallback } from 'react';
import { message, notification, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AppError, ErrorCode, ErrorFactory } from '../errors/AppError';
import useAuthStore from '../stores/authStore';

interface ErrorHandlerOptions {
  showNotification?: boolean;
  redirectOnUnauthorized?: boolean;
  retryCallback?: () => Promise<void>;
  silent?: boolean;
}

export const useErrorHandler = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  /**
   * エラーログをコンソールに出力
   */
  const logError = useCallback((error: Error | AppError, context?: string) => {
    if (process.env.NODE_ENV === 'development') {
      groupLog(`🔴 Error${context ? ` in ${context}` : ''}`, () => {errorLog('Message:', error.message);
      
      if (error instanceof AppError) {
        errorLog('Code:', error.code);
        errorLog('Status:', error.statusCode);
        errorLog('Details:', error.details);
        errorLog('Timestamp:', error.timestamp);
      }
      
      errorLog('Stack:', error.stack);
      });
    }
  }, []);

  /**
   * ユーザーへのエラー通知
   */
  const notifyError = useCallback((error: AppError, options?: ErrorHandlerOptions) => {
    const userMessage = error.getUserMessage();

    if (options?.silent) {
      return;
    }

    if (options?.showNotification) {
      // 通知形式で表示
      notification.error({
        message: 'エラー',
        description: userMessage,
        duration: 5,
        placement: 'topRight',
        ...(error.isRetryable && options.retryCallback ? {
          btn: React.createElement(Button, {
            type: "primary",
            size: "small",
            onClick: async () => {
              notification.close('error-notification');
              await options.retryCallback?.();
            }
          }, '再試行'),
          key: 'error-notification'
        } : {})
      });
    } else {
      // メッセージ形式で表示
      message.error(userMessage);
    }
  }, []);

  /**
   * 認証エラーの処理
   */
  const handleAuthError = useCallback((error: AppError) => {
    logout();
    navigate('login', {
      state: { 
        from: window.location.pathname,
        message: error.getUserMessage()
      }
    });
  }, [logout, navigate]);

  /**
   * メインのエラーハンドラー
   */
  const handleError = useCallback((
    error: unknown,
    options?: ErrorHandlerOptions
  ): AppError => {
    let appError: AppError;

    // エラーの変換
    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = ErrorFactory.fromApiError(error);
    } else if (typeof error === 'string') {
      appError = new AppError(error, ErrorCode.API_ERROR);
    } else {
      appError = new AppError(
        'Unknown error occurred',
        ErrorCode.API_ERROR,
        undefined,
        { originalError: error }
      );
    }

    // ログ出力
    logError(appError);

    // 認証エラーの特別処理
    if (appError.code === ErrorCode.UNAUTHORIZED && options?.redirectOnUnauthorized !== false) {
      handleAuthError(appError);
      return appError;
    }

    // ユーザーへの通知
    notifyError(appError, options);

    return appError;
  }, [logError, notifyError, handleAuthError]);

  /**
   * Promise エラーハンドラー
   */
  const handleAsyncError = useCallback(async <T,>(
    promise: Promise<T>,
    options?: ErrorHandlerOptions
  ): Promise<T | undefined> => {
    try {
      return await promise;
    } catch (error) {
      handleError(error, options);
      return undefined;
    }
  }, [handleError]);

  /**
   * フォームバリデーションエラーの処理
   */
  const handleValidationError = useCallback((
    errors: Record<string, string[]>,
    options?: ErrorHandlerOptions
  ) => {
    const details = Object.entries(errors).map(([field, messages]) => ({
      field,
      message: messages.join(', ')
    }));

    const error = new AppError(
      '入力内容に誤りがあります',
      ErrorCode.VALIDATION_ERROR,
      400,
      details
    );

    handleError(error, { ...options, showNotification: false });
    
    // フィールドごとのエラーメッセージ表示
    Object.entries(errors).forEach(([field, messages]) => {
      message.error(`${field}: ${messages.join(', ')}`);
    });
  }, [handleError]);

  /**
   * ネットワークエラーのチェック
   */
  const checkNetworkError = useCallback((error: unknown): boolean => {
    if (error instanceof AppError) {
      return [
        ErrorCode.NETWORK_ERROR,
        ErrorCode.TIMEOUT,
        ErrorCode.OFFLINE
      ].includes(error.code);
    }
    return false;
  }, []);

  return {
    handleError,
    handleAsyncError,
    handleValidationError,
    checkNetworkError,
    logError
  };
};

/**
 * エラーハンドリング用の高階関数
 */
export const withErrorHandler = <T extends (...args: unknown[]) => Promise<any>>(
  fn: T,
  options?: ErrorHandlerOptions
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      const { handleError } = useErrorHandler();
      handleError(error, options);
      return undefined;
    }
  };
};
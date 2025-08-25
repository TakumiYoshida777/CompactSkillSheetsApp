import { message, notification } from 'antd';
import { AxiosError } from 'axios';

// エラーレスポンスの型定義
interface APIErrorResponse {
  success: boolean;
  message: string;
  code?: string;
  details?: any;
}

// エラーレベルの定義
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// エラー処理クラス
export class ErrorHandler {
  // APIエラーハンドリング
  static handleAPIError(error: AxiosError<APIErrorResponse>) {
    console.error('APIエラー:', error);

    // ネットワークエラー
    if (!error.response) {
      notification.error({
        message: 'ネットワークエラー',
        description: 'サーバーとの通信に失敗しました。インターネット接続を確認してください。',
        duration: 5
      });
      return;
    }

    const status = error.response.status;
    const errorData = error.response.data;

    switch (status) {
      case 400:
        // バリデーションエラー
        message.error(errorData?.message || '入力内容に誤りがあります');
        break;

      case 401:
        // 認証エラー
        notification.warning({
          message: '認証エラー',
          description: 'ログインし直してください',
          duration: 5
        });
        // ログイン画面へリダイレクト
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        break;

      case 403:
        // 権限エラー
        notification.error({
          message: '権限エラー',
          description: errorData?.message || 'この操作を実行する権限がありません',
          duration: 5
        });
        break;

      case 404:
        // リソースが見つからない
        message.error(errorData?.message || 'データが見つかりません');
        break;

      case 409:
        // 競合エラー
        notification.warning({
          message: 'データ競合',
          description: errorData?.message || '既に存在するデータです',
          duration: 5
        });
        break;

      case 429:
        // レート制限
        notification.warning({
          message: 'アクセス制限',
          description: 'アクセスが多すぎます。しばらく待ってから再度お試しください。',
          duration: 10
        });
        break;

      case 500:
      case 502:
      case 503:
        // サーバーエラー
        notification.error({
          message: 'サーバーエラー',
          description: 'サーバーでエラーが発生しました。しばらく待ってから再度お試しください。',
          duration: 10
        });
        break;

      default:
        // その他のエラー
        notification.error({
          message: 'エラー',
          description: errorData?.message || '予期しないエラーが発生しました',
          duration: 5
        });
    }
  }

  // 一般的なエラーハンドリング
  static handleError(error: Error | unknown, level: ErrorLevel = ErrorLevel.ERROR) {
    console.error('エラー:', error);

    const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました';

    switch (level) {
      case ErrorLevel.INFO:
        message.info(errorMessage);
        break;
      case ErrorLevel.WARNING:
        message.warning(errorMessage);
        break;
      case ErrorLevel.ERROR:
        message.error(errorMessage);
        break;
      case ErrorLevel.CRITICAL:
        notification.error({
          message: '重大なエラー',
          description: errorMessage,
          duration: 0 // 手動で閉じるまで表示
        });
        break;
    }
  }

  // フォームバリデーションエラーハンドリング
  static handleValidationError(errors: Record<string, string[]>) {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');

    notification.error({
      message: '入力エラー',
      description: errorMessages,
      duration: 5
    });
  }

  // 成功メッセージ表示
  static showSuccess(message: string, description?: string) {
    if (description) {
      notification.success({
        message,
        description,
        duration: 3
      });
    } else {
      message.success(message);
    }
  }

  // 情報メッセージ表示
  static showInfo(msg: string, description?: string) {
    if (description) {
      notification.info({
        message: msg,
        description,
        duration: 4
      });
    } else {
      message.info(msg);
    }
  }

  // 警告メッセージ表示
  static showWarning(msg: string, description?: string) {
    if (description) {
      notification.warning({
        message: msg,
        description,
        duration: 4
      });
    } else {
      message.warning(msg);
    }
  }

  // エラーログ送信（将来的な実装用）
  static async logError(error: Error, context?: any) {
    try {
      // エラーログをサーバーに送信
      const errorLog = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.log('エラーログ:', errorLog);
      // Sentryにエラーログを送信
      if (process.env.NODE_ENV === 'production') {
        import('./sentry').then(({ logError }) => {
          logError(new Error(errorLog.message), errorLog)
        }).catch(err => {
          console.error('Sentry import error:', err);
        })
      }
    } catch (logError) {
      console.error('エラーログ送信失敗:', logError);
    }
  }
}

// グローバルエラーハンドラー設定
export const setupGlobalErrorHandler = () => {
  // 未処理のPromiseエラーをキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未処理のPromiseエラー:', event.reason);
    ErrorHandler.handleError(event.reason);
    event.preventDefault();
  });

  // 一般的なJavaScriptエラーをキャッチ
  window.addEventListener('error', (event) => {
    console.error('JavaScriptエラー:', event.error);
    ErrorHandler.handleError(event.error, ErrorLevel.CRITICAL);
    event.preventDefault();
  });
};

// エクスポート
export default ErrorHandler;
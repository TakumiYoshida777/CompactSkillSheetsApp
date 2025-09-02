import React, { Component, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Result, Button, Space } from 'antd';
import { 
  ReloadOutlined, 
  WifiOutlined, 
  ExclamationCircleOutlined,
  HomeOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getHomePath, getLoginPath } from '../../utils/navigation';
import { useAuthStore } from '../../stores/authStore';
import { errorLog } from '../../utils/logger';

interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * エラーフォールバックコンポーネント（React Router対応版）
 * エラーの種類に応じて適切なメッセージを表示
 */
const ErrorFallbackWithNavigation: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const handleNavigateHome = () => {
    const homePath = getHomePath(user?.userType);
    navigate(homePath);
  };
  
  const handleNavigateLogin = () => {
    const loginPath = getLoginPath(window.location.pathname);
    navigate(loginPath);
  };

  // ネットワークエラーかどうかを判定
  const isNetworkError = !navigator.onLine || error.message.includes('Network') || error.message.includes('fetch');
  
  // 権限エラーかどうかを判定
  const isPermissionError = error.message.includes('403') || error.message.includes('Forbidden');
  
  // 認証エラーかどうかを判定
  const isAuthError = error.message.includes('401') || error.message.includes('Unauthorized');

  if (isNetworkError) {
    return (
      <Result
        icon={<WifiOutlined />}
        status="error"
        title="ネットワークエラー"
        subTitle="インターネット接続を確認してください。接続が回復したら再試行してください。"
        extra={
          <Space>
            <Button type="primary" icon={<ReloadOutlined />} onClick={resetErrorBoundary}>
              再試行
            </Button>
            <Button icon={<HomeOutlined />} onClick={handleNavigateHome}>
              ホームへ戻る
            </Button>
          </Space>
        }
      />
    );
  }

  if (isPermissionError) {
    return (
      <Result
        status="403"
        title="アクセス権限がありません"
        subTitle="このページを表示する権限がありません。管理者にお問い合わせください。"
        extra={
          <Space>
            <Button type="primary" icon={<HomeOutlined />} onClick={handleNavigateHome}>
              ホームへ戻る
            </Button>
          </Space>
        }
      />
    );
  }

  if (isAuthError) {
    return (
      <Result
        status="403"
        title="認証が必要です"
        subTitle="セッションの有効期限が切れました。再度ログインしてください。"
        extra={
          <Button type="primary" onClick={handleNavigateLogin}>
            ログインページへ
          </Button>
        }
      />
    );
  }

  // その他のエラー
  return (
    <Result
      icon={<ExclamationCircleOutlined />}
      status="error"
      title="エラーが発生しました"
      subTitle={
        <div>
          <p>予期しないエラーが発生しました。問題が続く場合は、管理者にお問い合わせください。</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: 16, textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer' }}>エラー詳細</summary>
              <pre style={{ 
                background: '#f0f0f0', 
                padding: 12, 
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 200,
                marginTop: 8
              }}>
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </div>
      }
      extra={
        <Space>
          <Button type="primary" icon={<ReloadOutlined />} onClick={resetErrorBoundary}>
            再試行
          </Button>
          <Button icon={<HomeOutlined />} onClick={handleNavigateHome}>
            ホームへ戻る
          </Button>
        </Space>
      }
    />
  );
};

/**
 * エラーフォールバックコンポーネント（フォールバック版）
 * React Routerが使用できない場合のフォールバック
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  // ネットワークエラーかどうかを判定
  const isNetworkError = !navigator.onLine || error.message.includes('Network') || error.message.includes('fetch');
  
  // 権限エラーかどうかを判定
  const isPermissionError = error.message.includes('403') || error.message.includes('Forbidden');
  
  // 認証エラーかどうかを判定
  const isAuthError = error.message.includes('401') || error.message.includes('Unauthorized');

  if (isNetworkError) {
    return (
      <Result
        icon={<WifiOutlined />}
        status="error"
        title="ネットワークエラー"
        subTitle="インターネット接続を確認してください。接続が回復したら再試行してください。"
        extra={
          <Space>
            <Button type="primary" icon={<ReloadOutlined />} onClick={resetErrorBoundary}>
              再試行
            </Button>
            <Button icon={<HomeOutlined />} onClick={handleNavigateHome}>
              ホームへ戻る
            </Button>
          </Space>
        }
      />
    );
  }

  if (isPermissionError) {
    return (
      <Result
        status="403"
        title="アクセス権限がありません"
        subTitle="このページを表示する権限がありません。管理者にお問い合わせください。"
        extra={
          <Space>
            <Button type="primary" icon={<HomeOutlined />} onClick={handleNavigateHome}>
              ホームへ戻る
            </Button>
          </Space>
        }
      />
    );
  }

  if (isAuthError) {
    return (
      <Result
        status="403"
        title="認証が必要です"
        subTitle="セッションの有効期限が切れました。再度ログインしてください。"
        extra={
          <Button type="primary" onClick={handleNavigateLogin}>
            ログインページへ
          </Button>
        }
      />
    );
  }

  // その他のエラー
  return (
    <Result
      icon={<ExclamationCircleOutlined />}
      status="error"
      title="エラーが発生しました"
      subTitle={
        <div>
          <p>予期しないエラーが発生しました。問題が続く場合は、管理者にお問い合わせください。</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: 16, textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer' }}>エラー詳細</summary>
              <pre style={{ 
                background: '#f0f0f0', 
                padding: 12, 
                borderRadius: 4,
                overflow: 'auto',
                maxHeight: 200,
                marginTop: 8
              }}>
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </div>
      }
      extra={
        <Space>
          <Button type="primary" icon={<ReloadOutlined />} onClick={resetErrorBoundary}>
            再試行
          </Button>
          <Button icon={<HomeOutlined />} onClick={handleNavigateHome}>
            ホームへ戻る
          </Button>
        </Space>
      }
    />
  );
};

/**
 * クラスベースのエラーバウンダリー
 */
class ErrorBoundaryClass extends Component<
  { children: ReactNode; fallback?: React.ComponentType<ErrorFallbackProps> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログをサーバーに送信（本番環境の場合）
    if (process.env.NODE_ENV === 'production') {
      // Sentryにエラーを送信
      import('@/utils/sentry').then(({ logError }) => {
        logError(error, { errorInfo })
      })
    }
    errorLog('Error caught by boundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // React Routerが利用可能かチェック
      const FallbackComponent = this.props.fallback || ErrorFallbackWithNavigation;
      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Query用エラーバウンダリー
 * TanStack Queryのエラーをリセット可能
 */
export const QueryErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundaryClass
          fallback={({ error, resetErrorBoundary }) => (
            <ErrorFallbackWithNavigation
              error={error}
              resetErrorBoundary={() => {
                resetErrorBoundary();
                reset(); // TanStack Queryのエラー状態もリセット
              }}
            />
          )}
        >
          {children}
        </ErrorBoundaryClass>
      )}
    </QueryErrorResetBoundary>
  );
};

/**
 * 汎用エラーバウンダリー（Query以外用）
 */
export const ErrorBoundary: React.FC<{ 
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}> = ({ children, fallback }) => {
  return <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>;
};

export default QueryErrorBoundary;
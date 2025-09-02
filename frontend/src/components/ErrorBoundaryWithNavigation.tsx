import { errorLog } from '../utils/logger';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Result, Button, Space } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getHomePath } from '../utils/navigation';
import { useAuthStore } from '../stores/authStore';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Function component wrapper to use hooks
const ErrorBoundaryContent = ({ error, onReset }: { error?: Error; onReset: () => void }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const handleNavigateHome = () => {
    const homePath = getHomePath(user?.userType);
    navigate(homePath);
  };

  const handleReload = () => {
    onReset();
    // ページ全体のリロードではなく、stateをリセットして再レンダリング
    // 必要に応じて、現在のパスに再度ナビゲート
    navigate(0); // React Router v6の方法でページをリロード
  };

  return (
    <Result
      status="500"
      title="エラーが発生しました"
      subTitle="申し訳ございません。予期しないエラーが発生しました。"
      extra={
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleReload}
          >
            再試行
          </Button>
          <Button 
            icon={<HomeOutlined />}
            onClick={handleNavigateHome}
          >
            ホームへ戻る
          </Button>
        </Space>
      }
    />
  );
};

class ErrorBoundaryWithNavigation extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorLog('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryContent 
          error={this.state.error} 
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWithNavigation;
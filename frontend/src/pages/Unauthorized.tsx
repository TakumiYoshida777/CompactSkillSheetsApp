import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuthStore } from '../stores/authStore';

/**
 * アクセス権限がない場合のページ
 */
const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogin = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
    }}>
      <Result
        status="403"
        title="403"
        subTitle="申し訳ございません。このページにアクセスする権限がありません。"
        extra={
          <div>
            <Button type="primary" onClick={handleGoHome}>
              ホームに戻る
            </Button>
            {!isAuthenticated && (
              <Button onClick={handleLogin} style={{ marginLeft: 8 }}>
                ログイン
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
};

export default Unauthorized;
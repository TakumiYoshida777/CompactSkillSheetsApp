import { debugLog } from '../utils/logger';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { getUserTypeFromToken } from '../utils/jwtHelper';

/**
 * アクセス権限がない場合のページ
 */
const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, isClientUser, user, token } = useAuthStore();

  const handleGoHome = () => {
    debugLog('[Unauthorized] User:', user);
    debugLog('[Unauthorized] UserType:', user?.userType);
    debugLog('[Unauthorized] Token:', token ? 'Present' : 'Missing');
    
    // トークンから直接userTypeを取得（最も信頼できる方法）
    const userTypeFromToken = token ? getUserTypeFromToken(token) : null;
    debugLog('[Unauthorized] UserType from token:', userTypeFromToken);
    debugLog('[Unauthorized] Roles:', user?.roles);
    debugLog('[Unauthorized] isClientUser():', isClientUser());
    
    // 1. まずトークンから判定（最も信頼できる）
    if (userTypeFromToken === 'client') {
      debugLog('[Unauthorized] Redirecting to client dashboard (token-based)');
      navigate('client/offer-board');
      return;
    }
    
    // 2. 次にuserオブジェクトから判定
    if (user?.userType === 'client') {
      debugLog('[Unauthorized] Redirecting to client dashboard (user-based)');
      navigate('client/offer-board');
      return;
    }
    
    // 3. 認証済みのSES企業ユーザーの場合
    if (isAuthenticated && user && userTypeFromToken !== 'client') {
      debugLog('[Unauthorized] Redirecting to SES dashboard');
      navigate('dashboard');
      return;
    }
    
    // 4. 未認証またはユーザータイプ不明の場合は安全にログインページへ
    debugLog('[Unauthorized] Redirecting to login (fallback)');
    navigate('login');
  };

  const handleLogin = () => {
    logout();
    // ユーザータイプに応じて適切なログインページへ
    if (user?.userType === 'client') {
      navigate('client/login');
    } else {
      navigate('login');
    }
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
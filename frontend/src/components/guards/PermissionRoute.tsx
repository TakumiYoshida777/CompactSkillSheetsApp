import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { getRoutePermissions } from '../../config/routePermissions';

interface PermissionRouteProps {
  children: React.ReactNode;
  path?: string;  // 明示的にパスを指定する場合
}

/**
 * 権限ベースのルート保護コンポーネント
 * routePermissions.tsの設定に基づいて自動的に権限をチェック
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({ children, path }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { hasPermission } = usePermissionCheck();
  const location = useLocation();
  
  // チェック対象のパスを決定
  const targetPath = path || location.pathname;

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ルートに必要な権限を取得
  const requiredPermissions = getRoutePermissions(targetPath);
  
  // 権限チェック
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(perm => 
      hasPermission(perm.resource, perm.action, perm.scope)
    );
    
    if (!hasAllPermissions) {
      
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '24px',
        }}>
          <h1 style={{ fontSize: '48px', margin: 0, color: '#f5222d' }}>403</h1>
          <h2 style={{ fontSize: '24px', margin: '16px 0', color: '#666' }}>
            アクセス権限がありません
          </h2>
          <p style={{ fontSize: '16px', margin: '8px 0', color: '#999' }}>
            このページにアクセスする権限がありません。
          </p>
          <p style={{ fontSize: '14px', margin: '8px 0', color: '#999' }}>
            必要な権限: {requiredPermissions.map(p => `${p.resource}:${p.action}`).join(', ')}
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default PermissionRoute;
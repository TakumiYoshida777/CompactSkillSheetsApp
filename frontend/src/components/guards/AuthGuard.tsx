import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRoles?: string[];
  requirePermissions?: Array<{ resource: string; action: string }>;
  redirectTo?: string;
}

/**
 * 認証とアクセス制御を行うガードコンポーネント
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireRoles = [],
  requirePermissions = [],
  redirectTo = '/login',
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user,
    checkAuth,
    hasRole,
    hasPermission,
  } = useAuthStore();
  
  const location = useLocation();

  useEffect(() => {
    // 初回マウント時に認証状態をチェック
    if (requireAuth && !isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [requireAuth, isAuthenticated, isLoading, checkAuth]);

  // ローディング中
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <Spin size="large" tip="認証情報を確認中..." />
      </div>
    );
  }

  // 認証が必要な場合
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // ロールのチェック
  if (requireRoles.length > 0 && user) {
    const hasRequiredRole = requireRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ from: location }} 
          replace 
        />
      );
    }
  }

  // 権限のチェック
  if (requirePermissions.length > 0 && user) {
    const hasRequiredPermission = requirePermissions.every(
      perm => hasPermission(perm.resource, perm.action)
    );
    if (!hasRequiredPermission) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ from: location }} 
          replace 
        />
      );
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore, useIsAuthenticated, useStoreHydrated } from '../../stores/authStore';

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
  redirectTo = 'login',
}) => {
  const hydrated = useStoreHydrated();
  const isAuthenticated = useIsAuthenticated();
  const { 
    status,
    user,
    token,
    checkAuth,
    hasRole,
    hasPermission,
  } = useAuthStore();
  
  const location = useLocation();

  useEffect(() => {
    // ハイドレーション完了後のみcheckAuthを実行
    if (!hydrated) {
      console.log('[AuthGuard] Waiting for hydration...');
      return;
    }
    
    console.log('[AuthGuard] Hydrated - Status:', status, 'isAuthenticated:', isAuthenticated, 'Token:', !!token);
    
    // トークンが存在し、まだ認証チェックが済んでいない場合
    if (requireAuth && token && status === 'idle') {
      console.log('[AuthGuard] Checking auth status...');
      checkAuth();
    }
  }, [hydrated, requireAuth, token, status, checkAuth]);

  // ハイドレーション待機中
  if (!hydrated) {
    console.log('[AuthGuard] Not hydrated yet, showing spinner');
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

  // 認証チェック中
  if (status === 'checking') {
    console.log('[AuthGuard] Checking authentication, showing spinner');
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

  // 認証が必要な場合
  if (requireAuth && !isAuthenticated) {
    console.log('[AuthGuard] Not authenticated, redirecting to:', redirectTo);
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
    console.log('AuthGuard - Required roles:', requireRoles);
    console.log('AuthGuard - User roles:', user.roles);
    console.log('AuthGuard - User type:', user.userType);
    
    const hasRequiredRole = requireRoles.some(role => hasRole(role));
    console.log('AuthGuard - Has required role:', hasRequiredRole);
    
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
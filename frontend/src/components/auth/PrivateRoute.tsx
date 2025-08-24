import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // @deprecated Use requiredPermissions instead
  requiredPermissions?: Array<{ resource: string; action: string; scope?: string }>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRoles, requiredPermissions }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { hasPermission } = usePermissionCheck();

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
    return <Navigate to="/login" replace />;
  }

  // 権限ベースのチェック（新しい方法）
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.every(perm => 
      hasPermission(perm.resource, perm.action, perm.scope)
    );
    
    if (!hasRequiredPermission) {
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
        </div>
      );
    }
  }

  // ロールベースのチェック（後方互換性のため残す）
  if (requiredRoles && user) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
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
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
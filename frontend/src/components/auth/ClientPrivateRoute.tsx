import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import useClientAuthStore from '../../stores/clientAuthStore';

interface ClientPrivateRouteProps {
  children: React.ReactNode;
  requiredPermission?: 'FULL_ACCESS' | 'WAITING_ONLY' | 'SELECTED_ONLY';
}

const ClientPrivateRoute: React.FC<ClientPrivateRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user, checkAuth } = useClientAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // 認証されていない場合は取引先企業ログインページへリダイレクト
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  // 権限チェック
  if (requiredPermission && user) {
    const hasPermission = 
      user.permissionType === 'FULL_ACCESS' || 
      user.permissionType === requiredPermission;
    
    if (!hasPermission) {
      return <Navigate to="/client/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ClientPrivateRoute;
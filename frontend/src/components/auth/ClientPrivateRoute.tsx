import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useClientAuthStore from '../../stores/clientAuthStore';
import LoadingScreen from '../common/LoadingScreen';

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
    return <LoadingScreen />;
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
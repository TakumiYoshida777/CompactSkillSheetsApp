import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import { useAuthStore } from '../../stores/authStore';

interface CompanyGuardProps {
  children: React.ReactNode;
}

/**
 * 企業アクセス制御ガードコンポーネント
 * URLパラメータの企業IDと現在のユーザーの企業IDを比較
 */
const CompanyGuard: React.FC<CompanyGuardProps> = ({ children }) => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user, isAdmin } = useAuthStore();

  // 管理者は全企業にアクセス可能
  if (isAdmin()) {
    return <AuthGuard requireAuth={true}>{children}</AuthGuard>;
  }

  // 企業IDの検証
  if (user && companyId && user.companyId !== companyId) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AuthGuard requireAuth={true}>{children}</AuthGuard>;
};

export default CompanyGuard;
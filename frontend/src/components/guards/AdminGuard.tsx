import React from 'react';
import AuthGuard from './AuthGuard';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * 管理者権限が必要なページのガードコンポーネント
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  return (
    <AuthGuard
      requireAuth={true}
      requireRoles={['admin']}
      redirectTo="/unauthorized"
    >
      {children}
    </AuthGuard>
  );
};

export default AdminGuard;
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope?: string;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions?: Permission[];
}

export const usePermissions = () => {
  // 認証ストアから認証状態を確認
  const authState = localStorage.getItem('auth-storage');
  const isAuthenticated = authState ? JSON.parse(authState)?.state?.isAuthenticated : false;

  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await apiClient.get('/api/auth/permissions');
      return response.data;
    },
    enabled: isAuthenticated, // 認証済みの場合のみ実行
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 1,
  });
};

export const useUserRoles = () => {
  // 認証ストアから認証状態を確認
  const authState = localStorage.getItem('auth-storage');
  const isAuthenticated = authState ? JSON.parse(authState)?.state?.isAuthenticated : false;

  return useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const response = await apiClient.get('/api/auth/user-roles');
      return response.data;
    },
    enabled: isAuthenticated, // 認証済みの場合のみ実行
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 1,
  });
};

export const useHasPermission = () => {
  const { data: permissions } = usePermissions();
  
  return (resource: string, action: string, scope?: string) => {
    if (!permissions) return false;
    
    const permissionString = scope 
      ? `${resource}:${action}:${scope}`
      : `${resource}:${action}`;
    
    return permissions.some((p: Permission) => 
      p.name === permissionString || 
      p.name === `${resource}:${action}:all`
    );
  };
};
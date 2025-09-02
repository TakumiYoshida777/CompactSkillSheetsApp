import { errorLog } from '../utils/logger';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 認証API専用のクライアント
const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// リクエストインターセプター
authApiClient.interceptors.request.use(
  (config) => {
    const authState = localStorage.getItem('auth-storage');
    if (authState) {
      try {
        const parsedState = JSON.parse(authState);
        const token = parsedState?.state?.token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        const companyId = parsedState?.state?.user?.companyId;
        if (companyId) {
          config.headers['X-Company-ID'] = companyId;
        }
      } catch (error) {
        errorLog('Failed to parse auth state:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      const response = await authApiClient.get('/api/auth/permissions');
      return response.data?.data || response.data || [];
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
      const response = await authApiClient.get('/api/auth/user-roles');
      return response.data?.data || response.data || [];
    },
    enabled: isAuthenticated, // 認証済みの場合のみ実行
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 1,
  });
};

export const useHasPermission = () => {
  const { data: permissions } = usePermissions();
  
  return (resource: string, action: string, scope?: string) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    
    const permissionString = scope 
      ? `${resource}:${action}:${scope}`
      : `${resource}:${action}`;
    
    return permissions.some((p: Permission) => 
      p.name === permissionString || 
      p.name === `${resource}:${action}:all`
    );
  };
};
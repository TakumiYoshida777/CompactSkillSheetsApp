import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/permissions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    retry: 1,
  });
};

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/user-roles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    },
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
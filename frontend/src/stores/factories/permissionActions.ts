import type { StateCreator } from 'zustand';
import { getUserTypeFromToken } from '../../utils/jwtHelper';
import type { AuthState, PermissionActions } from '../types/authTypes';

/**
 * 権限チェックアクションの実装
 */
export const createPermissionActions: StateCreator<
  AuthState,
  [],
  [],
  PermissionActions
> = (set, get) => ({
  hasPermission: (resource: string, action: string) => {
    const { user } = get();
    if (!user) return false;
    
    // 管理者は全権限を持つ
    if (user.roles.includes('admin')) return true;
    
    // 特定の権限をチェック
    const permission = `${resource}:${action}`;
    return user.permissions.includes(permission) || user.permissions.includes('*');
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    return Array.isArray(user.roles) && user.roles.includes(role);
  },

  isAdmin: () => {
    const { user } = get();
    if (!user) return false;
    return user.roles.includes('admin');
  },

  isClientUser: () => {
    const { user, token } = get();
    
    // トークンから判定（最も信頼できる）
    if (token) {
      const userTypeFromToken = getUserTypeFromToken(token);
      if (userTypeFromToken === 'client') {
        return true;
      }
    }
    
    // userオブジェクトから判定
    if (!user) return false;
    
    return user.userType === 'client' || 
           (Array.isArray(user.roles) && 
            (user.roles.includes('client_admin') || user.roles.includes('client_user')));
  },
});
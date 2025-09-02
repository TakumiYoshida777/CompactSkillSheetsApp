import type { StateCreator } from 'zustand';
import { getUserTypeFromToken } from '../../utils/jwtHelper';
import { AuthService } from '../../services/authService';
import type { AuthState, TokenManagementActions, User } from '../types/authTypes';

/**
 * トークン管理アクションの実装
 */
export const createTokenManagementActions: StateCreator<
  AuthState,
  [],
  [],
  TokenManagementActions
> = (set, get) => ({
  setAuthTokens: (user: User, accessToken: string, refreshToken: string) => {
    AuthService.setAuthorizationHeader(accessToken);
    
    set({
      user,
      token: accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  refreshAccessToken: async () => {
    const { refreshToken, token } = get();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const userType = token ? getUserTypeFromToken(token) : null;
      
      const endpoint = userType === 'client' ? 'client/auth/refresh' : 'auth/refresh';
      
      const tokens = await AuthService.refreshToken(endpoint, refreshToken);
      
      set({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: any) {
      get().logout();
      throw error;
    }
  },
});
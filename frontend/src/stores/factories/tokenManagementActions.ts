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
      console.log('[refreshAccessToken] UserType from token:', userType);
      
      const endpoint = userType === 'client' ? '/api/client/auth/refresh' : '/api/auth/refresh';
      console.log('[refreshAccessToken] Using endpoint:', endpoint);
      
      const tokens = await AuthService.refreshToken(endpoint, refreshToken);
      
      set({
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: any) {
      console.log('[refreshAccessToken] Failed:', error.message);
      get().logout();
      throw error;
    }
  },
});
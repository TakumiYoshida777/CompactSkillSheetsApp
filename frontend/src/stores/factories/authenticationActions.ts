import type { StateCreator } from 'zustand';
import { AuthService } from '../../services/authService';
import { AuthCheckService } from '../../services/authCheckService';
import type { 
  AuthState, 
  AuthenticationActions,
  AuthenticationState,
  TokenManagementActions,
  UserManagementActions,
  PermissionActions
} from '../types/authTypes';

/**
 * 認証アクションの実装
 */
export const createAuthenticationActions: StateCreator<
  AuthState,
  [],
  [],
  AuthenticationActions
> = (set, get) => ({
  login: async (email: string, password: string, rememberMe?: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await AuthService.performLogin('/api/auth/login', {
        email,
        password,
        rememberMe,
      });
      
      set({
        user: authResponse.user,
        token: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'ログインに失敗しました';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  clientLogin: async (email: string, password: string, rememberMe?: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await AuthService.performLogin('/api/client/auth/login', {
        email,
        password,
        rememberMe,
      });
      
      console.log('Client Login Response:', authResponse);
      console.log('User data:', authResponse.user);
      
      set({
        user: authResponse.user,
        token: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      if (authResponse.message) {
        console.log(authResponse.message);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'ログインに失敗しました';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: () => {
    AuthService.removeAuthorizationHeader();
    
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('登録に失敗しました');
      }
      
      const { user, accessToken, refreshToken } = await response.json();
      
      AuthService.setAuthorizationHeader(accessToken);
      
      set({
        user,
        token: accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || '登録に失敗しました',
      });
      throw error;
    }
  },

  checkAuth: async () => {
    const { token, user } = get();
    console.log('[checkAuth] Starting - Token exists:', !!token, 'User:', user);
    
    if (!AuthCheckService.validateToken({ token, user })) {
      set({ isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    
    const result = await AuthCheckService.performAuthCheck(
      { token, user },
      () => get().refreshAccessToken(),
      () => get().token
    );
    
    if (result.success && result.user) {
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      get().logout();
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
});
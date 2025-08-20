import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { getUserTypeFromToken } from '../utils/jwtHelper';
import { AuthService } from '../services/authService';
import { AuthCheckService } from '../services/authCheckService';
import type { AuthState, User } from './types/authTypes';

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      status: 'idle' as const,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const authResponse = await AuthService.performLogin('auth/login', {
            email,
            password,
            rememberMe,
          });
          
          set({
            user: authResponse.user,
            token: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            status: 'authenticated',
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

      setAuthTokens: (user: User, accessToken: string, refreshToken: string) => {
        // Axiosのデフォルトヘッダーに認証トークンを設定
        AuthService.setAuthorizationHeader(accessToken);
        
        set({
          user,
          token: accessToken,
          refreshToken,
          status: 'authenticated',
          isLoading: false,
          error: null,
        });
      },

      clientLogin: async (email: string, password: string, rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const authResponse = await AuthService.performLogin('client/auth/login', {
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
            status: 'authenticated',
            isLoading: false,
            error: null,
          });
          
          if (authResponse.message) {
            console.log(authResponse.message); // ログインに成功しました
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
        // Axiosのデフォルトヘッダーから認証トークンを削除
        AuthService.removeAuthorizationHeader();
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          status: 'unauthenticated',
          error: null,
        });
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('auth/register', data);
          
          const { user, accessToken, refreshToken } = response.data;
          
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
            error: error.response?.data?.message || '登録に失敗しました',
          });
          throw error;
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken, token } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          // 現在のトークンからuserTypeを取得
          const userType = token ? getUserTypeFromToken(token) : null;
          console.log('[refreshAccessToken] UserType from token:', userType);
          
          // ユーザータイプに応じて適切なエンドポイントを使用
          const endpoint = userType === 'client' ? 'client/auth/refresh' : 'auth/refresh';
          console.log('[refreshAccessToken] Using endpoint:', endpoint);
          
          const tokens = await AuthService.refreshToken(endpoint, refreshToken);
          
          set({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
        } catch (error: any) {
          console.log('[refreshAccessToken] Failed:', error.message);
          // リフレッシュトークンが無効な場合はログアウト
          get().logout();
          throw error;
        }
      },

      updateProfile: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put('users/profile', data);
          
          set({
            user: response.data,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'プロフィール更新に失敗しました',
          });
          throw error;
        }
      },

      checkAuth: async () => {
        const { token, user, status } = get();
        console.log('[checkAuth] Starting - Token:', !!token, 'User:', user, 'Status:', status);
        
        // 既に認証済みの場合はスキップ
        if (status === 'authenticated') {
          console.log('[checkAuth] Already authenticated, skipping');
          return;
        }
        
        // 二重実行防止
        if (status === 'checking' || !token) {
          console.log('[checkAuth] Already checking or no token');
          return;
        }
        
        set({ status: 'checking', isLoading: true });
        
        try {
          // 認証チェックを実行
          const result = await AuthCheckService.performAuthCheck(
            { token, user },
            () => get().refreshAccessToken(),
            () => get().token
          );
          
          console.log('[checkAuth] Result:', result);
          
          // 結果に基づいて状態を更新
          if (result.success && result.user) {
            console.log('[checkAuth] Auth check successful');
            set({
              user: result.user,
              status: 'authenticated',
              isLoading: false,
            });
          } else {
            console.log('[checkAuth] Auth check failed');
            // 401の場合のみログアウト
            set({
              user: null,
              token: null,
              refreshToken: null,
              status: 'unauthenticated',
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('[checkAuth] Unexpected error:', error);
          // ネットワークエラーの場合は一時的に認証状態を保つ
          if (error?.response?.status === 401) {
            set({
              user: null,
              token: null,
              refreshToken: null,
              status: 'unauthenticated',
              isLoading: false,
            });
          } else {
            // 一時エラーの場合
            set({ status: 'authenticated', isLoading: false });
          }
        }
      },

      clearError: () => set({ error: null }),

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
        // rolesが配列であることを確認
        return Array.isArray(user.roles) && user.roles.includes(role);
      },

      // 認証状態の導出値を提供
      isAuthenticated: () => {
        const { token, user } = get();
        return Boolean(token && user);
      },

      isAdmin: () => {
        const { user } = get();
        if (!user) return false;
        return user.roles.includes('admin');
      },

      isClientUser: () => {
        const { user, token } = get();
        
        // 1. まずトークンから判定（最も信頼できる）
        if (token) {
          const userTypeFromToken = getUserTypeFromToken(token);
          if (userTypeFromToken === 'client') {
            return true;
          }
        }
        
        // 2. 次にuserオブジェクトから判定
        if (!user) return false;
        
        // userTypeがclientの場合、またはrolesが配列でclient_adminかclient_userを含む場合
        return user.userType === 'client' || 
               (Array.isArray(user.roles) && (user.roles.includes('client_admin') || user.roles.includes('client_user')));
      },
    }),
    {
      name: 'auth-storage',
      // isAuthenticatedは永続化しない（導出値として扱う）
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        // ストレージから状態を復元した後、トークンがある場合はAxiosのデフォルトヘッダーを設定
        if (state?.token) {
          AuthService.setAuthorizationHeader(state.token);
        }
      },
    }
  )
);

// 導出セレクタ - 認証状態を取得
export const useIsAuthenticated = () => 
  useAuthStore((state) => Boolean(state.token && state.user));

// ハイドレーション状態を取得するフック
export const useStoreHydrated = () => {
  const [hydrated, setHydrated] = React.useState(
    useAuthStore.persist.hasHydrated()
  );
  
  React.useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsubscribe;
  }, []);
  
  return hydrated;
};

export { useAuthStore };
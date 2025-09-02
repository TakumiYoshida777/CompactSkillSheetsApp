import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { getUserTypeFromToken } from '../utils/jwtHelper';
import { AuthService } from '../services/authService';
import { AuthCheckService } from '../services/authCheckService';
import { getLoginPath } from '../utils/navigation';
import type { AuthState, User } from './types/authTypes';

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      navigateToLogin: null,  // ナビゲーション関数を保持

      login: async (email: string, password: string, rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const authResponse = await AuthService.performLogin('/auth/login', {
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

      setAuthTokens: (user: User, accessToken: string, refreshToken: string) => {
        // Axiosのデフォルトヘッダーに認証トークンを設定
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

      clientLogin: async (email: string, password: string, rememberMe?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const authResponse = await AuthService.performLogin('/client/auth/login', {
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

      logout: () => {
        // Axiosのデフォルトヘッダーから認証トークンを削除
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
          
          // ユーザータイプに応じて適切なエンドポイントを使用
          const endpoint = userType === 'client' ? 'client/auth/refresh' : 'auth/refresh';
          
          const tokens = await AuthService.refreshToken(endpoint, refreshToken);
          
          set({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
        } catch (error: any) {
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
        const { token, user } = get();
        
        // トークンの初期検証
        if (!AuthCheckService.validateToken({ token, user })) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        
        // 認証チェックを実行
        const result = await AuthCheckService.performAuthCheck(
          { token, user },
          () => get().refreshAccessToken(),
          () => get().token
        );
        
        // 結果に基づいて状態を更新
        if (result.success && result.user) {
          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // 認証失敗時はログアウト
          get().logout();
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      hasPermission: (resource: string, action: string) => {
        const { user } = get();
        if (!user) return false;
        
        // 管理者は全権限を持つ
        if (user.roles && user.roles.includes('admin')) return true;
        
        // 特定の権限をチェック
        const permission = `${resource}:${action}`;
        
        // permissionsが配列の場合（文字列の配列）
        if (Array.isArray(user.permissions)) {
          // permissionsが文字列の配列の場合
          if (typeof user.permissions[0] === 'string') {
            return user.permissions.includes(permission) || user.permissions.includes('*');
          }
          // permissionsがオブジェクトの配列の場合
          return user.permissions.some(p => 
            p.name === permission || 
            (p.resource === resource && p.action === action)
          );
        }
        
        return false;
      },

      hasRole: (role: string) => {
        const { user } = get();
        if (!user) return false;
        // rolesが配列であることを確認
        if (Array.isArray(user.roles)) {
          // rolesがオブジェクトの配列の場合
          if (user.roles.length > 0 && typeof user.roles[0] === 'object' && 'name' in user.roles[0]) {
            return user.roles.some((r: any) => r.name === role);
          }
          // rolesが文字列の配列の場合
          return user.roles.includes(role);
        }
        // 単一のroleプロパティがある場合
        if (user.role) {
          return user.role === role;
        }
        return false;
      },

      isAdmin: () => {
        const { user } = get();
        if (!user) return false;
        // hasRoleメソッドを使用
        return get().hasRole('admin');
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

      setNavigateFunction: (navigate: ((path: string) => void) | null) => {
        set({ navigateToLogin: navigate });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
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

export { useAuthStore };
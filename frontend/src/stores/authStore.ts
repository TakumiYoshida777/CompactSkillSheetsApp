import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { getUserTypeFromToken } from '../utils/jwtHelper';
import { AuthService } from '../services/authService';

interface Company {
  id: string;
  name: string;
  companyType: 'ses' | 'client';
  emailDomain?: string;
  maxEngineers: number;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  company?: Company;
  roles: string[];
  permissions: string[];
  engineerId?: string;
  avatarUrl?: string;
  userType?: 'ses' | 'client' | 'engineer';
  clientCompany?: Company;
  sesCompany?: Company;
  department?: string;
  position?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  clientLogin: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  setAuthTokens: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  register: (data: any) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isClientUser: () => boolean;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

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
          isAuthenticated: false,
          error: null,
        });
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/auth/register', data);
          
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
          const endpoint = userType === 'client' ? '/api/client/auth/refresh' : '/api/auth/refresh';
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
          const response = await axios.put('/api/users/profile', data);
          
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
        console.log('[checkAuth] Starting - Token exists:', !!token, 'User:', user);
        
        if (!token) {
          console.log('[checkAuth] No token found, setting isAuthenticated to false');
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          AuthService.setAuthorizationHeader(token);
          
          // JWTトークンからuserTypeを取得
          const userTypeFromToken = getUserTypeFromToken(token);
          console.log('[checkAuth] UserType from token:', userTypeFromToken);
          
          // トークンから取得したuserTypeまたは既存のuserTypeを使用
          const userType = userTypeFromToken || user?.userType;
          const endpoint = userType === 'client' ? '/api/client/auth/me' : '/api/auth/me';
          console.log('[checkAuth] Using endpoint:', endpoint, 'UserType:', userType);
          
          const userData = await AuthService.fetchUserInfo(endpoint);
          console.log('[checkAuth] Success - Response:', userData);
          
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.log('[checkAuth] Initial request failed:', error.message);
          
          // トークンが無効な場合はリフレッシュを試みる
          try {
            await get().refreshAccessToken();
            const { token: newToken } = get(); // 新しいトークンを取得
            
            // 新しいトークンからuserTypeを取得
            const userTypeFromNewToken = getUserTypeFromToken(newToken || '');
            const endpoint = userTypeFromNewToken === 'client' ? '/api/client/auth/me' : '/api/auth/me';
            console.log('[checkAuth] After refresh, using endpoint:', endpoint, 'UserType:', userTypeFromNewToken);
            
            const userData = await AuthService.fetchUserInfo(endpoint);
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (refreshError: any) {
            console.log('[checkAuth] Refresh also failed:', refreshError.message);
            get().logout();
            set({ isLoading: false });
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
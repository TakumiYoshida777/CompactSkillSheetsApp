import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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
          const response = await axios.post('/api/auth/login', {
            email,
            password,
            rememberMe,
          });
          
          // APIレスポンスの構造に合わせて修正
          const { data } = response.data;
          const { user, accessToken, refreshToken } = data;
          
          // Axiosのデフォルトヘッダーに認証トークンを設定
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
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
            error: error.response?.data?.error?.message || error.response?.data?.message || 'ログインに失敗しました',
          });
          throw error;
        }
      },

      setAuthTokens: (user: User, accessToken: string, refreshToken: string) => {
        // Axiosのデフォルトヘッダーに認証トークンを設定
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
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
          const response = await axios.post('/api/client/auth/login', {
            email,
            password,
            rememberMe,
          });
          
          const { message, user, accessToken, refreshToken } = response.data;
          
          console.log('Client Login Response:', response.data);
          console.log('User data:', user);
          
          // Axiosのデフォルトヘッダーに認証トークンを設定
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log(message); // ログインに成功しました
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'ログインに失敗しました',
          });
          throw error;
        }
      },

      logout: () => {
        // Axiosのデフォルトヘッダーから認証トークンを削除
        delete axios.defaults.headers.common['Authorization'];
        
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
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
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
        const { refreshToken, user } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          // ユーザータイプに応じて適切なエンドポイントを使用
          const endpoint = user?.userType === 'client' ? '/api/client/auth/refresh' : '/api/auth/refresh';
          const response = await axios.post(endpoint, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          set({
            token: accessToken,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
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
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // ユーザータイプに応じて適切なエンドポイントを使用
          const endpoint = user?.userType === 'client' ? '/api/client/auth/me' : '/api/auth/me';
          const response = await axios.get(endpoint);
          
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // トークンが無効な場合はリフレッシュを試みる
          try {
            await get().refreshAccessToken();
            const endpoint = user?.userType === 'client' ? '/api/client/auth/me' : '/api/auth/me';
            const response = await axios.get(endpoint);
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (refreshError) {
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
        const { user } = get();
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
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export { useAuthStore };
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  roles: string[];
  permissions: string[];
  engineerId?: string;
  avatarUrl?: string;
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
  logout: () => void;
  register: (data: any) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
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
          
          const { user, accessToken, refreshToken } = response.data;
          
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
            error: error.response?.data?.message || 'ログインに失敗しました',
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
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await axios.post('/api/auth/refresh', {
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
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/auth/me');
          
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // トークンが無効な場合はリフレッシュを試みる
          try {
            await get().refreshAccessToken();
            const response = await axios.get('/api/auth/me');
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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
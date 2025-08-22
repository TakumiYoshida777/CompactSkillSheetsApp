import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface ClientCompany {
  id: string;
  name: string;
  companyType: 'client';
  emailDomain?: string;
  isActive: boolean;
}

interface ClientUser {
  id: string;
  email: string;
  name: string;
  businessPartnerId: string;
  businessPartner: ClientCompany;
  role: string;
  permissionType: 'FULL_ACCESS' | 'WAITING_ONLY' | 'SELECTED_ONLY';
  department?: string;
  position?: string;
  isActive: boolean;
}

interface ClientAuthState {
  user: ClientUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permissionType: string) => boolean;
  isClientAdmin: () => boolean;
}

// 独立したaxiosインスタンスを作成
const clientAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const useClientAuthStore = create<ClientAuthState>()(
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
          const response = await clientAxios.post('client/auth/login', {
            email,
            password,
            rememberMe,
          });
          
          const { user, accessToken, refreshToken, message } = response.data;
          
          // 独立したaxiosインスタンスにトークンを設定
          clientAxios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('[ClientAuth] Login successful:', message);
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'ログインに失敗しました',
          });
          throw error;
        }
      },

      logout: () => {
        // トークンを削除
        delete clientAxios.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        
        // ローカルストレージからも削除
        localStorage.removeItem('client-auth-storage');
      },

      checkAuth: async () => {
        const { token, refreshToken } = get();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        clientAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const response = await clientAxios.get('client/auth/me');
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.log('[ClientAuth] Check auth failed:', error.response?.status);
          
          // 401エラーの場合、リフレッシュトークンで再試行
          if (error.response?.status === 401 && refreshToken) {
            try {
              await get().refreshAccessToken();
              
              // 新しいトークンで再試行
              const response = await clientAxios.get('client/auth/me');
              set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (refreshError) {
              console.log('[ClientAuth] Refresh also failed');
              get().logout();
              set({ isLoading: false });
            }
          } else {
            get().logout();
            set({ isLoading: false });
          }
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await clientAxios.post('client/auth/refresh', {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          clientAxios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          set({
            token: accessToken,
            refreshToken: newRefreshToken || refreshToken,
          });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      hasPermission: (permissionType: string) => {
        const { user } = get();
        if (!user) return false;
        return user.permissionType === permissionType || user.permissionType === 'FULL_ACCESS';
      },

      isClientAdmin: () => {
        const { user } = get();
        if (!user) return false;
        return user.role === 'client_admin';
      },
    }),
    {
      name: 'client-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // ストレージから状態を復元した後、トークンがある場合は独立したaxiosインスタンスのヘッダーを設定
        if (state?.token) {
          clientAxios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

export default useClientAuthStore;
export { clientAxios };
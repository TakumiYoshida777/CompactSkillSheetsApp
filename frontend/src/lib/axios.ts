import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リフレッシュトークン処理の排他制御用
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  
  failedQueue = [];
};

// リクエストインターセプター
instance.interceptors.request.use(
  (config) => {
    // Zustandストアから認証トークンを取得
    const token = useAuthStore.getState().token;
    console.log('[Axios Interceptor] Adding token to request:', token ? 'Token exists' : 'No token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios Interceptor] Authorization header set');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401エラーの処理
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // すでにリフレッシュ中の場合はキューに追加
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = useAuthStore.getState().refreshToken;
      const user = useAuthStore.getState().user;
      
      if (!refreshToken) {
        // リフレッシュトークンがない場合はログアウト（リダイレクトはAuthGuardに任せる）
        console.log('[Axios Interceptor] No refresh token, logging out');
        useAuthStore.getState().logout();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }
      
      try {
        // ユーザータイプに基づいてエンドポイントを決定（/api/は不要）
        const userType = user?.userType || 'ses';
        const endpoint = userType === 'client' ? 'client/auth/refresh' : 'auth/refresh';
        console.log('[Axios Interceptor] Refreshing token with endpoint:', endpoint);
        
        const response = await instance.post(endpoint, {
          refreshToken: refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // 新しいトークンをストアに保存
        useAuthStore.setState({
          token: accessToken,
          refreshToken: newRefreshToken,
        });
        
        console.log('[Axios Interceptor] Token refreshed successfully');
        
        // キューに入っているリクエストを処理
        processQueue(null, accessToken);
        
        // 元のリクエストを再実行
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
        
      } catch (refreshError) {
        console.error('[Axios Interceptor] Refresh token failed:', refreshError);
        
        // リフレッシュ失敗時はログアウト（リダイレクトはAuthGuardに任せる）
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        
        // window.location.hrefを使わない - AuthGuardがリダイレクトを処理
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
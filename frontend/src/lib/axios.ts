import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
instance.interceptors.request.use(
  (config) => {
    // Zustandストアから認証トークンを取得
    const token = useAuthStore.getState().token;
    console.log('[Axios Request] URL:', config.url);
    console.log('[Axios Request] Base URL:', config.baseURL);
    console.log('[Axios Request] Full URL:', `${config.baseURL}${config.url}`);
    console.log('[Axios Request] Method:', config.method);
    console.log('[Axios Request] Params:', config.params);
    console.log('[Axios Interceptor] Adding token to request:', token ? 'Token exists' : 'No token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios Interceptor] Authorization header set:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
instance.interceptors.response.use(
  (response) => {
    console.log('[Axios Response] URL:', response.config.url);
    console.log('[Axios Response] Status:', response.status);
    console.log('[Axios Response] Data:', response.data);
    return response;
  },
  async (error) => {
    console.error('[Axios Response Error]:', error);
    console.error('[Axios Response Error] Status:', error.response?.status);
    console.error('[Axios Response Error] Data:', error.response?.data);
    const originalRequest = error.config;

    // 401エラーでリフレッシュトークンを使用
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const token = useAuthStore.getState().token;
        const user = useAuthStore.getState().user;
        
        if (refreshToken) {
          // ユーザータイプに基づいてエンドポイントを決定
          const userType = user?.userType || 'ses';
          const endpoint = userType === 'client' ? '/api/v1/client/auth/refresh' : '/api/v1/auth/refresh';
          
          const response = await instance.post(endpoint, {
            refreshToken: refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Zustandストアを更新
          useAuthStore.getState().setAuthTokens(
            useAuthStore.getState().user,
            accessToken,
            newRefreshToken
          );
          
          // 元のリクエストを再実行
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        console.error('[Axios Interceptor] Refresh token failed:', refreshError);
        // リフレッシュ失敗時はログアウト
        useAuthStore.getState().logout();
        // 現在のパスに応じて適切なログインページにリダイレクト
        const currentPath = window.location.pathname;
        if (currentPath.includes('/client')) {
          window.location.href = '/client/login';
        } else {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
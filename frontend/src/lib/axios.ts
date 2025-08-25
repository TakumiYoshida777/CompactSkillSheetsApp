import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { getLoginPath } from '../utils/navigation';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
instance.interceptors.request.use(
  (config) => {
    // Zustandストアから認証トークンとユーザー情報を取得
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;
    console.log('[Axios Request] URL:', config.url);
    console.log('[Axios Request] Base URL:', config.baseURL);
    console.log('[Axios Request] Full URL:', `${config.baseURL}${config.url}`);
    console.log('[Axios Request] Method:', config.method);
    console.log('[Axios Request] Params:', config.params);
    console.log('[Axios Interceptor] Adding token to request:', token ? 'Token exists' : 'No token');
    
    config.headers = config.headers || {};
    
    // 認証トークンを設定
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios Interceptor] Authorization header set:', config.headers.Authorization);
    }
    
    // 企業IDヘッダーを設定
    if (user?.companyId) {
      config.headers['X-Company-ID'] = user.companyId;
      console.log('[Axios Interceptor] X-Company-ID header set:', user.companyId);
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
        
        // ナビゲーション関数を使用してリダイレクト
        const navigateToLogin = useAuthStore.getState().navigateToLogin;
        const currentPath = window.location.pathname;
        const loginPath = getLoginPath(currentPath);
        
        if (navigateToLogin) {
          // React Routerのnavigateを使用
          navigateToLogin(loginPath);
        } else {
          // フォールバック: window.locationを使用（初期化前などの場合）
          window.location.href = loginPath;
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
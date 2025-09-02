import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { getLoginPath } from '../utils/navigation';
import { errorLog } from '../utils/logger';

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
    
    config.headers = config.headers || {};
    
    // 認証トークンを設定
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 企業IDヘッダーを設定
    if (user?.companyId) {
      config.headers['X-Company-ID'] = user.companyId;
    }
    
    return config;
  },
  (error) => {
    errorLog('[Axios Request Error]:', error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
instance.interceptors.response.use(
  (response) => {
    
    // APIレスポンスが標準的な形式の場合、dataを展開
    // ただし、特定のエンドポイント（business-partners）のみ展開する
    const url = response.config.url || '';
    if (response.data && 
        response.data.success === true && 
        response.data.data !== undefined &&
        url.includes('/business-partners')) {
      // paginationデータがある場合は保持
      const responseData = response.data.data;
      if (response.data.meta?.pagination) {
        responseData.pagination = response.data.meta.pagination;
      }
      response.data = responseData;
    }
    
    return response;
  },
  async (error) => {
    errorLog('[Axios Response Error]:', error);
    errorLog('[Axios Response Error] Status:', error.response?.status);
    errorLog('[Axios Response Error] Data:', error.response?.data);
    const originalRequest = error.config;

    // 401エラーでリフレッシュトークンを使用
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const user = useAuthStore.getState().user;
        
        if (refreshToken && user) {
          // ユーザータイプに基づいてエンドポイントを決定
          const userType = user.userType || 'ses';
          const endpoint = userType === 'client' ? '/api/v1/client/auth/refresh' : '/api/v1/auth/refresh';
          
          const response = await instance.post(endpoint, {
            refreshToken: refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Zustandストアを更新
          useAuthStore.getState().setAuthTokens(
            user,
            accessToken,
            newRefreshToken
          );
          
          // 元のリクエストを再実行
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        errorLog('[Axios Interceptor] Refresh token failed:', refreshError);
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
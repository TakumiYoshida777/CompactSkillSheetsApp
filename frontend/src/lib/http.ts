import { errorLog, groupLog, tableLog } from '../utils/logger';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { getLoginPath } from '../utils/navigation';

// 環境変数からAPIのベースURLを取得
const envUrl = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL;

// ポート番号に基づくフォールバックマッピング
// 複数環境での開発時に正しいAPIエンドポイントを自動選択
const portMap: Record<string, string> = {
  "3000": "http://localhost:8000/api/v1", // Dev1環境
  "3001": "http://localhost:8001/api/v1", // Dev2環境
  "3002": "http://localhost:8002/api/v1", // Dev3環境
};

// 現在のポートに基づいてフォールバックURLを決定
const currentPort = window.location.port || "3001"; // デフォルトはDev2
const fallbackUrl = portMap[currentPort] ?? "http://localhost:8001/api/v1";

// 最終的なベースURLを決定（末尾のスラッシュを削除）
const baseURL = (envUrl || fallbackUrl).replace(/\/+$/, "");

// 開発環境でのデバッグ情報出力
if (import.meta.env.DEV) {
  groupLog('[HTTP Configuration]', () => {
  tableLog({
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
    'VITE_APP_ENV': import.meta.env.VITE_APP_ENV,
    'VITE_APP_PORT': import.meta.env.VITE_APP_PORT
  });
  });
}

// Axiosインスタンスの作成
const instance = axios.create({
  baseURL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// リクエストインターセプター
instance.interceptors.request.use(
  (config) => {
    // Zustandストアから認証トークンを取得
    const token = useAuthStore.getState().token;
    
    
    // トークンがある場合はヘッダーに追加
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
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
    return response;
  },
  async (error) => {
    // エラーログ
    if (import.meta.env.DEV) {
      errorLog('[Axios Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }
    
    const originalRequest = error.config;

    // 401エラーでリフレッシュトークンを使用
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const user = useAuthStore.getState().user;
        
        if (refreshToken) {
          // ユーザータイプに基づいてエンドポイントを決定
          const userType = user?.userType || 'ses';
          const endpoint = userType === 'client' ? '/client/auth/refresh' : '/auth/refresh';
          
          
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
        errorLog('[Auth] Token refresh failed:', refreshError);
        
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

// 旧axios.tsとの互換性のため、デフォルトエクスポート
export default instance;

// 名前付きエクスポートも提供
export { instance as http };

// 環境情報を取得する関数（デバッグ用）
export const getHttpConfig = () => ({
  baseURL,
  environment: import.meta.env.VITE_APP_ENV || 'unknown',
  port: currentPort,
  debug: import.meta.env.VITE_DEBUG_MODE === 'true'
});
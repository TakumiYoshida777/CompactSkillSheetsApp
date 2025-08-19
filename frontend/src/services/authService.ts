import axios, { AxiosResponse } from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

interface ApiLoginResponse {
  data?: AuthResponse;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

/**
 * 認証サービス - 認証ロジックの共通処理を提供
 */
export class AuthService {
  /**
   * 共通ログイン処理
   * @param endpoint APIエンドポイント
   * @param credentials ログイン認証情報
   * @returns 認証レスポンス
   */
  static async performLogin(
    endpoint: string,
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiLoginResponse> = await axios.post(endpoint, credentials);
      
      // APIレスポンスの構造を正規化
      const authResponse = this.normalizeAuthResponse(response.data);
      
      // Axiosのデフォルトヘッダーに認証トークンを設定
      this.setAuthorizationHeader(authResponse.accessToken);
      
      return authResponse;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * APIレスポンスを統一フォーマットに正規化
   * @param data APIレスポンスデータ
   * @returns 正規化された認証レスポンス
   */
  private static normalizeAuthResponse(data: ApiLoginResponse): AuthResponse {
    // /api/auth/login のレスポンス形式（data オブジェクト内にネスト）
    if (data.data) {
      return {
        user: data.data.user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        message: data.message,
      };
    }
    
    // /api/client/auth/login のレスポンス形式（フラット）
    return {
      user: data.user!,
      accessToken: data.accessToken!,
      refreshToken: data.refreshToken!,
      message: data.message,
    };
  }

  /**
   * Axiosのデフォルトヘッダーに認証トークンを設定
   * @param token アクセストークン
   */
  static setAuthorizationHeader(token: string): void {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Axiosのデフォルトヘッダーから認証トークンを削除
   */
  static removeAuthorizationHeader(): void {
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * 認証エラーを処理し、適切なエラーメッセージを返す
   * @param error エラーオブジェクト
   * @returns 処理されたエラー
   */
  private static handleAuthError(error: any): Error {
    const errorMessage = 
      error.response?.data?.error?.message || 
      error.response?.data?.error || 
      error.response?.data?.message || 
      'ログインに失敗しました';
    
    const authError = new Error(errorMessage);
    (authError as any).originalError = error;
    return authError;
  }

  /**
   * リフレッシュトークンを使用してアクセストークンを更新
   * @param endpoint APIエンドポイント
   * @param refreshToken リフレッシュトークン
   * @returns 新しいトークン情報
   */
  static async refreshToken(
    endpoint: string,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await axios.post(endpoint, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      this.setAuthorizationHeader(accessToken);
      
      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * ユーザー情報を取得
   * @param endpoint APIエンドポイント
   * @returns ユーザー情報
   */
  static async fetchUserInfo(endpoint: string): Promise<any> {
    try {
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
}
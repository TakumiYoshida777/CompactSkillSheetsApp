import axiosInstance from '../lib/axios';
import type { AxiosResponse } from 'axios';
import { AppError, ErrorFactory } from '../errors/AppError';

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
  success?: boolean;
  data?: AuthResponse | any;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  meta?: any;
}

/**
 * 認証サービス - 認証ロジックの共通処理を提供
 */
export class AuthService {
  /**
   * 認証情報の検証
   * @param credentials ログイン認証情報
   * @returns 有効性の真偽値
   */
  static validateCredentials(credentials: LoginCredentials): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(credentials.email) && credentials.password.length >= 6;
  }

  /**
   * レスポンスの正規化（テスト用）
   * @param response APIレスポンス
   * @returns 正規化されたレスポンス
   */
  static normalizeLoginResponse(response: any): any {
    if (response.access_token) {
      return {
        token: response.access_token,
        refreshToken: response.refresh_token,
        user: {
          id: response.user_data?.user_id,
          email: response.user_data?.user_email,
          name: response.user_data?.user_name
        }
      };
    }
    return response;
  }
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
      const response: AxiosResponse<ApiLoginResponse> = await axiosInstance.post(endpoint, credentials);
      
      // APIレスポンスの構造を正規化
      const authResponse = this.normalizeAuthResponse(response.data);
      
      // Axiosのデフォルトヘッダーに認証トークンを設定
      this.setAuthorizationHeader(authResponse.accessToken);
      
      return authResponse;
    } catch (error: any) {
      throw ErrorFactory.fromApiError(error);
    }
  }

  /**
   * APIレスポンスを統一フォーマットに正規化
   * @param data APIレスポンスデータ
   * @returns 正規化された認証レスポンス
   */
  private static normalizeAuthResponse(data: ApiLoginResponse): AuthResponse {
    
    // バックエンドの標準レスポンス形式（success: true, data: {...}）
    if (data.success && data.data) {
      const authData = data.data;
      return {
        user: authData.user,
        accessToken: authData.accessToken || authData.token,
        refreshToken: authData.refreshToken,
        message: data.message,
      };
    }
    
    // /api/auth/login のレスポンス形式（data オブジェクト内にネスト）
    if (data.data) {
      return {
        user: data.data.user,
        accessToken: data.data.accessToken || data.data.token,
        refreshToken: data.data.refreshToken,
        message: data.message,
      };
    }
    
    // /api/client/auth/login のレスポンス形式（フラット）
    return {
      user: data.user!,
      accessToken: data.accessToken || (data as any).token!,
      refreshToken: data.refreshToken!,
      message: data.message,
    };
  }

  /**
   * Axiosのデフォルトヘッダーに認証トークンを設定
   * @param token アクセストークン
   */
  static setAuthorizationHeader(token: string): void {
    // トークンが設定されていることを確認（インターセプターで自動的に処理される）
  }

  /**
   * Axiosのデフォルトヘッダーから認証トークンを削除
   */
  static removeAuthorizationHeader(): void {
    // トークンがクリアされたことを確認（インターセプターで自動的に処理される）
  }

  /**
   * 認証エラーを処理し、適切なエラーメッセージを返す
   * @param error エラーオブジェクト
   * @returns 処理されたエラー
   */
  private static handleAuthError(error: any): AppError {
    return ErrorFactory.fromApiError(error);
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
      const response = await axiosInstance.post(endpoint, { refreshToken });
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
      const response = await axiosInstance.get(endpoint);
      
      // APIレスポンスの形式に応じて適切にデータを返す
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
}
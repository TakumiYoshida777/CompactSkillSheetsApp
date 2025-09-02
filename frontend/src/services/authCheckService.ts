import { AuthService } from './authService';
import { getUserTypeFromToken } from '../utils/jwtHelper';

interface AuthCheckContext {
  token: string | null;
  user: any;
}

interface AuthCheckResult {
  success: boolean;
  user?: any;
  needsRefresh?: boolean;
}

/**
 * 認証チェックサービス - checkAuth関数の責務を分割
 */
export class AuthCheckService {
  /**
   * トークンの存在を検証
   */
  static validateToken(context: AuthCheckContext): boolean {
    if (!context.token) {
      return false;
    }
    return true;
  }

  /**
   * ユーザータイプに基づいてAPIエンドポイントを決定
   */
  static determineEndpoint(token: string, user?: any): string {
    const userTypeFromToken = getUserTypeFromToken(token);
    
    const userType = userTypeFromToken || user?.userType;
    const endpoint = userType === 'client' ? 'client/auth/me' : 'auth/me';
    
    return endpoint;
  }

  /**
   * ユーザー情報を取得
   */
  static async fetchUserData(token: string, user?: any): Promise<AuthCheckResult> {
    try {
      AuthService.setAuthorizationHeader(token);
      const endpoint = this.determineEndpoint(token, user);
      const userData = await AuthService.fetchUserInfo(endpoint);
      
      return {
        success: true,
        user: userData,
      };
    } catch (error: any) {
      return {
        success: false,
        needsRefresh: true,
      };
    }
  }

  /**
   * リフレッシュトークンで再試行
   */
  static async retryWithRefresh(
    refreshTokenFn: () => Promise<void>,
    getTokenFn: () => string | null
  ): Promise<AuthCheckResult> {
    try {
      await refreshTokenFn();
      const newToken = getTokenFn();
      
      if (!newToken) {
        return { success: false };
      }
      
      const endpoint = this.determineEndpoint(newToken);
      
      const userData = await AuthService.fetchUserInfo(endpoint);
      return {
        success: true,
        user: userData,
      };
    } catch (refreshError: any) {
      return { success: false };
    }
  }

  /**
   * 統合された認証チェック処理
   */
  static async performAuthCheck(
    context: AuthCheckContext,
    refreshTokenFn: () => Promise<void>,
    getTokenFn: () => string | null
  ): Promise<AuthCheckResult> {
    // トークン検証
    if (!this.validateToken(context)) {
      return { success: false };
    }

    // ユーザー情報取得を試みる
    const result = await this.fetchUserData(context.token!, context.user);
    
    // 成功した場合はそのまま返す
    if (result.success) {
      return result;
    }
    
    // リフレッシュが必要な場合は再試行
    if (result.needsRefresh) {
      return await this.retryWithRefresh(refreshTokenFn, getTokenFn);
    }
    
    return { success: false };
  }
}
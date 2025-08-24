/**
 * セキュリティ設定モジュール
 * 本番環境での安全な運用を保証するための設定
 */

import logger from './logger';

/**
 * JWT設定の検証と取得
 */
export class SecurityConfig {
  private static instance: SecurityConfig;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.jwtSecret = '';
    this.jwtRefreshSecret = '';
    this.validateAndLoadSecrets();
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): SecurityConfig {
    if (!SecurityConfig.instance) {
      try {
        SecurityConfig.instance = new SecurityConfig();
      } catch (error) {
        logger.error('Security configuration failed:', error);
        // 開発環境では警告のみ、本番環境では例外を再スロー
        if (process.env.NODE_ENV === 'production') {
          throw error;
        }
        // 開発環境用のフォールバック設定
        SecurityConfig.instance = new SecurityConfig();
      }
    }
    return SecurityConfig.instance;
  }

  /**
   * 環境変数の検証と読み込み
   */
  private validateAndLoadSecrets(): void {
    // JWT_SECRETの検証
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      const message = 'JWT_SECRET is not configured';
      logger.error(message);
      if (this.isProduction) {
        throw new Error(message);
      }
    }

    // デフォルト値や弱いシークレットのチェック
    const weakSecrets = [
      'your-secret-key',
      'your-refresh-secret',
      'dev-jwt-secret',
      'secret',
      'password',
      'changeme'
    ];

    if (jwtSecret && weakSecrets.some(weak => jwtSecret.toLowerCase().includes(weak))) {
      const message = 'JWT_SECRET contains weak or default value';
      logger.error(message);
      if (this.isProduction) {
        throw new Error(message);
      }
    }

    // 本番環境では最小長を要求
    if (this.isProduction && jwtSecret && jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }

    // JWT_REFRESH_SECRETの検証
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      const message = 'JWT_REFRESH_SECRET is not configured';
      logger.error(message);
      if (this.isProduction) {
        throw new Error(message);
      }
    }

    if (jwtRefreshSecret && weakSecrets.some(weak => jwtRefreshSecret.toLowerCase().includes(weak))) {
      const message = 'JWT_REFRESH_SECRET contains weak or default value';
      logger.error(message);
      if (this.isProduction) {
        throw new Error(message);
      }
    }

    if (this.isProduction && jwtRefreshSecret && jwtRefreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
    }

    // 同じシークレットを使用していないかチェック
    if (jwtSecret && jwtRefreshSecret && jwtSecret === jwtRefreshSecret) {
      const message = 'JWT_SECRET and JWT_REFRESH_SECRET must be different';
      logger.error(message);
      if (this.isProduction) {
        throw new Error(message);
      }
    }

    // 開発環境用のフォールバック（警告付き）
    if (!this.isProduction) {
      this.jwtSecret = jwtSecret || 'dev-only-secret-change-in-production';
      this.jwtRefreshSecret = jwtRefreshSecret || 'dev-only-refresh-secret-change-in-production';
      
      if (!jwtSecret || !jwtRefreshSecret) {
        logger.warn('⚠️  Using default JWT secrets for development. NEVER use in production!');
      }
    } else {
      // 本番環境では必須
      this.jwtSecret = jwtSecret!;
      this.jwtRefreshSecret = jwtRefreshSecret!;
    }

    logger.info('Security configuration validated successfully');
  }

  /**
   * JWTシークレットの取得
   */
  public getJwtSecret(): string {
    return this.jwtSecret;
  }

  /**
   * JWTリフレッシュシークレットの取得
   */
  public getJwtRefreshSecret(): string {
    return this.jwtRefreshSecret;
  }

  /**
   * セキュリティ設定の要約を取得（ログ用）
   */
  public getSecuritySummary(): object {
    return {
      environment: this.isProduction ? 'production' : 'development',
      jwtSecretConfigured: !!this.jwtSecret,
      jwtRefreshSecretConfigured: !!this.jwtRefreshSecret,
      jwtSecretLength: this.jwtSecret.length,
      jwtRefreshSecretLength: this.jwtRefreshSecret.length,
      secretsAreDifferent: this.jwtSecret !== this.jwtRefreshSecret
    };
  }
}

// エクスポート
export const securityConfig = SecurityConfig.getInstance();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthTokens, 
  JWTPayload,
  Company,
  RefreshTokenRequest,
  UserRole,
  Permission
} from '../types/auth';
import { UnauthorizedError, AuthenticationError } from '../utils/errors';
import logger from '../config/logger';
import permissionCache from './permissionCacheService';

const prisma = new PrismaClient();

// 環境変数から設定を取得
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
const SALT_ROUNDS = 10;

// リフレッシュトークンの管理（本番環境ではRedisを使用）
const refreshTokenStore = new Map<string, { userId: string; expiresAt: Date }>();

export class AuthService {
  /**
   * ユーザーの権限をデータベースから取得
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // キャッシュから取得を試みる
      const cached = await permissionCache.getUserPermissions(userId);
      if (cached) {
        return cached;
      }

      const userWithRoles = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!userWithRoles) {
        return [];
      }

      // 全ての権限を収集（重複を除去）
      const permissions = new Set<string>();
      userWithRoles.userRoles.forEach(userRole => {
        userRole.role.rolePermissions.forEach(rolePerm => {
          permissions.add(rolePerm.permission.name);
        });
      });

      const permissionArray = Array.from(permissions);
      
      // キャッシュに保存
      await permissionCache.setUserPermissions(userId, permissionArray);
      
      return permissionArray;
    } catch (error) {
      logger.error('Error fetching user permissions:', error);
      return [];
    }
  }

  /**
   * ユーザーのロールをデータベースから取得
   */
  static async getUserRoles(userId: string): Promise<string[]> {
    try {
      // キャッシュから取得を試みる
      const cached = await permissionCache.getUserRoles(userId);
      if (cached) {
        return cached;
      }

      const userRoles = await prisma.userRole.findMany({
        where: { userId: BigInt(userId) },
        include: {
          role: true
        }
      });

      const roles = userRoles.map(ur => ur.role.name);
      
      // キャッシュに保存
      await permissionCache.setUserRoles(userId, roles);
      
      return roles;
    } catch (error) {
      logger.error('Error fetching user roles:', error);
      return [];
    }
  }

  /**
   * ユーザーが特定の権限を持っているかチェック
   */
  static async hasPermission(
    userId: string, 
    resource: string, 
    action: string, 
    scope?: string,
    targetId?: string
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      const roles = await this.getUserRoles(userId);
      
      // スーパー管理者は全権限を持つ
      if (roles.includes('super_admin')) {
        return true;
      }
      
      // 権限の組み合わせパターンをチェック
      const possiblePermissions = [
        `${resource}:${action}:all`, // 全体権限
        `${resource}:${action}`, // スコープなし権限
      ];
      
      // スコープに応じた権限を追加
      if (scope) {
        possiblePermissions.push(`${resource}:${action}:${scope}`);
      }
      
      // 自分のリソースの場合
      if (scope === 'own' && targetId === userId) {
        possiblePermissions.push(`${resource}:${action}:own`);
      }
      
      // 自社のリソースの場合
      if (scope === 'company') {
        const user = await prisma.user.findUnique({
          where: { id: BigInt(userId) },
          select: { companyId: true }
        });
        
        if (targetId && user?.companyId) {
          const target = await prisma.user.findUnique({
            where: { id: BigInt(targetId) },
            select: { companyId: true }
          });
          
          if (target?.companyId === user.companyId) {
            possiblePermissions.push(`${resource}:${action}:company`);
          }
        } else if (user?.companyId) {
          possiblePermissions.push(`${resource}:${action}:company`);
        }
      }
      
      // いずれかの権限を持っているかチェック
      return possiblePermissions.some(perm => permissions.includes(perm));
    } catch (error) {
      logger.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * ユーザーが特定のロールを持っているかチェック
   */
  static async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId);
      return roles.includes(role);
    } catch (error) {
      logger.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * ログイン処理
   */
  static async login(loginRequest: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = loginRequest;

    try {
      // ユーザーを検索
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          company: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user) {
        throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
      }

      // アカウントがロックされているか確認
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        const remainingTime = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 1000 / 60);
        throw new UnauthorizedError(`アカウントがロックされています。${remainingTime}分後に再試行してください`);
      }

      // パスワードの検証
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        // ログイン失敗回数を増やす
        const failedCount = user.failedLoginCount + 1;
        let accountLockedUntil = null;

        // ロック判定
        if (failedCount >= 10 && failedCount < 20) {
          accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30分
        } else if (failedCount >= 20 && failedCount < 30) {
          accountLockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2時間
        } else if (failedCount >= 30) {
          // 管理者によるロック解除が必要
          accountLockedUntil = new Date('2099-12-31');
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: failedCount,
            accountLockedUntil
          }
        });

        throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
      }

      // ログイン成功時の処理
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: 0,
          accountLockedUntil: null,
          lastLoginAt: new Date()
        }
      });

      // 権限とロールを取得
      const permissions = await this.getUserPermissions(user.id.toString());
      const roles = await this.getUserRoles(user.id.toString());

      // JWTトークンの生成
      const tokens = this.generateTokens({
        userId: user.id.toString(),
        email: user.email,
        roles,
        companyId: user.companyId?.toString()
      });

      // ユーザー情報の整形
      const userResponse: User = {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: roles[0] || 'engineer',
        roles,
        permissions: permissions.map((p, index) => ({
          id: `${index + 1}`,
          name: p,
          resource: p.split(':')[0],
          action: p.split(':')[1]
        })),
        companyId: user.companyId?.toString(),
        companyName: user.company?.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      logger.info(`User logged in successfully: ${email}`);
      return { user: userResponse, tokens };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error('Login error:', error);
      throw new Error('ログイン処理中にエラーが発生しました');
    }
  }

  /**
   * ユーザー登録処理
   */
  static async register(registerRequest: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, name, companyId, role = 'engineer' } = registerRequest;

    try {
      // 既存ユーザーのチェック
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('このメールアドレスは既に登録されています');
      }

      // パスワードのハッシュ化
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // トランザクションでユーザー作成とロール割り当て
      const result = await prisma.$transaction(async (tx) => {
        // ユーザー作成
        const user = await tx.users.create({
          data: {
            email,
            passwordHash,
            name,
            companyId: companyId ? BigInt(companyId) : null,
            isActive: true,
            passwordChangedAt: new Date()
          }
        });

        // ロールを取得
        const roleRecord = await tx.roles.findUnique({
          where: { name: role }
        });

        if (!roleRecord) {
          throw new Error(`ロール ${role} が見つかりません`);
        }

        // ユーザーにロールを割り当て
        await tx.user_roles.create({
          data: {
            userId: user.id,
            roleId: roleRecord.id,
            grantedBy: user.id // 自己登録の場合
          }
        });

        return user;
      });

      // 権限とロールを取得
      const permissions = await this.getUserPermissions(result.id.toString());
      const roles = await this.getUserRoles(result.id.toString());

      // 会社情報を取得
      let company: Company | undefined;
      if (companyId) {
        const companyRecord = await prisma.company.findUnique({
          where: { id: BigInt(companyId) }
        });
        if (companyRecord) {
          company = {
            id: companyRecord.id.toString(),
            name: companyRecord.name,
            companyType: companyRecord.companyType
          };
        }
      }

      // JWTトークンの生成
      const tokens = this.generateTokens({
        userId: result.id.toString(),
        email: result.email,
        roles,
        companyId: companyId
      });

      // ユーザー情報の整形
      const userResponse: User = {
        id: result.id.toString(),
        email: result.email,
        name: result.name,
        role: roles[0] || role,
        roles,
        permissions: permissions.map((p, index) => ({
          id: `${index + 1}`,
          name: p,
          resource: p.split(':')[0],
          action: p.split(':')[1]
        })),
        companyId,
        companyName: company?.name,
        isActive: result.isActive,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };

      logger.info(`New user registered: ${email}`);
      return { user: userResponse, tokens };
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ユーザー登録処理中にエラーが発生しました');
    }
  }

  /**
   * リフレッシュトークンによるトークン更新
   */
  static async refreshToken(request: RefreshTokenRequest): Promise<AuthTokens> {
    const { refreshToken } = request;

    try {
      // リフレッシュトークンの検証
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;
      
      // ストアから検証
      const storedToken = refreshTokenStore.get(refreshToken);
      if (!storedToken || storedToken.userId !== decoded.userId) {
        throw new UnauthorizedError('無効なリフレッシュトークンです');
      }

      if (storedToken.expiresAt < new Date()) {
        refreshTokenStore.delete(refreshToken);
        throw new UnauthorizedError('リフレッシュトークンの有効期限が切れています');
      }

      // ユーザー情報を取得
      const user = await prisma.user.findUnique({
        where: { id: BigInt(decoded.userId) }
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError('ユーザーが見つからないか、無効化されています');
      }

      // 新しいロールを取得（権限が変更されている可能性があるため）
      const roles = await this.getUserRoles(decoded.userId);

      // 古いリフレッシュトークンを削除
      refreshTokenStore.delete(refreshToken);

      // 新しいトークンを生成
      const tokens = this.generateTokens({
        userId: decoded.userId,
        email: user.email,
        roles,
        companyId: user.companyId?.toString()
      });

      logger.info(`Token refreshed for user: ${user.email}`);
      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('無効なリフレッシュトークンです');
      }
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error('Token refresh error:', error);
      throw new Error('トークン更新処理中にエラーが発生しました');
    }
  }

  /**
   * ログアウト処理
   */
  static async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      if (refreshToken) {
        refreshTokenStore.delete(refreshToken);
      }
      
      // 全てのリフレッシュトークンを削除（オプション）
      for (const [token, data] of refreshTokenStore.entries()) {
        if (data.userId === userId) {
          refreshTokenStore.delete(token);
        }
      }
      
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw new Error('ログアウト処理中にエラーが発生しました');
    }
  }

  /**
   * トークンの検証
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('トークンの有効期限が切れています');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('無効なトークンです');
      }
      throw new UnauthorizedError('トークンの検証に失敗しました');
    }
  }

  /**
   * トークンの生成
   */
  private static generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });

    // リフレッシュトークンをストアに保存
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    refreshTokenStore.set(refreshToken, {
      userId: payload.userId,
      expiresAt
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
      tokenType: 'Bearer'
    };
  }

  /**
   * パスワードの変更
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) }
      });

      if (!user) {
        throw new UnauthorizedError('ユーザーが見つかりません');
      }

      // 現在のパスワードの検証
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('現在のパスワードが正しくありません');
      }

      // 新しいパスワードのハッシュ化
      const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // パスワードの更新
      await prisma.user.update({
        where: { id: BigInt(userId) },
        data: {
          passwordHash: newPasswordHash,
          passwordChangedAt: new Date()
        }
      });

      // 全てのリフレッシュトークンを無効化
      for (const [token, data] of refreshTokenStore.entries()) {
        if (data.userId === userId) {
          refreshTokenStore.delete(token);
        }
      }

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error('Password change error:', error);
      throw new Error('パスワード変更処理中にエラーが発生しました');
    }
  }

  /**
   * ユーザー情報の取得
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        include: {
          company: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user) {
        return null;
      }

      const permissions = await this.getUserPermissions(userId);
      const roles = await this.getUserRoles(userId);

      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: roles[0] || 'engineer',
        roles,
        permissions: permissions.map((p, index) => ({
          id: `${index + 1}`,
          name: p,
          resource: p.split(':')[0],
          action: p.split(':')[1]
        })),
        companyId: user.companyId?.toString(),
        companyName: user.company?.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      logger.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * ユーザーへのロール割り当て
   */
  static async assignRole(userId: string, roleName: string, grantedBy: string): Promise<void> {
    try {
      const role = await prisma.role.findUnique({
        where: { name: roleName }
      });

      if (!role) {
        throw new Error(`ロール ${roleName} が見つかりません`);
      }

      // 既存のロール割り当てをチェック
      const existing = await prisma.userRole.findFirst({
        where: {
          userId: BigInt(userId),
          roleId: role.id
        }
      });

      if (existing) {
        throw new Error('このロールは既に割り当てられています');
      }

      await prisma.userRole.create({
        data: {
          userId: BigInt(userId),
          roleId: role.id,
          grantedBy: BigInt(grantedBy)
        }
      });

      logger.info(`Role ${roleName} assigned to user ${userId} by ${grantedBy}`);
    } catch (error) {
      logger.error('Role assignment error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ロール割り当て処理中にエラーが発生しました');
    }
  }

  /**
   * ユーザーからのロール削除
   */
  static async removeRole(userId: string, roleName: string): Promise<void> {
    try {
      const role = await prisma.role.findUnique({
        where: { name: roleName }
      });

      if (!role) {
        throw new Error(`ロール ${roleName} が見つかりません`);
      }

      const userRole = await prisma.userRole.findFirst({
        where: {
          userId: BigInt(userId),
          roleId: role.id
        }
      });

      if (!userRole) {
        throw new Error('このロールは割り当てられていません');
      }

      await prisma.userRole.delete({
        where: { id: userRole.id }
      });

      logger.info(`Role ${roleName} removed from user ${userId}`);
    } catch (error) {
      logger.error('Role removal error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('ロール削除処理中にエラーが発生しました');
    }
  }
}

export default AuthService;
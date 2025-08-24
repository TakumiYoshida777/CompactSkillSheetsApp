import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
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
import { logger } from '../config/logger';

// 権限定義
const PERMISSIONS = {
  // ユーザー管理
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // エンジニア管理
  ENGINEER_VIEW: 'engineer:view',
  ENGINEER_CREATE: 'engineer:create',
  ENGINEER_UPDATE: 'engineer:update',
  ENGINEER_DELETE: 'engineer:delete',
  
  // スキルシート管理
  SKILLSHEET_VIEW: 'skillsheet:view',
  SKILLSHEET_CREATE: 'skillsheet:create',
  SKILLSHEET_UPDATE: 'skillsheet:update',
  SKILLSHEET_DELETE: 'skillsheet:delete',
  
  // 会社管理
  COMPANY_VIEW: 'company:view',
  COMPANY_UPDATE: 'company:update',
  
  // オファー管理
  OFFER_VIEW: 'offer:view',
  OFFER_CREATE: 'offer:create',
  OFFER_UPDATE: 'offer:update',
  OFFER_DELETE: 'offer:delete'
};

// ロール定義
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.ENGINEER_VIEW,
    PERMISSIONS.ENGINEER_CREATE,
    PERMISSIONS.ENGINEER_UPDATE,
    PERMISSIONS.SKILLSHEET_VIEW,
    PERMISSIONS.SKILLSHEET_CREATE,
    PERMISSIONS.SKILLSHEET_UPDATE,
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.OFFER_VIEW,
    PERMISSIONS.OFFER_CREATE,
    PERMISSIONS.OFFER_UPDATE
  ],
  sales: [
    PERMISSIONS.ENGINEER_VIEW,
    PERMISSIONS.SKILLSHEET_VIEW,
    PERMISSIONS.OFFER_VIEW,
    PERMISSIONS.OFFER_CREATE,
    PERMISSIONS.OFFER_UPDATE
  ],
  engineer: [
    PERMISSIONS.SKILLSHEET_VIEW,
    PERMISSIONS.SKILLSHEET_UPDATE
  ]
};

// モックデータストア
const mockUsers = new Map<string, User & { passwordHash: string }>();
const mockRefreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

// モックデータの初期化
const initializeMockData = () => {
  // 管理者ユーザー
  const adminPasswordHash = bcrypt.hashSync('password123', 10);
  const adminUser = {
    id: '1',
    email: 'admin@demo-ses.example.com',
    passwordHash: adminPasswordHash,
    name: 'システム管理者',
    role: 'admin' as const,
    companyId: '1',
    companyName: 'デモSES企業',
    isActive: true,
    permissions: Object.values(PERMISSIONS).map((permission, index) => ({
      id: `perm-${index + 1}`,
      name: permission,
      displayName: permission,
      resource: permission.split(':')[0],
      action: permission.split(':')[1]
    })),
    roles: [{
      id: 'role-1',
      name: 'admin',
      displayName: '管理者',
      permissions: Object.values(PERMISSIONS).map((permission, index) => ({
        id: `perm-${index + 1}`,
        name: permission,
        displayName: permission,
        resource: permission.split(':')[0],
        action: permission.split(':')[1]
      }))
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockUsers.set(adminUser.id, adminUser);

  // エンジニアユーザー
  const engineerPasswordHash = bcrypt.hashSync('password123', 10);
  const engineerUser = {
    id: 'engineer-1',
    email: 'engineer@demo.example.com',
    passwordHash: engineerPasswordHash,
    name: 'エンジニア太郎',
    role: 'engineer' as const,
    companyId: '1',
    companyName: 'デモSES企業',
    isActive: true,
    permissions: ROLE_PERMISSIONS['engineer'].map((permission, index) => ({
      id: `perm-eng-${index + 1}`,
      name: permission,
      displayName: permission,
      resource: permission.split(':')[0],
      action: permission.split(':')[1]
    })),
    roles: [{
      id: 'role-3',
      name: 'engineer',
      displayName: 'エンジニア',
      permissions: ROLE_PERMISSIONS['engineer'].map((permission, index) => ({
        id: `perm-eng-${index + 1}`,
        name: permission,
        displayName: permission,
        resource: permission.split(':')[0],
        action: permission.split(':')[1]
      }))
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockUsers.set(engineerUser.id, engineerUser);

  // 営業ユーザー
  const salesPasswordHash = bcrypt.hashSync('password123', 10);
  const salesUser = {
    id: '3',
    email: 'sales@demo-ses.example.com',
    passwordHash: salesPasswordHash,
    name: 'デモ営業',
    role: 'sales' as const,
    companyId: '1',
    companyName: 'デモSES企業',
    isActive: true,
    permissions: ROLE_PERMISSIONS['sales'].map((permission, index) => ({
      id: `perm-sales-${index + 1}`,
      name: permission,
      displayName: permission,
      resource: permission.split(':')[0],
      action: permission.split(':')[1]
    })),
    roles: [{
      id: 'role-4',
      name: 'sales',
      displayName: '営業',
      permissions: ROLE_PERMISSIONS['sales'].map((permission, index) => ({
        id: `perm-sales-${index + 1}`,
        name: permission,
        displayName: permission,
        resource: permission.split(':')[0],
        action: permission.split(':')[1]
      }))
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockUsers.set(salesUser.id, salesUser);
};

// 初期化実行
initializeMockData();

class AuthService {
  /**
   * ログイン処理
   */
  async login(loginRequest: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, rememberMe } = loginRequest;

    // データベースからユーザーを検索
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          company: true
        }
      });
      
      if (dbUser && dbUser.isActive) {
        // データベースユーザーのパスワード検証
        if (!dbUser.passwordHash) {
          throw new UnauthorizedError('パスワードが設定されていません');
        }

        const isPasswordValid = await bcrypt.compare(password, dbUser.passwordHash);
        if (!isPasswordValid) {
          throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
        }

        // Userオブジェクトに変換
        const user: User = {
          id: dbUser.id.toString(),
          email: dbUser.email,
          name: dbUser.name || '',
          role: 'admin', // TODO: ロール管理を実装
          companyId: dbUser.companyId?.toString(),
          companyName: dbUser.company?.name,
          isActive: dbUser.isActive,
          createdAt: dbUser.createdAt.toISOString(),
          updatedAt: dbUser.updatedAt.toISOString()
        };

        // トークン生成
        const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60; // 30日 or 8時間
        const tokens = this.generateTokens(user, expiresIn);

        return { user, tokens };
      }
    } catch (error) {
      logger.error('Database login error:', error);
    }

    // モックデータでフォールバック
    const mockUser = Array.from(mockUsers.values()).find(u => u.email === email);
    if (!mockUser) {
      throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
    }

    // モックユーザーのパスワード検証
    if (!mockUser.passwordHash) {
      throw new UnauthorizedError('パスワードが設定されていません');
    }

    const isPasswordValid = await bcrypt.compare(password, mockUser.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
    }

    // モックユーザーでのトークン生成
    const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60; // 30日 or 8時間
    const tokens = this.generateTokens(mockUser, expiresIn);

    const userWithoutPassword = { ...mockUser };
    delete (userWithoutPassword as any).passwordHash;

    return { user: userWithoutPassword, tokens };
  }

  /**
   * ロール指定ログイン
   */
  async loginWithRole(loginRequest: LoginRequest, requiredRole: string): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await this.login(loginRequest);
    
    // ロールチェック
    const userRole = result.user.roles?.[0]?.name || result.user.role;
    if (userRole !== requiredRole) {
      throw new UnauthorizedError(`このアカウントは${requiredRole}権限を持っていません`);
    }

    return result;
  }

  /**
   * 登録処理
   */
  async register(registerRequest: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, name, companyId } = registerRequest;

    // 既存ユーザーチェック
    const existingUser = Array.from(mockUsers.values()).find(u => u.email === email);
    if (existingUser) {
      throw new AuthenticationError('このメールアドレスは既に登録されています');
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 10);

    // 新規ユーザー作成
    const newUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      name,
      role: 'engineer' as const, // デフォルトロール
      companyId,
      companyName: 'デモSES企業', // TODO: 実際の会社名を取得
      isActive: true,
      permissions: ROLE_PERMISSIONS['engineer'].map((permission, index) => ({
        id: `perm-new-${index + 1}`,
        name: permission,
        displayName: permission,
        resource: permission.split(':')[0],
        action: permission.split(':')[1]
      })),
      roles: [{
        id: 'role-3',
        name: 'engineer',
        displayName: 'エンジニア',
        permissions: ROLE_PERMISSIONS['engineer'].map((permission, index) => ({
          id: `perm-new-${index + 1}`,
          name: permission,
          displayName: permission,
          resource: permission.split(':')[0],
          action: permission.split(':')[1]
        }))
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockUsers.set(newUser.id, newUser);

    // トークン生成
    const tokens = this.generateTokens(newUser, 8 * 60 * 60); // 8時間

    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as any).passwordHash;

    return { user: userWithoutPassword, tokens };
  }

  /**
   * トークンリフレッシュ
   */
  async refreshToken(request: RefreshTokenRequest): Promise<AuthTokens> {
    const { refreshToken } = request;

    // リフレッシュトークンの検証
    const tokenData = mockRefreshTokens.get(refreshToken);
    if (!tokenData) {
      throw new UnauthorizedError('無効なリフレッシュトークンです');
    }

    if (tokenData.expiresAt < new Date()) {
      mockRefreshTokens.delete(refreshToken);
      throw new UnauthorizedError('リフレッシュトークンの有効期限が切れています');
    }

    // ユーザー取得
    const user = await this.getCurrentUser(tokenData.userId);
    if (!user) {
      throw new UnauthorizedError('ユーザーが見つかりません');
    }

    // 古いリフレッシュトークンを削除
    mockRefreshTokens.delete(refreshToken);

    // 新しいトークンを生成
    const tokens = this.generateTokens(user, 8 * 60 * 60); // 8時間

    return tokens;
  }

  /**
   * ログアウト
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      mockRefreshTokens.delete(refreshToken);
    }
  }

  /**
   * 現在のユーザー取得
   */
  async getCurrentUser(userId: string): Promise<User | null> {
    // データベースからユーザーを検索
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        include: {
          company: true
        }
      });

      if (dbUser) {
        return {
          id: dbUser.id.toString(),
          email: dbUser.email,
          name: dbUser.name || '',
          role: 'admin', // TODO: ロール管理を実装
          companyId: dbUser.companyId?.toString(),
          companyName: dbUser.company?.name,
          isActive: dbUser.isActive,
          createdAt: dbUser.createdAt.toISOString(),
          updatedAt: dbUser.updatedAt.toISOString()
        };
      }
    } catch (error) {
      // データベースエラーの場合はモックにフォールバック
      logger.error('Database getCurrentUser error:', error);
    }

    // モックデータにフォールバック
    const user = mockUsers.get(userId);
    if (!user) {
      return null;
    }

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).passwordHash;
    return userWithoutPassword;
  }

  /**
   * JWTトークン検証
   */
  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret') as JWTPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('無効なトークンです');
    }
  }

  /**
   * トークン生成
   */
  private generateTokens(user: User, expiresIn: number): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dev-jwt-secret',
      { expiresIn }
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30日

    // リフレッシュトークンを保存
    mockRefreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: refreshExpiresAt
    });

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * 複数パーミッションチェック
   */
  hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * 全パーミッションチェック
   */
  hasAllPermissions(user: User, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * IDでユーザーを取得
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.getCurrentUser(userId);
  }

  /**
   * パスワード変更
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // データベースからユーザーを検索
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: BigInt(userId) }
      });

      if (dbUser && dbUser.passwordHash) {
        // 現在のパスワードを検証
        const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
        if (!isPasswordValid) {
          throw new UnauthorizedError('現在のパスワードが正しくありません');
        }

        // 新しいパスワードをハッシュ化して更新
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
          where: { id: BigInt(userId) },
          data: { passwordHash: newPasswordHash }
        });
        return;
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      logger.error('Database changePassword error:', error);
    }

    // モックユーザーの場合
    const mockUser = mockUsers.get(userId);
    if (!mockUser) {
      throw new UnauthorizedError('ユーザーが見つかりません');
    }

    // 現在のパスワードを検証
    const isPasswordValid = await bcrypt.compare(currentPassword, mockUser.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('現在のパスワードが正しくありません');
    }

    // 新しいパスワードをハッシュ化
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    mockUser.passwordHash = newPasswordHash;
  }

  /**
   * リソース・アクション形式のパーミッションチェック（オーバーロード）
   */
  hasPermission(user: User, resourceOrPermission: string, action?: string): boolean {
    if (action) {
      // リソースとアクションが分離されている場合
      const permission = `${resourceOrPermission}:${action}`;
      if (user.permissions) {
        return user.permissions.some(p => p.name === permission);
      }
      const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
      return rolePermissions.includes(permission);
    } else {
      // 結合された権限文字列の場合
      if (user.permissions) {
        return user.permissions.some(p => p.name === resourceOrPermission);
      }
      const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
      return rolePermissions.includes(resourceOrPermission);
    }
  }
}

export default new AuthService();
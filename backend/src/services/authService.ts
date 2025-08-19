import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthTokens, 
  JWTPayload,
  Company,
  RefreshTokenData,
  UnauthorizedError,
  USER_ROLES,
  PERMISSIONS
} from '../types/auth';

// 環境変数から設定を読み込み
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '8h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';
const BCRYPT_ROUNDS = 10;

// モックデータストア（本番環境ではデータベースを使用）
const mockUsers: Map<string, User> = new Map();
const mockCompanies: Map<string, Company> = new Map();
const mockRefreshTokens: Map<string, RefreshTokenData> = new Map();

// 初期データの作成
const initializeMockData = () => {
  // デモ用SES企業
  const demoCompany: Company = {
    id: 'company-1',
    name: 'デモSES株式会社',
    companyType: 'ses',
    emailDomain: 'demo-ses.co.jp',
    address: '東京都渋谷区',
    phone: '03-1234-5678',
    websiteUrl: 'https://demo-ses.co.jp',
    contactEmail: 'contact@demo-ses.co.jp',
    maxEngineers: 100,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockCompanies.set(demoCompany.id, demoCompany);

  // デモ用管理者ユーザー
  const adminUser: User = {
    id: 'user-admin-1',
    email: 'admin@demo-ses.co.jp',
    name: '管理者太郎',
    companyId: demoCompany.id,
    roles: [{
      id: 'role-1',
      name: USER_ROLES.ADMIN,
      displayName: '管理者',
      permissions: [
        {
          id: 'perm-1',
          name: PERMISSIONS.USER_VIEW,
          displayName: 'ユーザー閲覧',
          resource: 'user',
          action: 'view'
        },
        {
          id: 'perm-2',
          name: PERMISSIONS.USER_CREATE,
          displayName: 'ユーザー作成',
          resource: 'user',
          action: 'create'
        },
        {
          id: 'perm-3',
          name: PERMISSIONS.USER_UPDATE,
          displayName: 'ユーザー更新',
          resource: 'user',
          action: 'update'
        },
        {
          id: 'perm-4',
          name: PERMISSIONS.USER_DELETE,
          displayName: 'ユーザー削除',
          resource: 'user',
          action: 'delete'
        },
        {
          id: 'perm-5',
          name: PERMISSIONS.ENGINEER_VIEW,
          displayName: 'エンジニア閲覧',
          resource: 'engineer',
          action: 'view'
        },
        {
          id: 'perm-6',
          name: PERMISSIONS.ENGINEER_CREATE,
          displayName: 'エンジニア作成',
          resource: 'engineer',
          action: 'create'
        },
        {
          id: 'perm-7',
          name: PERMISSIONS.COMPANY_VIEW,
          displayName: '企業情報閲覧',
          resource: 'company',
          action: 'view'
        },
        {
          id: 'perm-8',
          name: PERMISSIONS.COMPANY_UPDATE,
          displayName: '企業情報更新',
          resource: 'company',
          action: 'update'
        }
      ],
      isSystem: true
    }],
    permissions: [], // rolesから取得
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // パスワードをハッシュ化（デモ用: password123）
  const hashedPassword = bcrypt.hashSync('password123', BCRYPT_ROUNDS);
  (adminUser as any).passwordHash = hashedPassword;
  
  mockUsers.set(adminUser.id, adminUser);

  // デモ用エンジニアユーザー
  const engineerUser: User = {
    id: 'user-engineer-1',
    email: 'engineer@demo.com',
    name: 'エンジニア太郎',
    companyId: demoCompany.id,
    engineerId: 'engineer-1',
    roles: [{
      id: 'role-engineer-1',
      name: USER_ROLES.ENGINEER,
      displayName: 'エンジニア',
      permissions: [
        {
          id: 'perm-eng-1',
          name: PERMISSIONS.SKILL_SHEET_VIEW,
          displayName: 'スキルシート閲覧',
          resource: 'skill_sheet',
          action: 'view'
        },
        {
          id: 'perm-eng-2',
          name: PERMISSIONS.SKILL_SHEET_UPDATE,
          displayName: 'スキルシート更新',
          resource: 'skill_sheet',
          action: 'update'
        }
      ],
      isSystem: false
    }],
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  (engineerUser as any).passwordHash = hashedPassword;
  mockUsers.set(engineerUser.id, engineerUser);

  // デモエンジニアA: 全クライアント対応可能
  const demoEngineerA: User = {
    id: 'user-demo-engineer-a',
    email: 'demo-engineer-a@example.com',
    name: 'デモエンジニアA',
    companyId: demoCompany.id,
    engineerId: 'engineer-demo-a',
    roles: [{
      id: 'role-demo-engineer-a',
      name: USER_ROLES.ENGINEER,
      displayName: 'エンジニア',
      permissions: [
        {
          id: 'perm-demo-eng-a-1',
          name: PERMISSIONS.SKILL_SHEET_VIEW,
          displayName: 'スキルシート閲覧',
          resource: 'skill_sheet',
          action: 'view'
        },
        {
          id: 'perm-demo-eng-a-2',
          name: PERMISSIONS.SKILL_SHEET_UPDATE,
          displayName: 'スキルシート更新',
          resource: 'skill_sheet',
          action: 'update'
        }
      ],
      isSystem: false
    }],
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // DemoPass123! のハッシュ
  (demoEngineerA as any).passwordHash = '$2b$10$jxpI2aT/wIx7CsNFvIHqIuNVxvFxdvxOeY4jEbktY.Fz/5.32IF2y';
  mockUsers.set(demoEngineerA.id, demoEngineerA);

  // デモエンジニアB: 待機中ステータス
  const demoEngineerB: User = {
    id: 'user-demo-engineer-b',
    email: 'demo-engineer-b@example.com',
    name: 'デモエンジニアB',
    companyId: demoCompany.id,
    engineerId: 'engineer-demo-b',
    roles: [{
      id: 'role-demo-engineer-b',
      name: USER_ROLES.ENGINEER,
      displayName: 'エンジニア',
      permissions: [
        {
          id: 'perm-demo-eng-b-1',
          name: PERMISSIONS.SKILL_SHEET_VIEW,
          displayName: 'スキルシート閲覧',
          resource: 'skill_sheet',
          action: 'view'
        },
        {
          id: 'perm-demo-eng-b-2',
          name: PERMISSIONS.SKILL_SHEET_UPDATE,
          displayName: 'スキルシート更新',
          resource: 'skill_sheet',
          action: 'update'
        }
      ],
      isSystem: false
    }],
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // DemoPass123! のハッシュ
  (demoEngineerB as any).passwordHash = '$2b$10$jxpI2aT/wIx7CsNFvIHqIuNVxvFxdvxOeY4jEbktY.Fz/5.32IF2y';
  mockUsers.set(demoEngineerB.id, demoEngineerB);

  // デモ用営業ユーザー
  const salesUser: User = {
    id: 'user-sales-1',
    email: 'sales@demo-ses.co.jp',
    name: '営業花子',
    companyId: demoCompany.id,
    roles: [{
      id: 'role-sales-1',
      name: USER_ROLES.SALES,
      displayName: '営業',
      permissions: [
        {
          id: 'perm-sales-1',
          name: PERMISSIONS.ENGINEER_VIEW,
          displayName: 'エンジニア閲覧',
          resource: 'engineer',
          action: 'view'
        },
        {
          id: 'perm-sales-2',
          name: PERMISSIONS.CLIENT_VIEW,
          displayName: '取引先閲覧',
          resource: 'client',
          action: 'view'
        },
        {
          id: 'perm-sales-3',
          name: PERMISSIONS.CLIENT_CREATE,
          displayName: '取引先作成',
          resource: 'client',
          action: 'create'
        }
      ],
      isSystem: false
    }],
    permissions: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  (salesUser as any).passwordHash = hashedPassword;
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

    // ユーザーをメールアドレスで検索
    const user = Array.from(mockUsers.values()).find(u => u.email === email);
    
    if (!user) {
      throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
    }

    // パスワード検証
    const passwordHash = (user as any).passwordHash;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
    }

    // アカウントが有効か確認
    if (!user.isActive) {
      throw new UnauthorizedError('アカウントが無効化されています');
    }

    // トークン生成
    const tokens = await this.generateTokens(user, rememberMe);

    // パスワードハッシュを除外してユーザー情報を返す
    const userWithoutPassword = { ...user };
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
   * 新規登録処理
   */
  async register(registerRequest: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, name, companyName, phone } = registerRequest;

    // 既存ユーザーチェック
    const existingUser = Array.from(mockUsers.values()).find(u => u.email === email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    // 企業作成または既存企業の取得
    let company: Company;
    if (companyName) {
      // 新規企業作成
      company = {
        id: `company-${Date.now()}`,
        name: companyName,
        companyType: 'ses',
        phone,
        maxEngineers: 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanies.set(company.id, company);
    } else {
      // デフォルト企業を使用
      company = mockCompanies.get('company-1')!;
    }

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // 新規ユーザー作成
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      companyId: company.id,
      roles: [{
        id: 'role-2',
        name: USER_ROLES.MANAGER,
        displayName: 'マネージャー',
        permissions: [
          {
            id: 'perm-9',
            name: PERMISSIONS.ENGINEER_VIEW,
            displayName: 'エンジニア閲覧',
            resource: 'engineer',
            action: 'view'
          },
          {
            id: 'perm-10',
            name: PERMISSIONS.ENGINEER_CREATE,
            displayName: 'エンジニア作成',
            resource: 'engineer',
            action: 'create'
          }
        ],
        isSystem: false
      }],
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (newUser as any).passwordHash = passwordHash;
    mockUsers.set(newUser.id, newUser);

    // トークン生成
    const tokens = await this.generateTokens(newUser);

    // パスワードハッシュを除外してユーザー情報を返す
    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as any).passwordHash;

    return { user: userWithoutPassword, tokens };
  }

  /**
   * リフレッシュトークンによるアクセストークン更新
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const tokenData = mockRefreshTokens.get(refreshToken);
    
    if (!tokenData) {
      throw new UnauthorizedError('無効なリフレッシュトークンです');
    }

    if (new Date() > tokenData.expiresAt) {
      mockRefreshTokens.delete(refreshToken);
      throw new UnauthorizedError('リフレッシュトークンの有効期限が切れています');
    }

    const user = mockUsers.get(tokenData.userId);
    if (!user) {
      throw new UnauthorizedError('ユーザーが見つかりません');
    }

    // 古いリフレッシュトークンを削除
    mockRefreshTokens.delete(refreshToken);

    // 新しいトークンを生成
    return await this.generateTokens(user);
  }

  /**
   * ログアウト処理
   */
  async logout(refreshToken: string): Promise<void> {
    mockRefreshTokens.delete(refreshToken);
  }

  /**
   * トークン検証
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      // ユーザーの有効性確認
      const user = mockUsers.get(decoded.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('ユーザーが無効です');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('トークンの有効期限が切れています');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('無効なトークンです');
      }
      throw error;
    }
  }

  /**
   * ユーザー情報取得
   */
  async getUserById(userId: string): Promise<User | null> {
    const user = mockUsers.get(userId);
    if (!user) return null;

    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).passwordHash;
    return userWithoutPassword;
  }

  /**
   * JWT トークン生成
   */
  private async generateTokens(user: User, rememberMe: boolean = false): Promise<AuthTokens> {
    // 権限情報を収集
    const permissions = user.roles.flatMap(role => 
      role.permissions.map(perm => perm.name)
    );

    const payload: JWTPayload = {
      userId: user.id,
      companyId: user.companyId,
      email: user.email,
      roles: user.roles.map(r => r.name),
      permissions,
      iss: 'engineer-skillsheet-system',
      aud: 'engineer-skillsheet-client',
    };

    // アクセストークン生成
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: rememberMe ? '30d' : JWT_EXPIRY,
    });

    // リフレッシュトークン生成
    const refreshTokenStr = crypto.randomBytes(64).toString('hex');
    const refreshExpiry = rememberMe ? 90 : 30; // 日数

    const refreshTokenData: RefreshTokenData = {
      id: `refresh-${Date.now()}`,
      token: refreshTokenStr,
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshExpiry * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    mockRefreshTokens.set(refreshTokenStr, refreshTokenData);

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60, // 秒単位
    };
  }

  /**
   * パスワード変更
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = mockUsers.get(userId);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    const passwordHash = (user as any).passwordHash;
    const isPasswordValid = await bcrypt.compare(currentPassword, passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('現在のパスワードが正しくありません');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    (user as any).passwordHash = newPasswordHash;
    user.updatedAt = new Date();
  }

  /**
   * 権限チェック
   */
  hasPermission(user: User, resource: string, action: string): boolean {
    return user.roles.some(role =>
      role.permissions.some(perm =>
        perm.resource === resource && perm.action === action
      )
    );
  }

  /**
   * 管理者権限チェック
   */
  isAdmin(user: User): boolean {
    return user.roles.some(role => 
      role.name === USER_ROLES.ADMIN || role.name === USER_ROLES.SUPER_ADMIN
    );
  }
}

export const authService = new AuthService();

// モックデータストアをエクスポート（companyServiceから参照できるように）
export { mockCompanies, mockUsers };
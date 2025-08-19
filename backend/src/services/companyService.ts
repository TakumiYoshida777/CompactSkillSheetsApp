import { Company, User, USER_ROLES } from '../types/auth';
import { authService, mockCompanies, mockUsers } from './authService';
import bcrypt from 'bcrypt';

interface CreateCompanyRequest {
  name: string;
  companyType: 'ses' | 'client';
  emailDomain?: string;
  address?: string;
  phone?: string;
  websiteUrl?: string;
  contactEmail?: string;
  maxEngineers?: number;
  adminUser: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  };
}

interface UpdateCompanyRequest {
  name?: string;
  emailDomain?: string;
  address?: string;
  phone?: string;
  websiteUrl?: string;
  contactEmail?: string;
  maxEngineers?: number;
  isActive?: boolean;
}

// authServiceからモックデータストアを使用
const BCRYPT_ROUNDS = 10;

class CompanyService {
  /**
   * 企業作成（管理者ユーザー含む）
   */
  async createCompany(request: CreateCompanyRequest): Promise<{
    company: Company;
    adminUser: User;
  }> {
    // 企業名の重複チェック
    const existingCompany = Array.from(mockCompanies.values()).find(
      c => c.name === request.name
    );
    if (existingCompany) {
      throw new Error('この企業名は既に登録されています');
    }

    // メールアドレスの重複チェック
    const existingUser = Array.from(mockUsers.values()).find(
      u => u.email === request.adminUser.email
    );
    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    // 新規企業作成
    const company: Company = {
      id: `company-${Date.now()}`,
      name: request.name,
      companyType: request.companyType,
      emailDomain: request.emailDomain,
      address: request.address,
      phone: request.phone,
      websiteUrl: request.websiteUrl,
      contactEmail: request.contactEmail || request.adminUser.email,
      maxEngineers: request.maxEngineers || 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCompanies.set(company.id, company);

    // 管理者ユーザー作成
    const passwordHash = await bcrypt.hash(request.adminUser.password, BCRYPT_ROUNDS);
    const adminUser: User = {
      id: `user-${Date.now()}`,
      email: request.adminUser.email,
      name: request.adminUser.name,
      companyId: company.id,
      roles: [{
        id: 'role-admin',
        name: USER_ROLES.ADMIN,
        displayName: '管理者',
        permissions: [
          {
            id: 'perm-all',
            name: 'all',
            displayName: '全権限',
            resource: '*',
            action: '*'
          }
        ],
        isSystem: true
      }],
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (adminUser as any).passwordHash = passwordHash;
    mockUsers.set(adminUser.id, adminUser);

    // パスワードハッシュを除外して返す
    const adminUserWithoutPassword = { ...adminUser };
    delete (adminUserWithoutPassword as any).passwordHash;

    return {
      company,
      adminUser: adminUserWithoutPassword
    };
  }

  /**
   * 企業情報取得
   */
  async getCompanyById(companyId: string): Promise<Company | null> {
    return mockCompanies.get(companyId) || null;
  }

  /**
   * 企業一覧取得（管理者用）
   */
  async getAllCompanies(filters?: {
    companyType?: 'ses' | 'client';
    isActive?: boolean;
  }): Promise<Company[]> {
    let companies = Array.from(mockCompanies.values());

    if (filters?.companyType) {
      companies = companies.filter(c => c.companyType === filters.companyType);
    }

    if (filters?.isActive !== undefined) {
      companies = companies.filter(c => c.isActive === filters.isActive);
    }

    return companies;
  }

  /**
   * 企業情報更新
   */
  async updateCompany(
    companyId: string,
    updates: UpdateCompanyRequest
  ): Promise<Company> {
    const company = mockCompanies.get(companyId);
    if (!company) {
      throw new Error('企業が見つかりません');
    }

    // 更新
    Object.assign(company, {
      ...updates,
      updatedAt: new Date()
    });

    return company;
  }

  /**
   * 企業削除（論理削除）
   */
  async deleteCompany(companyId: string): Promise<void> {
    const company = mockCompanies.get(companyId);
    if (!company) {
      throw new Error('企業が見つかりません');
    }

    company.isActive = false;
    company.updatedAt = new Date();

    // 関連ユーザーも無効化
    const users = Array.from(mockUsers.values()).filter(
      u => u.companyId === companyId
    );
    users.forEach(user => {
      user.isActive = false;
      user.updatedAt = new Date();
    });
  }

  /**
   * 企業のユーザー一覧取得
   */
  async getCompanyUsers(companyId: string): Promise<User[]> {
    const users = Array.from(mockUsers.values()).filter(
      u => u.companyId === companyId && u.isActive
    );

    // パスワードハッシュを除外
    return users.map(user => {
      const userWithoutPassword = { ...user };
      delete (userWithoutPassword as any).passwordHash;
      return userWithoutPassword;
    });
  }

  /**
   * 企業にユーザー追加
   */
  async addUserToCompany(
    companyId: string,
    userData: {
      email: string;
      password: string;
      name: string;
      role: string;
    }
  ): Promise<User> {
    const company = mockCompanies.get(companyId);
    if (!company) {
      throw new Error('企業が見つかりません');
    }

    // メールアドレスの重複チェック
    const existingUser = Array.from(mockUsers.values()).find(
      u => u.email === userData.email
    );
    if (existingUser) {
      throw new Error('このメールアドレスは既に使用されています');
    }

    // ユーザー作成
    const passwordHash = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      companyId,
      roles: [{
        id: `role-${userData.role}`,
        name: userData.role,
        displayName: userData.role === USER_ROLES.MANAGER ? 'マネージャー' : 
                     userData.role === USER_ROLES.SALES ? '営業' : 
                     userData.role === USER_ROLES.ENGINEER ? 'エンジニア' : userData.role,
        permissions: this.getRolePermissions(userData.role),
        isSystem: false
      }],
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (newUser as any).passwordHash = passwordHash;
    mockUsers.set(newUser.id, newUser);

    // パスワードハッシュを除外して返す
    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as any).passwordHash;
    return userWithoutPassword;
  }

  /**
   * ロールに応じた権限を返す
   */
  private getRolePermissions(role: string) {
    switch (role) {
      case USER_ROLES.ADMIN:
        return [
          { id: 'perm-all', name: 'all', displayName: '全権限', resource: '*', action: '*' }
        ];
      case USER_ROLES.MANAGER:
        return [
          { id: 'perm-1', name: 'engineer:view', displayName: 'エンジニア閲覧', resource: 'engineer', action: 'view' },
          { id: 'perm-2', name: 'engineer:create', displayName: 'エンジニア作成', resource: 'engineer', action: 'create' },
          { id: 'perm-3', name: 'engineer:update', displayName: 'エンジニア更新', resource: 'engineer', action: 'update' },
          { id: 'perm-4', name: 'project:view', displayName: 'プロジェクト閲覧', resource: 'project', action: 'view' },
          { id: 'perm-5', name: 'project:create', displayName: 'プロジェクト作成', resource: 'project', action: 'create' }
        ];
      case USER_ROLES.SALES:
        return [
          { id: 'perm-6', name: 'engineer:view', displayName: 'エンジニア閲覧', resource: 'engineer', action: 'view' },
          { id: 'perm-7', name: 'offer:view', displayName: 'オファー閲覧', resource: 'offer', action: 'view' },
          { id: 'perm-8', name: 'offer:create', displayName: 'オファー作成', resource: 'offer', action: 'create' }
        ];
      case USER_ROLES.ENGINEER:
        return [
          { id: 'perm-9', name: 'engineer:view:self', displayName: '自身の情報閲覧', resource: 'engineer', action: 'view:self' },
          { id: 'perm-10', name: 'engineer:update:self', displayName: '自身の情報更新', resource: 'engineer', action: 'update:self' }
        ];
      default:
        return [];
    }
  }

  /**
   * 企業統計情報取得
   */
  async getCompanyStatistics(companyId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalEngineers: number;
    maxEngineers: number;
    usageRate: number;
  }> {
    const company = mockCompanies.get(companyId);
    if (!company) {
      throw new Error('企業が見つかりません');
    }

    const users = Array.from(mockUsers.values()).filter(
      u => u.companyId === companyId
    );
    const activeUsers = users.filter(u => u.isActive);
    const engineers = users.filter(u => 
      u.roles.some(r => r.name === USER_ROLES.ENGINEER)
    );

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalEngineers: engineers.length,
      maxEngineers: company.maxEngineers,
      usageRate: (engineers.length / company.maxEngineers) * 100
    };
  }
}

export const companyService = new CompanyService();
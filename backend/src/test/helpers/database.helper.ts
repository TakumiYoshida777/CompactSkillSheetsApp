import { PrismaClient } from '@prisma/client';
import { infoLog, errorLog, warnLog } from '../../utils/logger';
import { execSync } from 'child_process';
import bcrypt from 'bcrypt';

/**
 * テストデータベースヘルパークラス
 * テスト環境のセットアップとクリーンアップを管理
 */
export class TestDatabase {
  private static instance: TestDatabase;
  private prisma: PrismaClient;
  
  private constructor() {
    // テスト環境用のPrismaClient初期化
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'postgresql://skillsheet:password@localhost:5432/skillsheet_test'
        }
      }
    });
  }
  
  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): TestDatabase {
    if (!this.instance) {
      this.instance = new TestDatabase();
    }
    return this.instance;
  }
  
  /**
   * Prismaクライアントを取得
   */
  getClient(): PrismaClient {
    return this.prisma;
  }
  
  /**
   * テストデータベースのセットアップ
   */
  async setup(): Promise<void> {
    try {
      // データベース接続確認
      await this.prisma.$connect();
      
      // マイグレーション実行
      infoLog('Running migrations for test database...');
      execSync('npx prisma migrate deploy', {
        env: {
          ...process.env,
          DATABASE_URL: process.env.TEST_DATABASE_URL
        }
      });
      
      infoLog('Test database setup completed');
    } catch (error) {
      errorLog('Failed to setup test database:', error);
      throw error;
    }
  }
  
  /**
   * テスト用の基本データを投入
   */
  async seed(options: {
    companyId?: number;
    userId?: number;
    engineerCount?: number;
  } = {}): Promise<{
    company: any;
    user: any;
    engineers: any[];
  }> {
    const { companyId = 1, userId = 1, engineerCount = 5 } = options;
    
    // 会社データ作成
    const company = await this.prisma.company.create({
      data: {
        id: BigInt(companyId),
        companyType: 'SES',
        name: 'テスト企業',
        emailDomain: 'test.example.com',
        contactEmail: 'contact@test.example.com',
        maxEngineers: 100
      }
    });
    
    // ユーザーデータ作成
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await this.prisma.user.create({
      data: {
        id: BigInt(userId),
        companyId: BigInt(companyId),
        email: 'test@test.example.com',
        passwordHash,
        name: 'テストユーザー',
        phone: '090-1234-5678'
      }
    });
    
    // ロールデータ作成
    const role = await this.prisma.role.create({
      data: {
        name: 'admin',
        displayName: '管理者',
        description: 'システム管理者権限'
      }
    });
    
    // ユーザーロール割り当て
    await this.prisma.userRole.create({
      data: {
        userId: BigInt(userId),
        roleId: role.id,
        grantedBy: BigInt(userId)
      }
    });
    
    // エンジニアデータ作成
    const engineers = [];
    for (let i = 1; i <= engineerCount; i++) {
      const engineer = await this.prisma.engineer.create({
        data: {
          companyId: BigInt(companyId),
          employeeNumber: `EMP${String(i).padStart(4, '0')}`,
          lastName: `テスト${i}`,
          firstName: `太郎${i}`,
          lastNameKana: `テスト${i}`,
          firstNameKana: `タロウ${i}`,
          email: `engineer${i}@test.example.com`,
          phone: `090-${String(1000 + i).padStart(4, '0')}-${String(5000 + i).padStart(4, '0')}`,
          gender: 'MALE',
          birthDate: new Date('1990-01-01'),
          age: 33,
          nationality: '日本',
          nearestStation: '東京駅',
          engineerType: 'EMPLOYEE',
          contractType: 'PERMANENT',
          status: 'AVAILABLE',
          joinDate: new Date('2020-04-01'),
          yearsOfExperience: 10
        }
      });
      engineers.push(engineer);
      
      // スキルシート作成
      await this.prisma.skillSheet.create({
        data: {
          engineerId: engineer.id,
          selfPr: `${engineer.lastName}${engineer.firstName}の自己PR`,
          specialization: 'Webアプリケーション開発',
          qualification: '基本情報技術者',
          programmingLanguages: JSON.stringify(['JavaScript', 'TypeScript', 'Python']),
          frameworks: JSON.stringify(['React', 'Node.js', 'Django']),
          databases: JSON.stringify(['PostgreSQL', 'MongoDB']),
          cloudServices: JSON.stringify(['AWS', 'GCP']),
          tools: JSON.stringify(['Git', 'Docker', 'Jenkins']),
          os: JSON.stringify(['Linux', 'Windows', 'macOS']),
          languages: JSON.stringify([{ language: '日本語', level: 'ネイティブ' }, { language: '英語', level: '日常会話' }]),
          isCompleted: true
        }
      });
    }
    
    return {
      company: this.serializeBigInt(company),
      user: this.serializeBigInt(user),
      engineers: engineers.map(e => this.serializeBigInt(e))
    };
  }
  
  /**
   * 特定のテーブルをクリーンアップ
   */
  async cleanupTable(tableName: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE`);
  }
  
  /**
   * 全テーブルをクリーンアップ
   */
  async cleanup(): Promise<void> {
    const tables = [
      'periodic_approaches',
      'email_logs',
      'email_templates',
      'approaches',
      'project_assignments',
      'engineer_projects',
      'projects',
      'skill_sheets',
      'engineers',
      'user_roles',
      'users',
      'companies'
    ];
    
    for (const table of tables) {
      try {
        await this.cleanupTable(table);
      } catch (error) {
        warnLog(`Failed to cleanup ${table}:`, error);
      }
    }
  }
  
  /**
   * データベース接続を終了
   */
  async teardown(): Promise<void> {
    await this.prisma.$disconnect();
  }
  
  /**
   * トランザクション実行
   */
  async transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
  
  /**
   * BigIntをJSONシリアライズ可能な形式に変換
   */
  private serializeBigInt(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }
  
  /**
   * テスト用のプロジェクトデータを作成
   */
  async createTestProject(companyId: number, engineerIds: number[]): Promise<any> {
    const project = await this.prisma.project.create({
      data: {
        companyId: BigInt(companyId),
        name: 'テストプロジェクト',
        clientCompany: 'テストクライアント株式会社',
        status: 'ACTIVE',
        startDate: new Date(),
        plannedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90日後
        contractType: 'SES',
        monthlyRate: 800000,
        requiredEngineers: engineerIds.length,
        description: 'テスト用プロジェクト',
        requiredSkills: JSON.stringify(['JavaScript', 'React', 'Node.js'])
      }
    });
    
    // エンジニアをアサイン
    for (const engineerId of engineerIds) {
      await this.prisma.projectAssignment.create({
        data: {
          projectId: project.id,
          engineerId: BigInt(engineerId),
          role: 'Developer',
          startDate: new Date(),
          allocationPercentage: 100,
          status: 'ASSIGNED'
        }
      });
    }
    
    return this.serializeBigInt(project);
  }
  
  /**
   * テスト用のアプローチデータを作成
   */
  async createTestApproach(fromCompanyId: number, toCompanyId: number, userId: number): Promise<any> {
    const approach = await this.prisma.approach.create({
      data: {
        fromCompanyId: BigInt(fromCompanyId),
        toCompanyId: BigInt(toCompanyId),
        approachType: 'COMPANY',
        status: 'SENT',
        sentBy: BigInt(userId),
        sentAt: new Date(),
        messageContent: 'テストアプローチメッセージ',
        targetEngineers: JSON.stringify([1, 2, 3])
      }
    });
    
    return this.serializeBigInt(approach);
  }
}
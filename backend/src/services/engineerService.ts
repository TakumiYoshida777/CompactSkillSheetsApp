import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export interface EngineerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  experienceYears: number;
  skills: string[];
  availability: 'available' | 'engaged' | 'unavailable';
  bio?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  certifications?: string[];
  preferredRoles?: string[];
  preferredPhases?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEngineerProfileDto {
  name: string;
  email: string;
  phoneNumber?: string;
  experienceYears?: number;
  skills?: string[];
  availability?: 'available' | 'engaged' | 'unavailable';
  bio?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  certifications?: string[];
  preferredRoles?: string[];
  preferredPhases?: string[];
}

export interface UpdateEngineerProfileDto {
  name?: string;
  phoneNumber?: string;
  experienceYears?: number;
  skills?: string[];
  availability?: 'available' | 'engaged' | 'unavailable';
  bio?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  certifications?: string[];
  preferredRoles?: string[];
  preferredPhases?: string[];
}

// モックデータストア（本番環境ではPrismaを使用）
const mockEngineers: Map<string, EngineerProfile> = new Map();

// デモ用エンジニアプロフィール作成
const initializeMockEngineers = () => {
  const demoEngineer: EngineerProfile = {
    id: 'engineer-1',
    userId: 'user-engineer-1',
    name: 'エンジニア太郎',
    email: 'engineer@demo.com',
    phoneNumber: '090-1234-5678',
    experienceYears: 5,
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    availability: 'available',
    bio: 'フルスタックエンジニアとして5年の経験があります。',
    githubUrl: 'https://github.com/demo-engineer',
    portfolioUrl: 'https://portfolio.demo-engineer.com',
    certifications: ['AWS Certified Solutions Architect'],
    preferredRoles: ['PG', 'PL'],
    preferredPhases: ['詳細設計', '開発', 'テスト'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockEngineers.set(demoEngineer.id, demoEngineer);
};

// 初期化実行
initializeMockEngineers();

class EngineerService {
  /**
   * エンジニアプロフィール作成
   */
  async createEngineerProfile(userId: string, data: CreateEngineerProfileDto): Promise<EngineerProfile> {
    const engineerId = `engineer-${Date.now()}`;
    
    const newEngineer: EngineerProfile = {
      id: engineerId,
      userId,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      experienceYears: data.experienceYears || 0,
      skills: data.skills || [],
      availability: data.availability || 'available',
      bio: data.bio,
      githubUrl: data.githubUrl,
      portfolioUrl: data.portfolioUrl,
      certifications: data.certifications || [],
      preferredRoles: data.preferredRoles || [],
      preferredPhases: data.preferredPhases || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockEngineers.set(engineerId, newEngineer);

    // authServiceのユーザーにengineerId を追加
    // 本番環境では、データベーストランザクションで処理
    return newEngineer;
  }

  /**
   * エンジニアプロフィール取得
   */
  async getEngineerProfile(engineerId: string): Promise<EngineerProfile | null> {
    return mockEngineers.get(engineerId) || null;
  }

  /**
   * ユーザーIDでエンジニアプロフィール取得
   */
  async getEngineerProfileByUserId(userId: string): Promise<EngineerProfile | null> {
    const engineers = Array.from(mockEngineers.values());
    return engineers.find(e => e.userId === userId) || null;
  }

  /**
   * エンジニアプロフィール更新
   */
  async updateEngineerProfile(engineerId: string, data: UpdateEngineerProfileDto): Promise<EngineerProfile> {
    const engineer = mockEngineers.get(engineerId);
    
    if (!engineer) {
      throw new Error('エンジニアプロフィールが見つかりません');
    }

    const updatedEngineer: EngineerProfile = {
      ...engineer,
      ...data,
      updatedAt: new Date(),
    };

    mockEngineers.set(engineerId, updatedEngineer);
    return updatedEngineer;
  }

  /**
   * エンジニアプロフィール削除
   */
  async deleteEngineerProfile(engineerId: string): Promise<void> {
    mockEngineers.delete(engineerId);
  }

  /**
   * 全エンジニア取得（ページネーション対応）
   */
  async getAllEngineers(options?: {
    skip?: number;
    take?: number;
    availability?: 'available' | 'engaged' | 'unavailable';
  }): Promise<{ engineers: EngineerProfile[]; total: number }> {
    let engineers = Array.from(mockEngineers.values());

    // フィルタリング
    if (options?.availability) {
      engineers = engineers.filter(e => e.availability === options.availability);
    }

    const total = engineers.length;

    // ページネーション
    if (options?.skip !== undefined && options?.take !== undefined) {
      engineers = engineers.slice(options.skip, options.skip + options.take);
    }

    return { engineers, total };
  }

  /**
   * スキルで検索
   */
  async searchBySkills(skills: string[]): Promise<EngineerProfile[]> {
    const engineers = Array.from(mockEngineers.values());
    
    return engineers.filter(engineer => 
      skills.some(skill => 
        engineer.skills.some(engineerSkill => 
          engineerSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }

  /**
   * 経験年数で検索
   */
  async searchByExperience(minYears: number, maxYears?: number): Promise<EngineerProfile[]> {
    const engineers = Array.from(mockEngineers.values());
    
    return engineers.filter(engineer => {
      if (maxYears) {
        return engineer.experienceYears >= minYears && engineer.experienceYears <= maxYears;
      }
      return engineer.experienceYears >= minYears;
    });
  }

  /**
   * スキルシート情報取得
   */
  async getSkillSheet(engineerId: string): Promise<any> {
    const engineer = mockEngineers.get(engineerId);
    
    if (!engineer) {
      throw new Error('エンジニアが見つかりません');
    }

    // スキルシート形式に変換
    return {
      basicInfo: {
        name: engineer.name,
        email: engineer.email,
        phoneNumber: engineer.phoneNumber,
        experienceYears: engineer.experienceYears,
        bio: engineer.bio,
        githubUrl: engineer.githubUrl,
        portfolioUrl: engineer.portfolioUrl,
      },
      technicalSkills: {
        programmingLanguages: engineer.skills.filter(s => 
          ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Ruby', 'PHP'].includes(s)
        ),
        frameworks: engineer.skills.filter(s => 
          ['React', 'Angular', 'Vue.js', 'Next.js', 'Express', 'Django', 'Spring'].includes(s)
        ),
        databases: engineer.skills.filter(s => 
          ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle'].includes(s)
        ),
        tools: engineer.skills.filter(s => 
          !['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Ruby', 'PHP',
            'React', 'Angular', 'Vue.js', 'Next.js', 'Express', 'Django', 'Spring',
            'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle'].includes(s)
        ),
      },
      certifications: engineer.certifications,
      preferredRoles: engineer.preferredRoles,
      preferredPhases: engineer.preferredPhases,
      availability: engineer.availability,
      updatedAt: engineer.updatedAt,
    };
  }

  /**
   * スキルシート更新
   */
  async updateSkillSheet(engineerId: string, skillSheetData: any): Promise<any> {
    const engineer = mockEngineers.get(engineerId);
    
    if (!engineer) {
      throw new Error('エンジニアが見つかりません');
    }

    // スキルシートデータからプロフィールデータに変換
    const updateData: UpdateEngineerProfileDto = {
      name: skillSheetData.basicInfo?.name,
      phoneNumber: skillSheetData.basicInfo?.phoneNumber,
      experienceYears: skillSheetData.basicInfo?.experienceYears,
      bio: skillSheetData.basicInfo?.bio,
      githubUrl: skillSheetData.basicInfo?.githubUrl,
      portfolioUrl: skillSheetData.basicInfo?.portfolioUrl,
      skills: [
        ...(skillSheetData.technicalSkills?.programmingLanguages || []),
        ...(skillSheetData.technicalSkills?.frameworks || []),
        ...(skillSheetData.technicalSkills?.databases || []),
        ...(skillSheetData.technicalSkills?.tools || []),
      ],
      certifications: skillSheetData.certifications,
      preferredRoles: skillSheetData.preferredRoles,
      preferredPhases: skillSheetData.preferredPhases,
      availability: skillSheetData.availability,
    };

    await this.updateEngineerProfile(engineerId, updateData);
    return this.getSkillSheet(engineerId);
  }
}

export const engineerService = new EngineerService();
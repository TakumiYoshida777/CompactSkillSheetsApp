import { PrismaClient, Engineer, SkillSheet, Prisma, EngineerStatus } from '@prisma/client';
import { AppError } from '../utils/error.handler';
import logger from '../config/logger';

interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

interface SearchCriteria {
  query?: string;
  skills?: string[];
  status?: string;
  yearsOfExperience?: number;
}

export class EngineerService {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async checkEmailExists(email: string, companyId: number | string): Promise<boolean> {
    try {
      // companyIdを数値に変換
      let numericCompanyId: number;
      if (typeof companyId === 'string') {
        const match = companyId.match(/\d+/);
        numericCompanyId = match ? parseInt(match[0], 10) : 1;
      } else {
        numericCompanyId = companyId;
      }
      
      const count = await this.prisma.engineer.count({
        where: {
          email: email.toLowerCase(),
          companyId: BigInt(numericCompanyId)
        }
      });
      return count > 0;
    } catch (error) {
      logger.error('メールアドレス確認エラー:', error);
      throw new AppError('メールアドレスの確認に失敗しました', 500);
    }
  }
  
  async findAll(companyId: number | string, pagination: PaginationOptions, filters: any) {
    try {
      // companyIdを数値に変換（"company-1"のような文字列の場合は1を抽出）
      let numericCompanyId: number;
      if (typeof companyId === 'string') {
        // "company-1" から数値部分を抽出
        const match = companyId.match(/\d+/);
        numericCompanyId = match ? parseInt(match[0], 10) : 1;
      } else {
        numericCompanyId = companyId;
      }
      
      const where: Prisma.EngineerWhereInput = {
        companyId: BigInt(numericCompanyId)
      };
      
      if (filters.status) {
        where.currentStatus = filters.status;
      }
      if (filters.engineerType) {
        where.engineerType = filters.engineerType;
      }
      if (filters.isPublic !== undefined) {
        where.isPublic = filters.isPublic;
      }
      
      const engineers = await this.prisma.engineer.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          skillSheet: true,
          engineerProjects: {
            include: { 
              project: {
                select: {
                  id: true,
                  name: true,
                  clientCompany: true,
                  monthlyRate: true,
                  startDate: true,
                  endDate: true,
                  status: true
                }
              }
            },
            orderBy: { startDate: 'desc' },
            take: 5
          },
          user: true
        }
      });
      
      return engineers;
    } catch (error) {
      logger.error('エンジニア一覧取得エラー:', error);
      throw new AppError('エンジニア一覧の取得に失敗しました', 500);
    }
  }
  
  async count(companyId: number | string, filters: any) {
    try {
      // companyIdを数値に変換（"company-1"のような文字列の場合は1を抽出）
      let numericCompanyId: number;
      if (typeof companyId === 'string') {
        // "company-1" から数値部分を抽出
        const match = companyId.match(/\d+/);
        numericCompanyId = match ? parseInt(match[0], 10) : 1;
      } else {
        numericCompanyId = companyId;
      }
      
      const where: Prisma.EngineerWhereInput = {
        companyId: BigInt(numericCompanyId)
      };
      
      if (filters.status) {
        where.currentStatus = filters.status;
      }
      if (filters.engineerType) {
        where.engineerType = filters.engineerType;
      }
      if (filters.isPublic !== undefined) {
        where.isPublic = filters.isPublic;
      }
      
      return await this.prisma.engineer.count({ where });
    } catch (error) {
      logger.error('エンジニア数取得エラー:', error);
      throw new AppError('エンジニア数の取得に失敗しました', 500);
    }
  }
  
  async findById(id: number, companyId: number | string) {
    try {
      // companyIdを数値に変換
      let numericCompanyId: number;
      if (typeof companyId === 'string') {
        const match = companyId.match(/\d+/);
        numericCompanyId = match ? parseInt(match[0], 10) : 1;
      } else {
        numericCompanyId = companyId;
      }
      
      const engineer = await this.prisma.engineer.findFirst({
        where: {
          id: BigInt(id),
          companyId: BigInt(numericCompanyId)
        },
        include: {
          skillSheet: true,
          engineerProjects: {
            include: { 
              project: {
                select: {
                  id: true,
                  name: true,
                  clientCompany: true,
                  monthlyRate: true,
                  startDate: true,
                  endDate: true,
                  status: true
                }
              }
            },
            orderBy: { startDate: 'desc' },
            take: 10
          },
          user: true
        }
      });
      
      return engineer;
    } catch (error) {
      logger.error('エンジニア詳細取得エラー:', error);
      throw new AppError('エンジニア情報の取得に失敗しました', 500);
    }
  }
  
  async create(data: any, companyId: number | string) {
    try {
      const engineer = await this.prisma.$transaction(async (prisma) => {
        // エンジニア作成
        const newEngineer = await prisma.engineer.create({
          data: {
            companyId: BigInt(typeof companyId === 'string' ? parseInt(companyId.match(/\d+/)?.[0] || '1', 10) : companyId),
            name: data.name,
            nameKana: data.nameKana,
            email: data.email,
            phone: data.phone,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            gender: data.gender,
            nearestStation: data.nearestStation,
            githubUrl: data.githubUrl,
            engineerType: data.engineerType || 'EMPLOYEE',
            currentStatus: data.status || 'WAITING',
            availableDate: data.availableDate ? new Date(data.availableDate) : undefined,
            isPublic: data.isPublic !== undefined ? data.isPublic : true,
            userId: data.userId ? BigInt(data.userId) : undefined
          }
        });
        
        // スキルシート初期化
        await prisma.skillSheet.create({
          data: {
            engineerId: newEngineer.id,
            summary: '',
            isCompleted: false
          }
        });
        
        return newEngineer;
      });
      
      return engineer;
    } catch (error) {
      logger.error('エンジニア作成エラー:', error);
      throw new AppError('エンジニアの登録に失敗しました', 500);
    }
  }
  
  async update(id: number, data: any, companyId: number | string) {
    try {
      const updateData: Prisma.EngineerUpdateInput = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.nameKana !== undefined) updateData.nameKana = data.nameKana;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.birthDate !== undefined) updateData.birthDate = new Date(data.birthDate);
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.nearestStation !== undefined) updateData.nearestStation = data.nearestStation;
      if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;
      if (data.engineerType !== undefined) updateData.engineerType = data.engineerType;
      if (data.currentStatus !== undefined) updateData.currentStatus = data.currentStatus;
      if (data.availableDate !== undefined) updateData.availableDate = new Date(data.availableDate);
      if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
      
      const engineer = await this.prisma.engineer.update({
        where: {
          id: BigInt(id)
        },
        data: updateData
      });
      
      return engineer;
    } catch (error) {
      logger.error('エンジニア更新エラー:', error);
      throw new AppError('エンジニア情報の更新に失敗しました', 500);
    }
  }
  
  async delete(id: number, companyId: number | string) {
    try {
      await this.prisma.$transaction(async (prisma) => {
        // スキルシート削除
        await prisma.skillSheet.deleteMany({
          where: { engineerId: BigInt(id) }
        });
        
        // エンジニアプロジェクト削除
        await prisma.engineerProject.deleteMany({
          where: { engineerId: BigInt(id) }
        });
        
        // エンジニア削除
        await prisma.engineer.delete({
          where: {
            id: BigInt(id)
          }
        });
      });
      
      return true;
    } catch (error) {
      logger.error('エンジニア削除エラー:', error);
      throw new AppError('エンジニアの削除に失敗しました', 500);
    }
  }
  
  async updateStatus(id: number, status: string, companyId: number | string) {
    const validStatuses = ['WAITING', 'ASSIGNED', 'UPCOMING', 'INACTIVE'];
    const statusUpper = status.toUpperCase();
    
    if (!validStatuses.includes(statusUpper)) {
      throw new AppError('無効なステータスです', 400);
    }
    
    try {
      const engineer = await this.prisma.engineer.update({
        where: {
          id: BigInt(id)
        },
        data: {
          currentStatus: statusUpper as EngineerStatus
        }
      });
      
      return engineer;
    } catch (error) {
      logger.error('ステータス更新エラー:', error);
      throw new AppError('ステータスの更新に失敗しました', 500);
    }
  }
  
  async updateAvailability(id: number, availableDate: string, companyId: number | string) {
    try {
      const engineer = await this.prisma.engineer.update({
        where: {
          id: BigInt(id)
        },
        data: {
          availableDate: new Date(availableDate)
        }
      });
      
      return engineer;
    } catch (error) {
      logger.error('稼働可能日更新エラー:', error);
      throw new AppError('稼働可能日の更新に失敗しました', 500);
    }
  }
  
  async updatePublicStatus(id: number, isPublic: boolean, companyId: number | string) {
    try {
      const engineer = await this.prisma.engineer.update({
        where: {
          id: BigInt(id)
        },
        data: {
          isPublic
        }
      });
      
      return engineer;
    } catch (error) {
      logger.error('公開状態更新エラー:', error);
      throw new AppError('公開状態の更新に失敗しました', 500);
    }
  }
  
  async search(companyId: number, criteria: SearchCriteria, pagination: PaginationOptions) {
    try {
      const where: Prisma.EngineerWhereInput = {
        companyId: BigInt(companyId)
      };
      
      if (criteria.query) {
        where.OR = [
          { name: { contains: criteria.query, mode: 'insensitive' } },
          { email: { contains: criteria.query, mode: 'insensitive' } },
          { nameKana: { contains: criteria.query, mode: 'insensitive' } }
        ];
      }
      
      if (criteria.status) {
        where.currentStatus = criteria.status as EngineerStatus;
      }
      
      const [data, total] = await Promise.all([
        this.prisma.engineer.findMany({
          where,
          skip: pagination.offset,
          take: pagination.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            skillSheet: true,
            engineerProjects: {
              include: { project: true },
              take: 3
            }
          }
        }),
        this.prisma.engineer.count({ where })
      ]);
      
      return { data, total };
    } catch (error) {
      logger.error('エンジニア検索エラー:', error);
      throw new AppError('エンジニアの検索に失敗しました', 500);
    }
  }
  
  async findByStatus(companyId: number, status: string, pagination: PaginationOptions) {
    try {
      const engineers = await this.prisma.engineer.findMany({
        where: {
          companyId: BigInt(companyId),
          currentStatus: status.toUpperCase() as EngineerStatus
        },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { availableDate: 'asc' },
        include: {
          skillSheet: true
        }
      });
      
      return engineers;
    } catch (error) {
      logger.error('ステータス別エンジニア取得エラー:', error);
      throw new AppError('エンジニアの取得に失敗しました', 500);
    }
  }
  
  async getAvailableEngineers(companyId: number, pagination: PaginationOptions) {
    try {
      const currentDate = new Date();
      
      const engineers = await this.prisma.engineer.findMany({
        where: {
          companyId: BigInt(companyId),
          OR: [
            { currentStatus: 'WAITING' },
            {
              currentStatus: 'UPCOMING',
              availableDate: { lte: currentDate }
            }
          ]
        },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { availableDate: 'asc' },
        include: {
          skillSheet: true
        }
      });
      
      return engineers;
    } catch (error) {
      logger.error('稼働可能エンジニア取得エラー:', error);
      throw new AppError('稼働可能エンジニアの取得に失敗しました', 500);
    }
  }
  
  async bulkUpdateStatus(engineerIds: number[], status: string, companyId: number) {
    const validStatuses = ['WAITING', 'ASSIGNED', 'UPCOMING', 'INACTIVE'];
    const statusUpper = status.toUpperCase();
    
    if (!validStatuses.includes(statusUpper)) {
      throw new AppError('無効なステータスです', 400);
    }
    
    try {
      const updated = await this.prisma.engineer.updateMany({
        where: {
          id: { in: engineerIds.map(id => BigInt(id)) },
          companyId: BigInt(companyId)
        },
        data: {
          currentStatus: statusUpper as EngineerStatus
        }
      });
      
      return engineerIds;
    } catch (error) {
      logger.error('一括ステータス更新エラー:', error);
      throw new AppError('一括ステータス更新に失敗しました', 500);
    }
  }
  
  async getSkillSheet(engineerId: number, companyId: number) {
    try {
      // エンジニアの存在確認
      const engineer = await this.prisma.engineer.findFirst({
        where: {
          id: BigInt(engineerId),
          companyId: BigInt(companyId)
        }
      });
      
      if (!engineer) {
        throw new AppError('エンジニアが見つかりません', 404);
      }
      
      let skillSheet = await this.prisma.skillSheet.findUnique({
        where: {
          engineerId: BigInt(engineerId)
        }
      });
      
      // スキルシートが存在しない場合は初期化
      if (!skillSheet) {
        skillSheet = await this.prisma.skillSheet.create({
          data: {
            engineerId: BigInt(engineerId),
            summary: '',
            isCompleted: false
          }
        });
      }
      
      return skillSheet;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('スキルシート取得エラー:', error);
      throw new AppError('スキルシートの取得に失敗しました', 500);
    }
  }
  
  async updateSkillSheet(engineerId: number, data: any, companyId: number | string) {
    try {
      // エンジニアの存在確認
      const engineer = await this.prisma.engineer.findFirst({
        where: {
          id: BigInt(engineerId),
          companyId: BigInt(companyId)
        }
      });
      
      if (!engineer) {
        throw new AppError('エンジニアが見つかりません', 404);
      }
      
      // 完了率計算
      const completionPercentage = this.calculateCompletionPercentage(data);
      const isCompleted = completionPercentage >= 80;
      
      const updateData: Prisma.SkillSheetUpdateInput = {
        summary: data.summary,
        totalExperienceYears: data.totalExperienceYears,
        programmingLanguages: data.programmingLanguages,
        frameworks: data.frameworks,
        databases: data.databases,
        cloudServices: data.cloudServices,
        tools: data.tools,
        certifications: data.certifications,
        possibleRoles: data.possibleRoles,
        possiblePhases: data.possiblePhases,
        educationBackground: data.educationBackground,
        careerSummary: data.careerSummary,
        specialSkills: data.specialSkills,
        isCompleted
      };
      
      // 既存のスキルシートを更新または作成
      const skillSheet = await this.prisma.skillSheet.upsert({
        where: {
          engineerId: BigInt(engineerId)
        },
        update: updateData,
        create: {
          engineerId: BigInt(engineerId),
          ...updateData
        }
      });
      
      return skillSheet;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('スキルシート更新エラー:', error);
      throw new AppError('スキルシートの更新に失敗しました', 500);
    }
  }
  
  async exportSkillSheet(engineerId: number, format: string, companyId: number) {
    try {
      const engineer = await this.findById(engineerId, companyId);
      if (!engineer) {
        throw new AppError('エンジニアが見つかりません', 404);
      }
      
      // TODO: 実際のエクスポート処理を実装
      // 現在は仮のデータを返す
      return {
        format,
        data: engineer,
        url: `/api/v1/engineers/${engineerId}/skill-sheet/download?format=${format}`,
        expiresAt: new Date(Date.now() + 3600000) // 1時間後
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('スキルシートエクスポートエラー:', error);
      throw new AppError('スキルシートのエクスポートに失敗しました', 500);
    }
  }
  
  async bulkExport(engineerIds: number[], format: string, companyId: number) {
    try {
      const engineers = await Promise.all(
        engineerIds.map(id => this.findById(id, companyId))
      );
      
      // TODO: 実際のエクスポート処理を実装
      // 現在は仮のデータを返す
      return {
        format,
        count: engineers.length,
        url: `/api/v1/engineers/bulk/download?format=${format}`,
        expiresAt: new Date(Date.now() + 3600000) // 1時間後
      };
    } catch (error) {
      logger.error('一括エクスポートエラー:', error);
      throw new AppError('一括エクスポートに失敗しました', 500);
    }
  }
  
  private calculateCompletionPercentage(skillSheet: any): number {
    const requiredFields = [
      'summary',
      'totalExperienceYears',
      'programmingLanguages',
      'frameworks',
      'databases',
      'possibleRoles',
      'possiblePhases'
    ];
    
    let completed = 0;
    requiredFields.forEach(field => {
      if (skillSheet[field]) {
        if (Array.isArray(skillSheet[field])) {
          if (skillSheet[field].length > 0) completed++;
        } else if (skillSheet[field] !== null && skillSheet[field] !== '') {
          completed++;
        }
      }
    });
    
    return Math.round((completed / requiredFields.length) * 100);
  }
}
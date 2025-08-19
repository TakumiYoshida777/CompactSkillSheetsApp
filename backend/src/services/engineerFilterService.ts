import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface FilterEngineersParams {
  sesCompanyId: bigint;
  businessPartnerId?: bigint;
  viewType?: 'all' | 'waiting' | 'custom';
  includeNgList?: boolean;
  search?: string;
  skills?: string[];
  availability?: string;
  projectStatus?: string;
  page?: number;
  limit?: number;
}

/**
 * エンジニアフィルタリングサービス
 */
export class EngineerFilterService {
  /**
   * エンジニアをフィルタリングして取得
   */
  async filterEngineers(params: FilterEngineersParams) {
    const {
      sesCompanyId,
      businessPartnerId,
      viewType = 'all',
      includeNgList = false,
      search,
      skills,
      availability,
      projectStatus,
      page = 1,
      limit = 20
    } = params;

    const skip = (page - 1) * limit;

    // 基本条件
    let where: Prisma.EngineerWhereInput = {
      companyId: sesCompanyId,
      isActive: true,
      isPublic: true
    };

    // NGリストの除外
    if (businessPartnerId && !includeNgList) {
      const ngEngineers = await this.getNgEngineerIds(businessPartnerId);
      if (ngEngineers.length > 0) {
        where.id = { notIn: ngEngineers };
      }
    }

    // 表示タイプによるフィルタリング
    if (viewType === 'waiting') {
      where.availability = { in: ['immediate', 'within_month', 'within_3months'] };
    } else if (viewType === 'custom' && businessPartnerId) {
      const allowedEngineers = await this.getAllowedEngineerIds(businessPartnerId);
      where.id = { in: allowedEngineers };
    }

    // 検索条件
    if (search) {
      where.OR = [
        { lastName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastNameKana: { contains: search, mode: 'insensitive' } },
        { firstNameKana: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    // スキルフィルタ
    if (skills && skills.length > 0) {
      where.engineerSkills = {
        some: {
          skill: {
            name: { in: skills }
          }
        }
      };
    }

    // 稼働状況フィルタ
    if (availability) {
      where.availability = availability;
    }

    // プロジェクト状況フィルタ
    if (projectStatus) {
      where.currentStatus = projectStatus as any;
    }

    // データ取得
    const [engineers, total] = await Promise.all([
      prisma.engineer.findMany({
        where,
        skip,
        take: limit,
        include: {
          engineerSkills: {
            include: {
              skill: true
            }
          },
          engineerProjects: {
            where: {
              isActive: true
            },
            include: {
              project: true
            },
            orderBy: {
              startDate: 'desc'
            },
            take: 1
          },
          skillSheet: {
            select: {
              summary: true,
              totalExperienceYears: true
            }
          }
        },
        orderBy: [
          { availability: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.engineer.count({ where })
    ]);

    // データ整形
    const formattedEngineers = engineers.map(engineer => ({
      id: engineer.id,
      name: engineer.name || `${engineer.lastName} ${engineer.firstName}`,
      nameKana: engineer.nameKana || `${engineer.lastNameKana} ${engineer.firstNameKana}`,
      email: engineer.email,
      phone: engineer.phone,
      engineerType: engineer.engineerType,
      currentStatus: engineer.currentStatus,
      availability: engineer.availability,
      availableDate: engineer.availableDate,
      skills: engineer.engineerSkills.map(es => ({
        name: es.skill.name,
        level: es.level,
        years: es.years
      })),
      currentProject: engineer.engineerProjects[0] || null,
      summary: engineer.skillSheet?.summary,
      totalExperienceYears: engineer.skillSheet?.totalExperienceYears
    }));

    return {
      engineers: formattedEngineers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * NGリストのエンジニアID取得
   */
  private async getNgEngineerIds(businessPartnerId: bigint): Promise<bigint[]> {
    const ngList = await prisma.engineerNgList.findMany({
      where: { businessPartnerId },
      select: { engineerId: true }
    });
    return ngList.map(ng => ng.engineerId);
  }

  /**
   * 許可されたエンジニアID取得
   */
  private async getAllowedEngineerIds(businessPartnerId: bigint): Promise<bigint[]> {
    const permissions = await prisma.engineerPermission.findMany({
      where: {
        businessPartnerId,
        isAllowed: true
      },
      select: { engineerId: true }
    });
    return permissions.map(p => p.engineerId);
  }

  /**
   * エンジニアの稼働状況を更新
   */
  async updateEngineerAvailability(engineerId: bigint, availability: string) {
    const engineer = await prisma.engineer.update({
      where: { id: engineerId },
      data: {
        availability,
        updatedAt: new Date()
      }
    });

    logger.info(`エンジニア稼働状況更新: ID ${engineerId}, availability: ${availability}`);
    return engineer;
  }

  /**
   * エンジニアの表示可否チェック
   */
  async checkEngineerVisibility(
    engineerId: bigint,
    businessPartnerId: bigint
  ): Promise<boolean> {
    // NGリストチェック
    const ngEntry = await prisma.engineerNgList.findFirst({
      where: {
        businessPartnerId,
        engineerId
      }
    });

    if (ngEntry) {
      return false;
    }

    // 設定取得
    const settings = await prisma.businessPartnerSetting.findFirst({
      where: { businessPartnerId }
    });

    if (!settings) {
      return true; // デフォルトは表示
    }

    // 表示タイプによる判定
    if (settings.viewType === 'all') {
      return true;
    }

    if (settings.viewType === 'waiting') {
      const engineer = await prisma.engineer.findUnique({
        where: { id: engineerId },
        select: { availability: true }
      });
      return engineer?.availability === 'immediate' || 
             engineer?.availability === 'within_month';
    }

    if (settings.viewType === 'custom') {
      const permission = await prisma.engineerPermission.findFirst({
        where: {
          businessPartnerId,
          engineerId,
          isAllowed: true
        }
      });
      return !!permission;
    }

    return false;
  }

  /**
   * 一括表示権限設定
   */
  async bulkSetPermissions(
    businessPartnerId: bigint,
    engineerIds: bigint[],
    isAllowed: boolean
  ) {
    // トランザクションで処理
    const result = await prisma.$transaction(async (tx) => {
      // 既存の権限を削除
      await tx.engineerPermission.deleteMany({
        where: {
          businessPartnerId,
          engineerId: { in: engineerIds }
        }
      });

      // 新しい権限を作成
      if (isAllowed) {
        const permissions = engineerIds.map(engineerId => ({
          businessPartnerId,
          engineerId,
          isAllowed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await tx.engineerPermission.createMany({
          data: permissions
        });
      }

      return engineerIds.length;
    });

    logger.info(`一括表示権限設定: BusinessPartner ${businessPartnerId}, ${result}件処理`);
    return result;
  }
}

export const engineerFilterService = new EngineerFilterService();
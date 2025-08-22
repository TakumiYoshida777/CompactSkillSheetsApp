import { PrismaClient, Prisma } from '@prisma/client';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface SetEngineerPermissionsParams {
  businessPartnerId: bigint;
  sesCompanyId: bigint;
  engineerIds: bigint[];
  viewType: 'all' | 'waiting' | 'custom';
  updatedBy: bigint;
}

interface AddToNgListParams {
  businessPartnerId: bigint;
  sesCompanyId: bigint;
  engineerId: bigint;
  reason?: string;
  createdBy: bigint;
}

interface GetViewableEngineersParams {
  businessPartnerId: bigint;
  sesCompanyId: bigint;
  page: number;
  limit: number;
  search?: string;
  skills?: string[];
  availability?: 'all' | 'available' | 'pending';
}

/**
 * アクセス権限管理サービス
 */
export class AccessControlService {
  /**
   * エンジニア表示権限取得
   */
  async getEngineerPermissions(businessPartnerId: bigint, sesCompanyId: bigint) {
    // 取引先企業の確認
    const partner = await this.validateBusinessPartner(businessPartnerId, sesCompanyId);

    // 現在の権限設定を取得
    const permissions = await prisma.engineerPermission.findMany({
      where: {
        businessPartnerId,
        isAllowed: true
      },
      include: {
        engineer: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            lastNameKana: true,
            firstNameKana: true,
            email: true,
            currentProject: true,
            availability: true
          }
        }
      }
    });

    // NGリストを取得
    const ngList = await prisma.engineerNgList.findMany({
      where: {
        businessPartnerId
      },
      include: {
        engineer: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            lastNameKana: true,
            firstNameKana: true
          }
        }
      }
    });

    // 表示設定を取得
    const settings = await prisma.businessPartnerSetting.findFirst({
      where: {
        businessPartnerId
      }
    });

    return {
      viewType: settings?.viewType || 'waiting',
      showWaitingOnly: settings?.showWaitingOnly || true,
      allowedEngineers: permissions,
      ngList: ngList,
      totalAllowed: permissions.length,
      totalNg: ngList.length
    };
  }

  /**
   * エンジニア表示権限設定
   */
  async setEngineerPermissions(params: SetEngineerPermissionsParams) {
    const {
      businessPartnerId,
      sesCompanyId,
      engineerIds,
      viewType,
      updatedBy
    } = params;

    // 取引先企業の確認
    await this.validateBusinessPartner(businessPartnerId, sesCompanyId);

    // トランザクションで権限を更新
    const result = await prisma.$transaction(async (tx) => {
      // 既存の権限を削除
      await tx.engineerPermission.deleteMany({
        where: {
          businessPartnerId
        }
      });

      // 設定を更新または作成
      await tx.businessPartnerSetting.upsert({
        where: {
          businessPartnerId
        },
        update: {
          viewType,
          showWaitingOnly: viewType === 'waiting',
          updatedAt: new Date()
        },
        create: {
          businessPartnerId,
          viewType,
          showWaitingOnly: viewType === 'waiting'
        }
      });

      // カスタム設定の場合、個別権限を作成
      if (viewType === 'custom' && engineerIds.length > 0) {
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

      // 更新された権限を取得
      const updatedPermissions = await tx.engineerPermission.findMany({
        where: {
          businessPartnerId
        },
        include: {
          engineer: {
            select: {
              id: true,
              lastName: true,
              firstName: true
            }
          }
        }
      });

      return updatedPermissions;
    });

    logger.info(`エンジニア表示権限を更新: BusinessPartner ${businessPartnerId}, ViewType: ${viewType}`);
    return result;
  }

  /**
   * NGリスト取得
   */
  async getNgList(businessPartnerId: bigint, sesCompanyId: bigint) {
    // 取引先企業の確認
    await this.validateBusinessPartner(businessPartnerId, sesCompanyId);

    const ngList = await prisma.engineerNgList.findMany({
      where: {
        businessPartnerId
      },
      include: {
        engineer: {
          select: {
            id: true,
            lastName: true,
            firstName: true,
            lastNameKana: true,
            firstNameKana: true,
            email: true,
            currentProject: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return ngList;
  }

  /**
   * NGリストに追加
   */
  async addToNgList(params: AddToNgListParams) {
    const {
      businessPartnerId,
      sesCompanyId,
      engineerId,
      reason,
      createdBy
    } = params;

    // 取引先企業の確認
    await this.validateBusinessPartner(businessPartnerId, sesCompanyId);

    // エンジニアの存在確認
    const engineer = await prisma.engineer.findFirst({
      where: {
        id: engineerId,
        companyId: sesCompanyId
      }
    });

    if (!engineer) {
      throw new ValidationError('指定されたエンジニアが見つかりません');
    }

    // 既にNGリストに存在するか確認
    const existing = await prisma.engineerNgList.findFirst({
      where: {
        businessPartnerId,
        engineerId
      }
    });

    if (existing) {
      throw new ValidationError('このエンジニアは既にNGリストに登録されています');
    }

    // NGリストに追加
    const ngEntry = await prisma.engineerNgList.create({
      data: {
        businessPartnerId,
        engineerId,
        reason,
        createdAt: new Date()
      },
      include: {
        engineer: {
          select: {
            id: true,
            lastName: true,
            firstName: true
          }
        }
      }
    });

    // 表示権限からも削除
    await prisma.engineerPermission.deleteMany({
      where: {
        businessPartnerId,
        engineerId
      }
    });

    logger.info(`NGリストに追加: BusinessPartner ${businessPartnerId}, Engineer ${engineerId}`);
    return ngEntry;
  }

  /**
   * NGリストから削除
   */
  async removeFromNgList(businessPartnerId: bigint, engineerId: bigint, sesCompanyId: bigint) {
    // 取引先企業の確認
    await this.validateBusinessPartner(businessPartnerId, sesCompanyId);

    // NGリストから削除
    const deleted = await prisma.engineerNgList.deleteMany({
      where: {
        businessPartnerId,
        engineerId
      }
    });

    if (deleted.count === 0) {
      throw new ValidationError('指定されたエンジニアはNGリストに存在しません');
    }

    logger.info(`NGリストから削除: BusinessPartner ${businessPartnerId}, Engineer ${engineerId}`);
  }

  /**
   * 表示可能エンジニア一覧取得
   */
  async getViewableEngineers(params: GetViewableEngineersParams) {
    const {
      businessPartnerId,
      sesCompanyId,
      page,
      limit,
      search,
      skills,
      availability
    } = params;

    // 取引先企業と設定の確認
    const [partner, settings] = await Promise.all([
      this.validateBusinessPartner(businessPartnerId, sesCompanyId),
      prisma.businessPartnerSetting.findFirst({
        where: { businessPartnerId }
      })
    ]);

    const skip = (page - 1) * limit;
    const viewType = settings?.viewType || 'waiting';

    // NGリストのエンジニアIDを取得
    const ngEngineers = await prisma.engineerNgList.findMany({
      where: { businessPartnerId },
      select: { engineerId: true }
    });
    const ngEngineerIds = ngEngineers.map(ng => ng.engineerId);

    // 基本の検索条件
    let where: Prisma.EngineerWhereInput = {
      companyId: sesCompanyId,
      isActive: true,
      id: {
        notIn: ngEngineerIds
      }
    };

    // 表示タイプに応じた条件追加
    if (viewType === 'waiting') {
      where.availability = { in: ['immediate', 'within_month', 'adjustable'] };
    } else if (viewType === 'custom') {
      const permissions = await prisma.engineerPermission.findMany({
        where: {
          businessPartnerId,
          isAllowed: true
        },
        select: { engineerId: true }
      });
      where.id = { in: permissions.map(p => p.engineerId) };
    }

    // 検索条件追加
    if (search) {
      where.OR = [
        { lastName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastNameKana: { contains: search, mode: 'insensitive' } },
        { firstNameKana: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // スキル条件追加
    if (skills && skills.length > 0) {
      where.engineerSkills = {
        some: {
          skill: {
            name: { in: skills }
          }
        }
      };
    }

    // 稼働状況条件追加
    if (availability && availability !== 'all') {
      if (availability === 'available') {
        where.availability = { in: ['immediate', 'within_month'] };
      } else if (availability === 'pending') {
        where.availability = 'adjustable';
      }
    }

    // エンジニア取得
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
          currentProject: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.engineer.count({ where })
    ]);

    return {
      engineers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 取引先企業の検証
   */
  private async validateBusinessPartner(businessPartnerId: bigint, sesCompanyId: bigint) {
    const partner = await prisma.businessPartner.findFirst({
      where: {
        id: businessPartnerId,
        sesCompanyId,
        isActive: true,
        deletedAt: null
      }
    });

    if (!partner) {
      throw new ValidationError('取引先企業が見つかりません');
    }

    return partner;
  }
}

export const accessControlService = new AccessControlService();
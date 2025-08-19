import { PrismaClient, Prisma } from '@prisma/client';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface GetBusinessPartnersParams {
  sesCompanyId: bigint;
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'inactive';
  sortBy: string;
  order: 'asc' | 'desc';
}

interface CreateBusinessPartnerData {
  companyName: string;
  companyNameKana?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  representative?: string;
  department?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  contractType?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  monthlyFee?: number;
  notes?: string;
  sesCompanyId: bigint;
  createdBy: bigint;
}

/**
 * 取引先企業サービス
 */
export class BusinessPartnerService {
  /**
   * 取引先企業一覧取得
   */
  async getBusinessPartners(params: GetBusinessPartnersParams) {
    const {
      sesCompanyId,
      page,
      limit,
      search,
      status,
      sortBy,
      order
    } = params;

    const skip = (page - 1) * limit;

    // 検索条件構築
    const where: Prisma.BusinessPartnerWhereInput = {
      sesCompanyId,
      deletedAt: null,
      ...(status && { isActive: status === 'active' }),
      ...(search && {
        OR: [
          { clientCompany: { name: { contains: search, mode: 'insensitive' } } },
          { contractType: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // 並び替え条件
    const orderBy: any = {};
    if (sortBy === 'companyName') {
      orderBy.clientCompany = { name: order };
    } else {
      orderBy[sortBy] = order;
    }

    const [partners, total] = await Promise.all([
      prisma.businessPartner.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          clientCompany: true,
          sesCompany: {
            select: {
              id: true,
              name: true
            }
          },
          clientUsers: {
            where: { deletedAt: null },
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true
            }
          }
        }
      }),
      prisma.businessPartner.count({ where })
    ]);

    return {
      partners,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 取引先企業詳細取得
   */
  async getBusinessPartnerById(id: bigint, sesCompanyId: bigint) {
    const partner = await prisma.businessPartner.findFirst({
      where: {
        id,
        sesCompanyId,
        deletedAt: null
      },
      include: {
        clientCompany: true,
        sesCompany: {
          select: {
            id: true,
            name: true
          }
        },
        clientUsers: {
          where: { deletedAt: null },
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        },
        engineerPermissions: {
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
        }
      }
    });

    return partner;
  }

  /**
   * 取引先企業作成
   */
  async createBusinessPartner(data: CreateBusinessPartnerData) {
    // バリデーション
    if (!data.companyName) {
      throw new ValidationError('会社名は必須です');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new ValidationError('メールアドレスの形式が正しくありません');
    }

    if (data.contactEmail && !this.isValidEmail(data.contactEmail)) {
      throw new ValidationError('担当者メールアドレスの形式が正しくありません');
    }

    // 取引先会社を作成または取得
    let clientCompany = await prisma.company.findFirst({
      where: {
        name: data.companyName,
        companyType: 'CLIENT'
      }
    });

    if (!clientCompany) {
      clientCompany = await prisma.company.create({
        data: {
          name: data.companyName,
          nameKana: data.companyNameKana,
          companyType: 'CLIENT',
          postalCode: data.postalCode,
          address: data.address,
          phone: data.phone,
          fax: data.fax,
          email: data.email,
          website: data.website,
          representative: data.representative
        }
      });
    }

    // 取引先関係を作成
    const partner = await prisma.businessPartner.create({
      data: {
        sesCompanyId: data.sesCompanyId,
        clientCompanyId: clientCompany.id,
        contractType: data.contractType,
        contractStartDate: data.contractStartDate,
        contractEndDate: data.contractEndDate,
        monthlyFee: data.monthlyFee,
        notes: data.notes,
        isActive: true
      },
      include: {
        clientCompany: true,
        sesCompany: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    logger.info(`取引先企業を作成しました: ${clientCompany.name}`);
    return partner;
  }

  /**
   * 取引先企業更新
   */
  async updateBusinessPartner(id: bigint, data: any) {
    const partner = await prisma.businessPartner.findFirst({
      where: { id, deletedAt: null }
    });

    if (!partner) {
      throw new ValidationError('取引先企業が見つかりません');
    }

    // 会社情報の更新
    if (data.companyName || data.companyNameKana || data.address || data.phone) {
      await prisma.company.update({
        where: { id: partner.clientCompanyId },
        data: {
          ...(data.companyName && { name: data.companyName }),
          ...(data.companyNameKana && { nameKana: data.companyNameKana }),
          ...(data.postalCode && { postalCode: data.postalCode }),
          ...(data.address && { address: data.address }),
          ...(data.phone && { phone: data.phone }),
          ...(data.fax && { fax: data.fax }),
          ...(data.email && { email: data.email }),
          ...(data.website && { website: data.website }),
          ...(data.representative && { representative: data.representative })
        }
      });
    }

    // 取引先関係の更新
    const updatedPartner = await prisma.businessPartner.update({
      where: { id },
      data: {
        ...(data.contractType && { contractType: data.contractType }),
        ...(data.contractStartDate && { contractStartDate: data.contractStartDate }),
        ...(data.contractEndDate && { contractEndDate: data.contractEndDate }),
        ...(data.monthlyFee !== undefined && { monthlyFee: data.monthlyFee }),
        ...(data.notes && { notes: data.notes }),
        updatedAt: new Date()
      },
      include: {
        clientCompany: true,
        sesCompany: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    logger.info(`取引先企業を更新しました: ID ${id}`);
    return updatedPartner;
  }

  /**
   * 取引先企業削除（論理削除）
   */
  async deleteBusinessPartner(id: bigint, sesCompanyId: bigint) {
    const partner = await prisma.businessPartner.findFirst({
      where: {
        id,
        sesCompanyId,
        deletedAt: null
      }
    });

    if (!partner) {
      throw new ValidationError('取引先企業が見つかりません');
    }

    // 関連するクライアントユーザーも論理削除
    await prisma.$transaction([
      prisma.clientUser.updateMany({
        where: {
          businessPartnerId: id,
          deletedAt: null
        },
        data: {
          deletedAt: new Date(),
          isActive: false
        }
      }),
      prisma.businessPartner.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false
        }
      })
    ]);

    logger.info(`取引先企業を削除しました: ID ${id}`);
  }

  /**
   * 取引先企業ステータス変更
   */
  async updateBusinessPartnerStatus(id: bigint, isActive: boolean) {
    const partner = await prisma.businessPartner.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date()
      },
      include: {
        clientCompany: true
      }
    });

    logger.info(`取引先企業ステータスを変更しました: ID ${id}, isActive: ${isActive}`);
    return partner;
  }

  /**
   * 取引先企業統計情報取得
   */
  async getBusinessPartnerStats(sesCompanyId: bigint) {
    const [total, active, inactive, thisMonth] = await Promise.all([
      prisma.businessPartner.count({
        where: {
          sesCompanyId,
          deletedAt: null
        }
      }),
      prisma.businessPartner.count({
        where: {
          sesCompanyId,
          isActive: true,
          deletedAt: null
        }
      }),
      prisma.businessPartner.count({
        where: {
          sesCompanyId,
          isActive: false,
          deletedAt: null
        }
      }),
      prisma.businessPartner.count({
        where: {
          sesCompanyId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          },
          deletedAt: null
        }
      })
    ]);

    return {
      total,
      active,
      inactive,
      thisMonth
    };
  }

  /**
   * 権限チェック: 作成権限
   */
  async checkCreatePermission(userId: bigint, sesCompanyId: bigint): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: sesCompanyId
      },
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

    if (!user) return false;

    // 管理者または営業権限をチェック
    const hasPermission = user.userRoles.some(ur => 
      ur.role.name === 'admin' || 
      ur.role.name === 'sales' ||
      ur.role.rolePermissions.some(rp => 
        rp.permission.name === 'business_partner_create'
      )
    );

    return hasPermission;
  }

  /**
   * 権限チェック: 更新権限
   */
  async checkUpdatePermission(userId: bigint, sesCompanyId: bigint, partnerId: bigint): Promise<boolean> {
    // 取引先が自社のものか確認
    const partner = await prisma.businessPartner.findFirst({
      where: {
        id: partnerId,
        sesCompanyId,
        deletedAt: null
      }
    });

    if (!partner) return false;

    return this.checkCreatePermission(userId, sesCompanyId);
  }

  /**
   * 権限チェック: 削除権限
   */
  async checkDeletePermission(userId: bigint, sesCompanyId: bigint): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: sesCompanyId
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) return false;

    // 管理者のみ削除可能
    const isAdmin = user.userRoles.some(ur => ur.role.name === 'admin');
    return isAdmin;
  }

  /**
   * メールアドレスバリデーション
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const businessPartnerService = new BusinessPartnerService();
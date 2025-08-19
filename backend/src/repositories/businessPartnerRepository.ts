import { PrismaClient, BusinessPartner, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import crypto from 'crypto';

export class BusinessPartnerRepository extends BaseRepository<
  BusinessPartner,
  Prisma.BusinessPartnerCreateInput,
  Prisma.BusinessPartnerUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'businessPartner');
  }

  /**
   * SES企業の取引先一覧を取得
   */
  async findBySESCompany(
    sesCompanyId: number,
    options?: any
  ): Promise<{ data: BusinessPartner[]; total: number }> {
    const where: any = {
      sesCompanyId: BigInt(sesCompanyId)
    };
    
    // フィルタ条件の追加
    if (options?.filters) {
      if (options.filters.isActive !== undefined) {
        where.isActive = options.filters.isActive === 'true';
      }
      if (options.filters.clientCompanyName) {
        where.clientCompany = {
          name: {
            contains: options.filters.clientCompanyName,
            mode: 'insensitive'
          }
        };
      }
    }
    
    const [data, total] = await Promise.all([
      this.prisma.businessPartner.findMany({
        where,
        skip: options?.pagination?.offset,
        take: options?.pagination?.limit,
        orderBy: options?.sort 
          ? { [options.sort.field]: options.sort.order }
          : { createdAt: 'desc' },
        include: {
          clientCompany: {
            select: {
              id: true,
              name: true,
              emailDomain: true,
              contactEmail: true
            }
          },
          clientUsers: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              position: true,
              lastLoginAt: true
            }
          },
          accessPermissions: {
            where: { isActive: true },
            include: {
              engineer: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              clientUsers: true,
              accessPermissions: true
            }
          }
        }
      }),
      this.prisma.businessPartner.count({ where })
    ]);
    
    return { data, total };
  }

  /**
   * 取引先企業を新規作成
   */
  async createPartnership(
    data: {
      sesCompanyId: bigint;
      clientCompanyId: bigint;
      createdBy: bigint;
      engineerIds?: bigint[];
    }
  ): Promise<BusinessPartner> {
    // URLトークンを生成（UUIDの代わりにタイムスタンプベース）
    const urlToken = this.generateUrlToken();
    const accessUrl = `${process.env.CLIENT_ACCESS_BASE_URL || 'https://client.skillsheet.com'}/access/${urlToken}`;
    
    return await this.prisma.$transaction(async (tx) => {
      // ビジネスパートナーを作成
      const partner = await tx.businessPartner.create({
        data: {
          sesCompanyId: data.sesCompanyId,
          clientCompanyId: data.clientCompanyId,
          accessUrl,
          urlToken,
          createdBy: data.createdBy,
          isActive: true
        },
        include: {
          clientCompany: true,
          sesCompany: true
        }
      });
      
      // エンジニアへのアクセス権限を設定
      if (data.engineerIds && data.engineerIds.length > 0) {
        await tx.clientAccessPermission.createMany({
          data: data.engineerIds.map(engineerId => ({
            businessPartnerId: partner.id,
            engineerId,
            permissionType: 'VIEW',
            createdBy: data.createdBy
          }))
        });
      }
      
      return partner;
    });
  }

  /**
   * URLトークンから取引先情報を取得
   */
  async findByUrlToken(urlToken: string): Promise<BusinessPartner | null> {
    return this.prisma.businessPartner.findUnique({
      where: { urlToken },
      include: {
        sesCompany: {
          select: {
            id: true,
            name: true,
            contactEmail: true
          }
        },
        clientCompany: {
          select: {
            id: true,
            name: true
          }
        },
        accessPermissions: {
          where: { isActive: true },
          include: {
            engineer: {
              include: {
                skills: true,
                engineerProjects: {
                  where: { isCurrent: true },
                  include: {
                    project: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * 取引先のアクセス権限を更新
   */
  async updateAccessPermissions(
    partnerId: bigint,
    engineerIds: bigint[],
    updatedBy: bigint
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 既存の権限を無効化
      await tx.clientAccessPermission.updateMany({
        where: { businessPartnerId: partnerId },
        data: { isActive: false }
      });
      
      // 新しい権限を作成
      if (engineerIds.length > 0) {
        await tx.clientAccessPermission.createMany({
          data: engineerIds.map(engineerId => ({
            businessPartnerId: partnerId,
            engineerId,
            permissionType: 'VIEW',
            createdBy: updatedBy,
            isActive: true
          }))
        });
      }
    });
  }

  /**
   * URLトークンを生成（UUIDの代わり）
   */
  private generateUrlToken(): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `${timestamp}-${randomBytes}`;
  }

  /**
   * 取引先の統計情報を取得
   */
  async getPartnerStats(sesCompanyId: number): Promise<any> {
    const partners = await this.prisma.businessPartner.findMany({
      where: { sesCompanyId: BigInt(sesCompanyId) },
      include: {
        clientUsers: true,
        _count: {
          select: {
            clientUsers: true,
            accessPermissions: true
          }
        }
      }
    });
    
    const activePartners = partners.filter(p => p.isActive);
    const totalUsers = partners.reduce((sum, p) => sum + p._count.clientUsers, 0);
    const activeUsers = partners.reduce((sum, p) => 
      sum + p.clientUsers.filter(u => u.isActive).length, 0
    );
    
    return {
      totalPartners: partners.length,
      activePartners: activePartners.length,
      totalUsers,
      activeUsers,
      averageUsersPerPartner: partners.length > 0 
        ? (totalUsers / partners.length).toFixed(1) 
        : 0
    };
  }
}
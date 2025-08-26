/**
 * 取引先企業サービス（改修版）
 * 暫定実装との互換性を維持しながら正式なスキーマを使用
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { 
  transformToLegacyFormat, 
  transformListToLegacyFormat,
  transformFromLegacyForCreate,
  transformFromLegacyForUpdate,
  BusinessPartnerWithRelations 
} from '../utils/businessPartnerTransformer';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

interface GetBusinessPartnersParams {
  sesCompanyId?: bigint;
  page: number;
  limit: number;
  search?: string;
  status?: 'active' | 'inactive' | 'prospective';
  industry?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * URLトークン生成
 */
function generateUrlToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * アクセスURL生成
 */
function generateAccessUrl(companyName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  return `${slug}-${timestamp}-${random}`;
}

/**
 * 取引先企業サービス（改修版）
 */
export class BusinessPartnerService2 {
  /**
   * 取引先企業一覧取得（暫定実装互換）
   */
  async getBusinessPartners(params: GetBusinessPartnersParams) {
    const {
      sesCompanyId,
      page = 1,
      limit = 10,
      search,
      status,
      industry,
      sortBy = 'createdAt',
      order = 'desc'
    } = params;

    const skip = (page - 1) * limit;

    // 検索条件構築
    const where: Prisma.BusinessPartnerWhereInput = {
      ...(sesCompanyId && { sesCompanyId }),
      deletedAt: null,
      ...(status && {
        ...(status === 'active' && { 
          isActive: true,
          detail: { currentEngineers: { gt: 0 } }
        }),
        ...(status === 'inactive' && { isActive: false }),
        ...(status === 'prospective' && { 
          isActive: true,
          detail: { currentEngineers: 0 }
        })
      }),
      ...(industry && {
        detail: { industry }
      }),
      ...(search && {
        OR: [
          { clientCompany: { name: { contains: search, mode: 'insensitive' } } },
          { clientCompany: { nameKana: { contains: search, mode: 'insensitive' } } },
          { detail: { 
            OR: [
              { companyNameKana: { contains: search, mode: 'insensitive' } },
              { industry: { contains: search, mode: 'insensitive' } },
              { notes: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ]
      })
    };

    // 並び替え条件
    const orderBy: any = {};
    if (sortBy === 'companyName') {
      orderBy.clientCompany = { name: order };
    } else if (sortBy === 'monthlyRevenue' || sortBy === 'currentEngineers' || sortBy === 'rating') {
      orderBy.detail = { [sortBy]: order };
    } else {
      orderBy[sortBy] = order;
    }

    try {
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
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                department: true,
                position: true
              }
            },
            detail: true,
            setting: true
          }
        }),
        prisma.businessPartner.count({ where })
      ]);

      // 暫定実装形式に変換
      const transformedPartners = transformListToLegacyFormat(
        partners as BusinessPartnerWithRelations[]
      );

      return {
        data: transformedPartners,
        total
      };
    } catch (error) {
      logger.error('取引先企業一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先企業詳細取得（暫定実装互換）
   */
  async getBusinessPartnerById(id: string) {
    try {
      const partner = await prisma.businessPartner.findFirst({
        where: {
          id: BigInt(id),
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
            where: { isActive: true }
          },
          detail: true,
          setting: true
        }
      });

      if (!partner) {
        throw new ValidationError('取引先企業が見つかりません');
      }

      // 暫定実装形式に変換
      return {
        data: transformToLegacyFormat(partner as BusinessPartnerWithRelations)
      };
    } catch (error) {
      logger.error('取引先企業詳細取得エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先企業作成（暫定実装互換）
   */
  async createBusinessPartner(data: any, sesCompanyId: bigint, createdBy: bigint) {
    try {
      // バリデーション
      if (!data.companyName) {
        throw new ValidationError('会社名は必須です');
      }

      // 変換
      const transformed = transformFromLegacyForCreate(data, sesCompanyId, createdBy);

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
            address: data.address,
            phone: data.phone,
            website: data.website,
            email: data.email,
            industry: data.industry,
            employeeCount: data.employeeSize
          }
        });
      }

      // トランザクションで作成
      const result = await prisma.$transaction(async (tx) => {
        // BusinessPartner作成
        const partner = await tx.businessPartner.create({
          data: {
            sesCompanyId,
            clientCompanyId: clientCompany.id,
            accessUrl: generateAccessUrl(data.companyName),
            urlToken: generateUrlToken(),
            isActive: transformed.businessPartner.isActive,
            createdBy
          }
        });

        // BusinessPartnerDetail作成
        if (transformed.detail) {
          await tx.businessPartnerDetail.create({
            data: {
              businessPartnerId: partner.id,
              ...transformed.detail
            }
          });
        }

        // BusinessPartnerSetting作成
        await tx.businessPartnerSetting.create({
          data: {
            businessPartnerId: partner.id,
            viewType: 'all',
            showWaitingOnly: false,
            autoApprove: false
          }
        });

        // 担当者情報作成
        if (data.contacts && data.contacts.length > 0) {
          for (const contact of data.contacts) {
            await tx.clientUser.create({
              data: {
                businessPartnerId: partner.id,
                email: contact.email,
                passwordHash: crypto.randomBytes(32).toString('hex'), // 仮パスワード
                name: contact.name,
                phone: contact.phone,
                department: contact.department,
                position: contact.position,
                isActive: true
              }
            });
          }
        }

        return partner;
      });

      // 作成したデータを取得して返す
      const created = await this.getBusinessPartnerById(result.id.toString());
      logger.info(`取引先企業を作成しました: ${data.companyName}`);
      return created;
      
    } catch (error) {
      logger.error('取引先企業作成エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先企業更新（暫定実装互換）
   */
  async updateBusinessPartner(id: string, data: any) {
    try {
      const partnerId = BigInt(id);
      
      // 既存データ確認
      const existing = await prisma.businessPartner.findFirst({
        where: { id: partnerId, deletedAt: null },
        include: { clientCompany: true }
      });

      if (!existing) {
        throw new ValidationError('取引先企業が見つかりません');
      }

      // 変換
      const transformed = transformFromLegacyForUpdate(data);

      await prisma.$transaction(async (tx) => {
        // BusinessPartner更新
        if (Object.keys(transformed.businessPartner).length > 0) {
          await tx.businessPartner.update({
            where: { id: partnerId },
            data: {
              ...transformed.businessPartner,
              updatedAt: new Date()
            }
          });
        }

        // Company情報更新
        if (data.companyName || data.address || data.phone || data.website) {
          await tx.company.update({
            where: { id: existing.clientCompanyId },
            data: {
              ...(data.companyName && { name: data.companyName }),
              ...(data.companyNameKana && { nameKana: data.companyNameKana }),
              ...(data.address && { address: data.address }),
              ...(data.phone && { phone: data.phone }),
              ...(data.website && { website: data.website }),
              ...(data.industry && { industry: data.industry }),
              ...(data.employeeSize && { employeeCount: data.employeeSize })
            }
          });
        }

        // BusinessPartnerDetail更新
        if (Object.keys(transformed.detail).length > 0) {
          await tx.businessPartnerDetail.upsert({
            where: { businessPartnerId: partnerId },
            create: {
              businessPartnerId: partnerId,
              ...transformed.detail
            },
            update: {
              ...transformed.detail,
              updatedAt: new Date()
            }
          });
        }
      });

      // 更新したデータを取得して返す
      const updated = await this.getBusinessPartnerById(id);
      logger.info(`取引先企業を更新しました: ID ${id}`);
      return updated;
      
    } catch (error) {
      logger.error('取引先企業更新エラー:', error);
      throw error;
    }
  }

  /**
   * 取引先企業削除（論理削除）
   */
  async deleteBusinessPartner(id: string) {
    try {
      const partnerId = BigInt(id);

      const partner = await prisma.businessPartner.findFirst({
        where: {
          id: partnerId,
          deletedAt: null
        }
      });

      if (!partner) {
        throw new ValidationError('取引先企業が見つかりません');
      }

      // 関連するデータも論理削除
      await prisma.$transaction([
        prisma.clientUser.updateMany({
          where: {
            businessPartnerId: partnerId,
            deletedAt: null
          },
          data: {
            deletedAt: new Date(),
            isActive: false
          }
        }),
        prisma.businessPartner.update({
          where: { id: partnerId },
          data: {
            deletedAt: new Date(),
            isActive: false
          }
        })
      ]);

      logger.info(`取引先企業を削除しました: ID ${id}`);
      return { success: true };
      
    } catch (error) {
      logger.error('取引先企業削除エラー:', error);
      throw error;
    }
  }
}

export const businessPartnerService2 = new BusinessPartnerService2();
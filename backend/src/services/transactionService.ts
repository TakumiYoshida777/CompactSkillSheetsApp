import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { ValidationError, BusinessLogicError } from '../utils/errors';

const prisma = new PrismaClient();

interface CreateBusinessPartnerWithUsersParams {
  companyData: {
    name: string;
    nameKana?: string;
    companyType: 'CLIENT';
    postalCode?: string;
    address?: string;
    phone?: string;
    fax?: string;
    email?: string;
    website?: string;
    representative?: string;
  };
  partnerData: {
    sesCompanyId: bigint;
    contractType?: string;
    contractStartDate?: Date;
    contractEndDate?: Date;
    monthlyFee?: number;
    notes?: string;
    createdBy: bigint;
  };
  users?: Array<{
    email: string;
    password: string;
    name: string;
    department?: string;
    position?: string;
    phone?: string;
  }>;
}

/**
 * トランザクションサービス
 * 複数のデータ操作を原子的に実行
 */
export class TransactionService {
  /**
   * 取引先企業と初期ユーザーを一括作成
   */
  async createBusinessPartnerWithUsers(params: CreateBusinessPartnerWithUsersParams) {
    const { companyData, partnerData, users = [] } = params;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. 会社情報を作成
        const company = await tx.company.create({
          data: companyData
        });

        logger.info(`会社作成: ${company.name} (ID: ${company.id})`);

        // 2. 取引先関係を作成
        const businessPartner = await tx.businessPartner.create({
          data: {
            ...partnerData,
            clientCompanyId: company.id,
            accessUrl: this.generateAccessUrl(company.name),
            urlToken: this.generateUrlToken(),
            isActive: true
          }
        });

        logger.info(`取引先関係作成: ID ${businessPartner.id}`);

        // 3. デフォルト設定を作成
        const settings = await tx.businessPartnerSetting.create({
          data: {
            businessPartnerId: businessPartner.id,
            viewType: 'waiting',
            showWaitingOnly: true,
            autoApprove: false
          }
        });

        logger.info(`取引先設定作成: ID ${settings.id}`);

        // 4. ユーザーを作成
        const createdUsers = [];
        for (const userData of users) {
          const bcrypt = require('bcrypt');
          const passwordHash = await bcrypt.hash(userData.password, 10);

          const clientUser = await tx.clientUser.create({
            data: {
              businessPartnerId: businessPartner.id,
              email: userData.email,
              passwordHash,
              name: userData.name,
              department: userData.department,
              position: userData.position,
              phone: userData.phone,
              isActive: true
            }
          });

          createdUsers.push(clientUser);
          logger.info(`取引先ユーザー作成: ${clientUser.email}`);
        }

        return {
          company,
          businessPartner,
          settings,
          users: createdUsers
        };
      });

      logger.info('取引先企業と関連データの作成完了');
      return result;
    } catch (error) {
      logger.error('取引先企業作成トランザクションエラー:', error);
      throw new BusinessLogicError('取引先企業の作成に失敗しました');
    }
  }

  /**
   * 取引先企業の完全削除
   */
  async deleteBusinessPartnerCompletely(businessPartnerId: bigint, sesCompanyId: bigint) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. 取引先企業の存在確認
        const partner = await tx.businessPartner.findFirst({
          where: {
            id: businessPartnerId,
            sesCompanyId
          }
        });

        if (!partner) {
          throw new ValidationError('取引先企業が見つかりません');
        }

        // 2. 関連するユーザーを削除
        const deletedUsers = await tx.clientUser.deleteMany({
          where: { businessPartnerId }
        });

        logger.info(`取引先ユーザー削除: ${deletedUsers.count}件`);

        // 3. アクセス権限を削除
        const deletedPermissions = await tx.engineerPermission.deleteMany({
          where: { businessPartnerId }
        });

        logger.info(`エンジニア権限削除: ${deletedPermissions.count}件`);

        // 4. NGリストを削除
        const deletedNgList = await tx.engineerNgList.deleteMany({
          where: { businessPartnerId }
        });

        logger.info(`NGリスト削除: ${deletedNgList.count}件`);

        // 5. 設定を削除
        await tx.businessPartnerSetting.deleteMany({
          where: { businessPartnerId }
        });

        // 6. 閲覧ログを削除
        const deletedLogs = await tx.clientViewLog.deleteMany({
          where: {
            clientUser: {
              businessPartnerId
            }
          }
        });

        logger.info(`閲覧ログ削除: ${deletedLogs.count}件`);

        // 7. 取引先関係を削除
        await tx.businessPartner.delete({
          where: { id: businessPartnerId }
        });

        logger.info(`取引先関係削除: ID ${businessPartnerId}`);

        return {
          deletedUsers: deletedUsers.count,
          deletedPermissions: deletedPermissions.count,
          deletedNgList: deletedNgList.count,
          deletedLogs: deletedLogs.count
        };
      });

      logger.info('取引先企業の完全削除完了');
      return result;
    } catch (error) {
      logger.error('取引先企業削除トランザクションエラー:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new BusinessLogicError('取引先企業の削除に失敗しました');
    }
  }

  /**
   * エンジニア権限の一括更新
   */
  async bulkUpdateEngineerPermissions(
    businessPartnerId: bigint,
    updates: Array<{ engineerId: bigint; isAllowed: boolean }>,
    updatedBy: bigint
  ) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const results = [];

        for (const update of updates) {
          // 既存の権限を確認
          const existing = await tx.engineerPermission.findUnique({
            where: {
              businessPartnerId_engineerId: {
                businessPartnerId,
                engineerId: update.engineerId
              }
            }
          });

          if (existing) {
            // 更新
            const updated = await tx.engineerPermission.update({
              where: {
                businessPartnerId_engineerId: {
                  businessPartnerId,
                  engineerId: update.engineerId
                }
              },
              data: {
                isAllowed: update.isAllowed,
                updatedAt: new Date()
              }
            });
            results.push(updated);
          } else {
            // 新規作成
            const created = await tx.engineerPermission.create({
              data: {
                businessPartnerId,
                engineerId: update.engineerId,
                isAllowed: update.isAllowed
              }
            });
            results.push(created);
          }
        }

        // 監査ログを記録
        await tx.auditLog.create({
          data: {
            userId: updatedBy,
            action: 'BULK_UPDATE_PERMISSIONS',
            tableName: 'engineer_permissions',
            recordId: businessPartnerId,
            changes: JSON.stringify(updates),
            createdAt: new Date()
          }
        });

        return results;
      });

      logger.info(`エンジニア権限一括更新: ${result.length}件処理`);
      return result;
    } catch (error) {
      logger.error('エンジニア権限一括更新エラー:', error);
      throw new BusinessLogicError('エンジニア権限の更新に失敗しました');
    }
  }

  /**
   * 取引先企業のステータス変更と関連処理
   */
  async changeBusinessPartnerStatus(
    businessPartnerId: bigint,
    isActive: boolean,
    updatedBy: bigint
  ) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. 取引先企業のステータス更新
        const partner = await tx.businessPartner.update({
          where: { id: businessPartnerId },
          data: {
            isActive,
            updatedAt: new Date()
          }
        });

        // 2. 関連ユーザーのステータス更新
        const updatedUsers = await tx.clientUser.updateMany({
          where: { businessPartnerId },
          data: {
            isActive,
            updatedAt: new Date()
          }
        });

        // 3. 無効化の場合、アクティブなセッションを終了
        if (!isActive) {
          // セッション管理テーブルがある場合の処理
          // await tx.session.deleteMany({
          //   where: {
          //     userId: {
          //       in: await tx.clientUser.findMany({
          //         where: { businessPartnerId },
          //         select: { id: true }
          //       }).then(users => users.map(u => u.id))
          //     }
          //   }
          // });
        }

        // 4. 監査ログ記録
        await tx.auditLog.create({
          data: {
            userId: updatedBy,
            action: isActive ? 'ACTIVATE_PARTNER' : 'DEACTIVATE_PARTNER',
            tableName: 'business_partners',
            recordId: businessPartnerId,
            changes: JSON.stringify({ isActive }),
            createdAt: new Date()
          }
        });

        return {
          partner,
          updatedUsers: updatedUsers.count
        };
      });

      logger.info(`取引先企業ステータス変更: ID ${businessPartnerId}, isActive: ${isActive}`);
      return result;
    } catch (error) {
      logger.error('取引先企業ステータス変更エラー:', error);
      throw new BusinessLogicError('ステータス変更に失敗しました');
    }
  }

  /**
   * アクセスURL生成
   */
  private generateAccessUrl(companyName: string): string {
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    const timestamp = Date.now();
    return `${slug}-${timestamp}`;
  }

  /**
   * URLトークン生成
   */
  private generateUrlToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
}

export const transactionService = new TransactionService();
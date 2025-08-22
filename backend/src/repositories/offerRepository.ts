import { PrismaClient, Prisma, OfferStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface CreateOfferInput {
  clientCompanyId: bigint;
  projectName: string;
  projectPeriodStart: Date;
  projectPeriodEnd: Date;
  requiredSkills: string[];
  projectDescription: string;
  location?: string;
  rateMin?: number;
  rateMax?: number;
  remarks?: string;
  createdBy: bigint;
}

export interface OfferFilterOptions {
  status?: OfferStatus[];
  startDate?: Date;
  endDate?: Date;
}

export interface OfferStatistics {
  total: number;
  sent: number;
  opened: number;
  pending: number;
  accepted: number;
  declined: number;
  withdrawn: number;
}

export class OfferRepository {
  constructor(private prisma: PrismaClient) {}

  // 互換性のためのエイリアスメソッド
  async getNextOfferNumber(): Promise<string> {
    return this.generateOfferNumber();
  }

  async create(data: any): Promise<any> {
    return this.createOffer(data);
  }

  async findById(id: string, options?: any): Promise<any> {
    return this.findOfferById(BigInt(id));
  }

  async findByIds(ids: string[]): Promise<any[]> {
    const offers = await this.prisma.offer.findMany({
      where: {
        id: { in: ids.map(id => BigInt(id)) }
      },
      include: {
        clientCompany: true,
        creator: true,
        offerEngineers: {
          include: {
            engineer: true,
          },
        },
      },
    });
    return offers;
  }

  async findMany(filters: any): Promise<any> {
    const offers = await this.findOffersByCompany(BigInt(filters.companyId), filters);
    return {
      offers,
      total: offers.length
    };
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.offer.update({
      where: { id: BigInt(id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async updateMany(ids: string[], data: any): Promise<void> {
    await this.bulkUpdateStatus(ids.map(id => BigInt(id)), data.status);
  }

  async countTotal(companyId: string): Promise<number> {
    return this.prisma.offer.count({ where: { clientCompanyId: BigInt(companyId) } });
  }

  async countMonthlyOffers(companyId: string): Promise<number> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return this.countOffersByPeriod(BigInt(companyId), oneMonthAgo, new Date());
  }

  async countWeeklyOffers(companyId: string): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.countOffersByPeriod(BigInt(companyId), oneWeekAgo, new Date());
  }

  async countTodayOffers(companyId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.countOffersByPeriod(BigInt(companyId), today, new Date());
  }

  async countByStatus(companyId: string, status: string): Promise<number> {
    return this.prisma.offer.count({ 
      where: { 
        clientCompanyId: BigInt(companyId),
        status: status as OfferStatus
      } 
    });
  }

  async calculateAcceptanceRate(companyId: string): Promise<number> {
    const stats = await this.getOfferStatistics(BigInt(companyId));
    if (stats.total === 0) return 0;
    return Math.round((stats.accepted / stats.total) * 100);
  }

  async calculateAverageResponseTime(companyId: string): Promise<number> {
    // モック実装: 平均3日を返す
    return 3;
  }

  async calculateDeclineRate(companyId: string): Promise<number> {
    const stats = await this.getOfferStatistics(BigInt(companyId));
    if (stats.total === 0) return 0;
    return Math.round((stats.declined / stats.total) * 100);
  }

  /**
   * 新規オファーを作成
   */
  async createOffer(input: CreateOfferInput) {
    const offerNumber = await this.generateOfferNumber();

    return this.prisma.offer.create({
      data: {
        offerNumber,
        clientCompanyId: input.clientCompanyId,
        status: 'SENT',
        projectName: input.projectName,
        projectPeriodStart: input.projectPeriodStart,
        projectPeriodEnd: input.projectPeriodEnd,
        requiredSkills: input.requiredSkills,
        projectDescription: input.projectDescription,
        location: input.location,
        rateMin: input.rateMin,
        rateMax: input.rateMax,
        remarks: input.remarks,
        sentAt: new Date(),
        createdBy: input.createdBy,
      },
    });
  }

  /**
   * オファー番号を生成
   */
  private async generateOfferNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const latestOffer = await this.prisma.offer.findFirst({
      where: {
        offerNumber: {
          startsWith: `OFF-${year}-`,
        },
      },
      orderBy: {
        offerNumber: 'desc',
      },
      select: {
        offerNumber: true,
      },
    });

    if (!latestOffer) {
      return `OFF-${year}-001`;
    }

    const latestNumber = parseInt(latestOffer.offerNumber.split('-')[2], 10);
    const nextNumber = (latestNumber + 1).toString().padStart(3, '0');
    return `OFF-${year}-${nextNumber}`;
  }

  /**
   * IDでオファーを取得
   */
  async findOfferById(id: bigint) {
    return this.prisma.offer.findUnique({
      where: { id },
      include: {
        clientCompany: true,
        creator: true,
        offerEngineers: {
          include: {
            engineer: true,
          },
        },
      },
    });
  }

  /**
   * 企業IDでオファー一覧を取得
   */
  async findOffersByCompany(
    clientCompanyId: bigint,
    options?: OfferFilterOptions
  ) {
    const where: Prisma.OfferWhereInput = {
      clientCompanyId,
    };

    if (options?.status && options.status.length > 0) {
      where.status = { in: options.status };
    }

    if (options?.startDate && options?.endDate) {
      where.sentAt = {
        gte: options.startDate,
        lte: options.endDate,
      };
    }

    return this.prisma.offer.findMany({
      where,
      include: {
        clientCompany: true,
        creator: true,
        offerEngineers: {
          include: {
            engineer: {
              include: {
                skillSheet: true,
              },
            },
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  /**
   * オファーステータスを更新
   */
  async updateOfferStatus(id: bigint, status: OfferStatus) {
    const updateData: Prisma.OfferUpdateInput = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'OPENED') {
      const offer = await this.prisma.offer.findUnique({
        where: { id },
        select: { openedAt: true },
      });
      if (!offer?.openedAt) {
        updateData.openedAt = new Date();
      }
    }

    if (['ACCEPTED', 'DECLINED'].includes(status)) {
      updateData.respondedAt = new Date();
    }

    return this.prisma.offer.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * リマインドを送信
   */
  async sendReminder(id: bigint) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      select: { reminderCount: true },
    });

    if (!offer) {
      return null;
    }

    return this.prisma.offer.update({
      where: { id },
      data: {
        reminderCount: offer.reminderCount + 1,
        reminderSentAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * オファー統計情報を取得
   */
  async getOfferStatistics(clientCompanyId: bigint): Promise<OfferStatistics> {
    const [total, sent, opened, pending, accepted, declined, withdrawn] = 
      await Promise.all([
        this.prisma.offer.count({ where: { clientCompanyId } }),
        this.prisma.offer.count({ where: { clientCompanyId, status: 'SENT' } }),
        this.prisma.offer.count({ where: { clientCompanyId, status: 'OPENED' } }),
        this.prisma.offer.count({ where: { clientCompanyId, status: 'PENDING' } }),
        this.prisma.offer.count({ where: { clientCompanyId, status: 'ACCEPTED' } }),
        this.prisma.offer.count({ where: { clientCompanyId, status: 'DECLINED' } }),
        this.prisma.offer.count({ where: { clientCompanyId, status: 'WITHDRAWN' } }),
      ]);

    return {
      total,
      sent,
      opened,
      pending,
      accepted,
      declined,
      withdrawn,
    };
  }

  /**
   * 複数のオファーステータスを一括更新
   */
  async bulkUpdateStatus(offerIds: bigint[], status: OfferStatus) {
    const result = await this.prisma.offer.updateMany({
      where: {
        id: { in: offerIds },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * オファーを削除（論理削除ではなく物理削除）
   */
  async deleteOffer(id: bigint) {
    // まず関連するofferEngineerを削除
    await this.prisma.offerEngineer.deleteMany({
      where: { offerId: id },
    });

    // その後オファー本体を削除
    return this.prisma.offer.delete({
      where: { id },
    });
  }

  /**
   * 期間内のオファー数を取得
   */
  async countOffersByPeriod(
    clientCompanyId: bigint,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return this.prisma.offer.count({
      where: {
        clientCompanyId,
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  /**
   * 最近のオファー履歴を取得
   */
  async getRecentOffers(clientCompanyId: bigint, limit: number = 10) {
    return this.prisma.offer.findMany({
      where: { clientCompanyId },
      include: {
        offerEngineers: {
          include: {
            engineer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
  }
}

export const offerRepository = new OfferRepository(prisma);
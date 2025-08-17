import { PrismaClient, Prisma, OfferEngineerStatus } from '@prisma/client';

export interface OfferEngineerFilterOptions {
  status?: OfferEngineerStatus[];
}

export interface OfferEngineerStatistics {
  total: number;
  sent: number;
  opened: number;
  pending: number;
  accepted: number;
  declined: number;
}

export class OfferEngineerRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * オファーに複数のエンジニアを追加
   */
  async addEngineersToOffer(offerId: bigint, engineerIds: bigint[]) {
    // 既存のエンジニアを確認
    const existingEngineers = await this.prisma.offerEngineer.findMany({
      where: {
        offerId,
        engineerId: { in: engineerIds },
      },
      select: { engineerId: true },
    });

    const existingEngineerIds = new Set(
      existingEngineers.map(e => e.engineerId.toString())
    );

    // 新規追加するエンジニアのみフィルタリング
    const newEngineerIds = engineerIds.filter(
      id => !existingEngineerIds.has(id.toString())
    );

    if (newEngineerIds.length === 0) {
      return [];
    }

    // 一括挿入
    await this.prisma.offerEngineer.createMany({
      data: newEngineerIds.map(engineerId => ({
        offerId,
        engineerId,
        individualStatus: 'SENT' as OfferEngineerStatus,
      })),
    });

    // 追加されたレコードを返す
    return this.prisma.offerEngineer.findMany({
      where: {
        offerId,
        engineerId: { in: newEngineerIds },
      },
    });
  }

  /**
   * オファーIDでエンジニア一覧を取得
   */
  async findEngineersByOffer(
    offerId: bigint,
    options?: OfferEngineerFilterOptions
  ) {
    const where: Prisma.OfferEngineerWhereInput = {
      offerId,
    };

    if (options?.status && options.status.length > 0) {
      where.individualStatus = { in: options.status };
    }

    return this.prisma.offerEngineer.findMany({
      where,
      include: {
        engineer: {
          include: {
            skillSheet: true,
            company: true,
          },
        },
      },
    });
  }

  /**
   * 個別のエンジニアステータスを更新
   */
  async updateEngineerStatus(
    offerId: bigint,
    engineerId: bigint,
    status: OfferEngineerStatus,
    responseNote?: string
  ) {
    const updateData: Prisma.OfferEngineerUpdateInput = {
      individualStatus: status,
      updatedAt: new Date(),
    };

    if (['ACCEPTED', 'DECLINED'].includes(status)) {
      updateData.respondedAt = new Date();
    }

    if (responseNote) {
      updateData.responseNote = responseNote;
    }

    return this.prisma.offerEngineer.update({
      where: {
        offerId_engineerId: {
          offerId,
          engineerId,
        },
      },
      data: updateData,
    });
  }

  /**
   * 複数のエンジニアステータスを一括更新
   */
  async bulkUpdateStatuses(
    offerId: bigint,
    engineerIds: bigint[],
    status: OfferEngineerStatus
  ) {
    const updateData: Prisma.OfferEngineerUpdateManyArgs['data'] = {
      individualStatus: status,
      updatedAt: new Date(),
    };

    if (['ACCEPTED', 'DECLINED'].includes(status)) {
      updateData.respondedAt = new Date();
    }

    const result = await this.prisma.offerEngineer.updateMany({
      where: {
        offerId,
        engineerId: { in: engineerIds },
      },
      data: updateData,
    });

    return result.count;
  }

  /**
   * オファー対象エンジニアの統計を取得
   */
  async getOfferEngineerStatistics(
    offerId: bigint
  ): Promise<OfferEngineerStatistics> {
    const [total, sent, opened, pending, accepted, declined] = 
      await Promise.all([
        this.prisma.offerEngineer.count({ where: { offerId } }),
        this.prisma.offerEngineer.count({ 
          where: { offerId, individualStatus: 'SENT' } 
        }),
        this.prisma.offerEngineer.count({ 
          where: { offerId, individualStatus: 'OPENED' } 
        }),
        this.prisma.offerEngineer.count({ 
          where: { offerId, individualStatus: 'PENDING' } 
        }),
        this.prisma.offerEngineer.count({ 
          where: { offerId, individualStatus: 'ACCEPTED' } 
        }),
        this.prisma.offerEngineer.count({ 
          where: { offerId, individualStatus: 'DECLINED' } 
        }),
      ]);

    return {
      total,
      sent,
      opened,
      pending,
      accepted,
      declined,
    };
  }

  /**
   * エンジニアIDで関連するオファー一覧を取得
   */
  async findOffersByEngineer(
    engineerId: bigint,
    options?: { status?: OfferEngineerStatus[] }
  ) {
    const where: Prisma.OfferEngineerWhereInput = {
      engineerId,
    };

    if (options?.status && options.status.length > 0) {
      where.individualStatus = { in: options.status };
    }

    return this.prisma.offerEngineer.findMany({
      where,
      include: {
        offer: {
          include: {
            clientCompany: true,
          },
        },
      },
      orderBy: {
        offer: {
          sentAt: 'desc',
        },
      },
    });
  }

  /**
   * オファーからエンジニアを削除
   */
  async removeEngineersFromOffer(offerId: bigint, engineerIds: bigint[]) {
    const result = await this.prisma.offerEngineer.deleteMany({
      where: {
        offerId,
        engineerId: { in: engineerIds },
      },
    });

    return result.count;
  }

  /**
   * エンジニアが他のアクティブなオファーを持っているか確認
   */
  async checkEngineerAvailability(engineerId: bigint): Promise<boolean> {
    const activeOffer = await this.prisma.offerEngineer.findFirst({
      where: {
        engineerId,
        individualStatus: {
          in: ['SENT', 'OPENED', 'PENDING', 'ACCEPTED'],
        },
      },
    });

    return activeOffer === null;
  }

  /**
   * 複数エンジニアの利用可能状況を一括確認
   */
  async checkMultipleEngineersAvailability(
    engineerIds: bigint[]
  ): Promise<Map<string, boolean>> {
    const activeOffers = await this.prisma.offerEngineer.findMany({
      where: {
        engineerId: { in: engineerIds },
        individualStatus: {
          in: ['SENT', 'OPENED', 'PENDING', 'ACCEPTED'],
        },
      },
      select: {
        engineerId: true,
      },
    });

    const busyEngineers = new Set(
      activeOffers.map(o => o.engineerId.toString())
    );

    const availabilityMap = new Map<string, boolean>();
    engineerIds.forEach(id => {
      availabilityMap.set(id.toString(), !busyEngineers.has(id.toString()));
    });

    return availabilityMap;
  }

  /**
   * オファー可能なエンジニアを取得
   */
  async findAvailableEngineers(
    companyId: bigint,
    options?: {
      limit?: number;
      offset?: number;
      includeWorking?: boolean;
    }
  ) {
    const { limit = 50, offset = 0, includeWorking = false } = options || {};

    // サブクエリでアクティブなオファーを持つエンジニアIDを取得
    const activeOfferEngineerIds = await this.prisma.offerEngineer.findMany({
      where: {
        individualStatus: {
          in: ['SENT', 'OPENED', 'PENDING', 'ACCEPTED'],
        },
      },
      select: {
        engineerId: true,
      },
      distinct: ['engineerId'],
    });

    const busyEngineerIds = activeOfferEngineerIds.map(e => e.engineerId);

    const whereCondition: Prisma.EngineerWhereInput = {
      companyId,
      isPublic: true,
      id: {
        notIn: busyEngineerIds,
      },
    };

    if (!includeWorking) {
      whereCondition.currentStatus = {
        in: ['WAITING', 'WAITING_SOON'],
      };
    }

    return this.prisma.engineer.findMany({
      where: whereCondition,
      include: {
        skillSheet: true,
        engineerProjects: {
          where: {
            isCurrent: true,
          },
          include: {
            project: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: [
        { currentStatus: 'asc' },
        { availableDate: 'asc' },
      ],
    });
  }

  /**
   * エンジニアの最新オファー情報を取得
   */
  async getLatestOfferForEngineer(engineerId: bigint) {
    return this.prisma.offerEngineer.findFirst({
      where: {
        engineerId,
      },
      include: {
        offer: {
          include: {
            clientCompany: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
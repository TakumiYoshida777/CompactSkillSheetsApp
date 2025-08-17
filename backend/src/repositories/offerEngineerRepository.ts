import { PrismaClient, Prisma } from '@prisma/client';
import { OfferEngineerStatus } from '../types/offer';

const prisma = new PrismaClient();

interface CreateOfferEngineerData {
  offerId: bigint;
  engineerId: bigint;
  individualStatus: OfferEngineerStatus;
}

interface UpdateStatusData {
  individualStatus: OfferEngineerStatus;
  respondedAt?: Date;
  responseComment?: string;
}

class OfferEngineerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * オファー対象エンジニアを作成
   */
  async create(data: CreateOfferEngineerData) {
    return this.prisma.offerEngineer.create({
      data,
    });
  }

  /**
   * 複数のオファー対象エンジニアを一括作成
   */
  async createMany(offerEngineers: CreateOfferEngineerData[]) {
    return this.prisma.offerEngineer.createMany({
      data: offerEngineers,
    });
  }

  /**
   * オファー対象エンジニアのステータスを更新
   */
  async updateStatus(id: bigint, data: UpdateStatusData) {
    return this.prisma.offerEngineer.update({
      where: { id },
      data,
    });
  }

  /**
   * オファーIDでオファー対象エンジニアを取得
   */
  async findByOfferId(offerId: bigint) {
    return this.prisma.offerEngineer.findMany({
      where: { offerId },
      include: {
        engineer: {
          select: {
            id: true,
            name: true,
            email: true,
            yearsOfExperience: true,
            availableFrom: true,
          },
        },
      },
    });
  }

  /**
   * エンジニアIDでオファー履歴を取得
   */
  async findByEngineerId(engineerId: bigint) {
    return this.prisma.offerEngineer.findMany({
      where: { engineerId },
      include: {
        offer: {
          include: {
            clientCompany: {
              select: {
                id: true,
                name: true,
                contactEmail: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * ステータスでオファー対象エンジニアを検索
   */
  async findByStatus(status: OfferEngineerStatus) {
    return this.prisma.offerEngineer.findMany({
      where: { individualStatus: status },
      include: {
        offer: true,
        engineer: true,
      },
    });
  }

  /**
   * オファーIDとエンジニアIDで検索
   */
  async findByOfferAndEngineer(offerId: bigint, engineerId: bigint) {
    return this.prisma.offerEngineer.findFirst({
      where: {
        offerId,
        engineerId,
      },
    });
  }

  /**
   * 統計情報を取得
   */
  async getStatistics(clientCompanyId: bigint) {
    const [total, accepted, declined, pending] = await Promise.all([
      // 総数
      this.prisma.offerEngineer.count({
        where: {
          offer: {
            clientCompanyId,
          },
        },
      }),
      // 承諾数
      this.prisma.offerEngineer.count({
        where: {
          offer: {
            clientCompanyId,
          },
          individualStatus: 'ACCEPTED',
        },
      }),
      // 辞退数
      this.prisma.offerEngineer.count({
        where: {
          offer: {
            clientCompanyId,
          },
          individualStatus: 'DECLINED',
        },
      }),
      // 保留数
      this.prisma.offerEngineer.count({
        where: {
          offer: {
            clientCompanyId,
          },
          individualStatus: {
            in: ['SENT', 'OPENED', 'PENDING'],
          },
        },
      }),
    ]);

    return {
      total,
      accepted,
      declined,
      pending,
      acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
    };
  }

  /**
   * 期間指定で統計を取得
   */
  async getStatisticsByPeriod(
    clientCompanyId: bigint,
    startDate: Date,
    endDate: Date
  ) {
    return this.prisma.offerEngineer.groupBy({
      by: ['individualStatus'],
      where: {
        offer: {
          clientCompanyId,
          sentAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _count: {
        id: true,
      },
    });
  }

  /**
   * エンジニア別の応答率を取得
   */
  async getEngineerResponseRate(engineerId: bigint) {
    const [total, responded] = await Promise.all([
      this.prisma.offerEngineer.count({
        where: {
          engineerId,
        },
      }),
      this.prisma.offerEngineer.count({
        where: {
          engineerId,
          individualStatus: {
            in: ['ACCEPTED', 'DECLINED'],
          },
        },
      }),
    ]);

    return {
      total,
      responded,
      responseRate: total > 0 ? (responded / total) * 100 : 0,
    };
  }

  /**
   * 最近のオファー応答を取得
   */
  async getRecentResponses(clientCompanyId: bigint, limit: number = 10) {
    return this.prisma.offerEngineer.findMany({
      where: {
        offer: {
          clientCompanyId,
        },
        respondedAt: {
          not: null,
        },
      },
      include: {
        engineer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        offer: {
          select: {
            id: true,
            offerNumber: true,
            projectName: true,
          },
        },
      },
      orderBy: {
        respondedAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * オファー対象エンジニアを削除（オファー取り下げ時）
   */
  async deleteByOfferId(offerId: bigint) {
    return this.prisma.offerEngineer.deleteMany({
      where: { offerId },
    });
  }

  /**
   * 特定のオファーとエンジニアの組み合わせを削除
   */
  async delete(offerId: bigint, engineerId: bigint) {
    return this.prisma.offerEngineer.deleteMany({
      where: {
        offerId,
        engineerId,
      },
    });
  }

  /**
   * 複数ステータス条件でカウント
   */
  async countByStatuses(
    clientCompanyId: bigint,
    statuses: OfferEngineerStatus[]
  ) {
    return this.prisma.offerEngineer.count({
      where: {
        offer: {
          clientCompanyId,
        },
        individualStatus: {
          in: statuses,
        },
      },
    });
  }

  /**
   * スキルマッチング率を計算
   */
  async calculateSkillMatchRate(offerId: bigint, engineerId: bigint) {
    const [offer, engineer] = await Promise.all([
      this.prisma.offer.findUnique({
        where: { id: offerId },
        select: { requiredSkills: true },
      }),
      this.prisma.engineer.findUnique({
        where: { id: engineerId },
      }),
    ]);

    if (!offer || !engineer) {
      return 0;
    }

    // Prismaでは配列フィールドはJsonValueとして型付けされる
    const requiredSkills = Array.isArray(offer.requiredSkills) 
      ? (offer.requiredSkills as string[]) 
      : [];
    
    // engineerのskillsも同様に処理
    const engineerSkills = engineer && 'skills' in engineer && Array.isArray(engineer.skills) 
      ? (engineer.skills as string[])
      : [];

    if (requiredSkills.length === 0) {
      return 100;
    }

    const matchedSkills = requiredSkills.filter((skill: string) =>
      engineerSkills.includes(skill)
    );

    return (matchedSkills.length / requiredSkills.length) * 100;
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

export const offerEngineerRepository = new OfferEngineerRepository();
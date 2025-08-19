import { offerRepository } from '../repositories/offerRepository';
import { offerEngineerRepository } from '../repositories/offerEngineerRepository';
import { engineerRepository } from '../repositories/engineerRepository';

interface CreateOfferData {
  client_company_id: string;
  engineer_ids: string[];
  project_details: {
    name: string;
    period_start: string;
    period_end: string;
    required_skills: string[];
    description: string;
    location?: string;
    rate_min?: number;
    rate_max?: number;
    remarks?: string;
  };
  created_by: string;
}

interface GetOffersParams {
  companyId: string;
  page: number;
  limit: number;
  status?: string;
}

interface GetOfferHistoryParams {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  status?: string;
  period?: string;
}

interface OfferStatistics {
  totalOffers: number;
  monthlyOffers: number;
  weeklyOffers: number;
  todayOffers: number;
  acceptanceRate: number;
  averageResponseTime: number;
  declineRate: number;
}

interface OfferBoardData {
  available_engineers: number;
  monthly_offers: number;
  today_offers: number;
  accepted: number;
  pending: number;
  declined: number;
  engineers: any[];
}

class OfferService {
  /**
   * オファー作成
   */
  async createOffer(data: CreateOfferData) {
    const offerNumber = await offerRepository.getNextOfferNumber();
    
    const offer = await offerRepository.create({
      offerNumber,
      clientCompanyId: data.client_company_id,
      status: 'SENT',
      projectName: data.project_details.name,
      projectPeriodStart: new Date(data.project_details.period_start),
      projectPeriodEnd: new Date(data.project_details.period_end),
      requiredSkills: data.project_details.required_skills,
      projectDescription: data.project_details.description,
      location: data.project_details.location,
      rateMin: data.project_details.rate_min,
      rateMax: data.project_details.rate_max,
      remarks: data.project_details.remarks,
      sentAt: new Date(),
      createdBy: data.created_by
    });
    
    const offerEngineers = data.engineer_ids.map(engineerId => ({
      offerId: offer.id,
      engineerId: BigInt(engineerId),
      individualStatus: 'SENT' as const
    }));
    
    await offerEngineerRepository.createMany(offerEngineers);
    
    return offer;
  }

  /**
   * オファー一覧取得
   */
  async getOffers(params: GetOffersParams) {
    const { companyId, page, limit, status } = params;
    const skip = (page - 1) * limit;
    
    const where: any = {
      clientCompanyId: companyId
    };
    
    if (status) {
      where.status = status;
    }
    
    return await offerRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sentAt: 'desc' }
    });
  }

  /**
   * オファー詳細取得
   */
  async getOfferById(id: string, companyId: string) {
    const offer = await offerRepository.findById(id, {
      include: {
        offerEngineers: {
          include: {
            engineer: true
          }
        }
      }
    });
    
    if (!offer || offer.clientCompanyId !== companyId) {
      return null;
    }
    
    return offer;
  }

  /**
   * オファーステータス更新
   */
  async updateOfferStatus(id: string, status: string, companyId: string) {
    const offer = await offerRepository.findById(id);
    
    if (!offer || offer.clientCompanyId !== companyId) {
      throw new Error('オファーが見つかりません');
    }
    
    const statusMap: Record<string, string> = {
      'withdrawn': 'WITHDRAWN',
      'reminder_sent': 'SENT'
    };
    
    return await offerRepository.update(id, {
      status: statusMap[status]
    });
  }

  /**
   * リマインド情報更新
   */
  async updateReminderInfo(id: string) {
    return await offerRepository.update(id, {
      reminderSentAt: new Date(),
      reminderCount: { increment: 1 }
    });
  }

  /**
   * 一括リマインド
   */
  async bulkRemind(offerIds: string[], companyId: string) {
    const offers = await offerRepository.findByIds(offerIds);
    
    const validOffers = offers.filter(offer => 
      offer.clientCompanyId === companyId && 
      ['SENT', 'OPENED', 'PENDING'].includes(offer.status)
    );
    
    if (validOffers.length > 0) {
      await offerRepository.updateMany(
        validOffers.map(o => o.id),
        {
          reminderSentAt: new Date(),
          reminderCount: { increment: 1 }
        }
      );
    }
    
    return {
      success: validOffers.length,
      failed: offerIds.length - validOffers.length
    };
  }

  /**
   * 一括撤回
   */
  async bulkWithdraw(offerIds: string[], companyId: string) {
    const offers = await offerRepository.findByIds(offerIds);
    
    const validOffers = offers.filter(offer => 
      offer.clientCompanyId === companyId && 
      !['ACCEPTED', 'WITHDRAWN'].includes(offer.status)
    );
    
    if (validOffers.length > 0) {
      await offerRepository.updateMany(
        validOffers.map(o => o.id),
        { status: 'WITHDRAWN' }
      );
    }
    
    return {
      success: validOffers.length,
      failed: offerIds.length - validOffers.length
    };
  }

  /**
   * オファーボードデータ取得
   */
  async getOfferBoardData(companyId: string): Promise<OfferBoardData> {
    const [
      availableEngineers,
      monthlyOffers,
      todayOffers,
      accepted,
      pending,
      declined,
      engineers
    ] = await Promise.all([
      engineerRepository.countAvailableEngineers(companyId),
      offerRepository.countMonthlyOffers(companyId),
      offerRepository.countTodayOffers(companyId),
      offerRepository.countByStatus(companyId, 'ACCEPTED'),
      offerRepository.countByStatus(companyId, 'PENDING'),
      offerRepository.countByStatus(companyId, 'DECLINED'),
      engineerRepository.findAvailableWithOfferStatus(companyId)
    ]);
    
    return {
      available_engineers: availableEngineers,
      monthly_offers: monthlyOffers,
      today_offers: todayOffers,
      accepted,
      pending,
      declined,
      engineers
    };
  }

  /**
   * オファー履歴取得
   */
  async getOfferHistory(params: GetOfferHistoryParams) {
    const { companyId, page, limit, search, status, period } = params;
    const skip = (page - 1) * limit;
    
    const where: any = {
      clientCompanyId: companyId
    };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { projectName: { contains: search } },
        { projectDescription: { contains: search } }
      ];
    }
    
    if (period) {
      const dateRange = this.getPeriodDateRange(period);
      where.sentAt = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }
    
    return await offerRepository.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sentAt: 'desc' },
      include: {
        offerEngineers: {
          include: {
            engineer: true
          }
        }
      }
    });
  }

  /**
   * 統計情報取得
   */
  async getStatistics(companyId: string): Promise<OfferStatistics> {
    const [
      totalOffers,
      monthlyOffers,
      weeklyOffers,
      todayOffers,
      acceptanceRate,
      averageResponseTime,
      declineRate
    ] = await Promise.all([
      offerRepository.countTotal(companyId),
      offerRepository.countMonthlyOffers(companyId),
      offerRepository.countWeeklyOffers(companyId),
      offerRepository.countTodayOffers(companyId),
      offerRepository.calculateAcceptanceRate(companyId),
      offerRepository.calculateAverageResponseTime(companyId),
      offerRepository.calculateDeclineRate(companyId)
    ]);
    
    return {
      totalOffers,
      monthlyOffers,
      weeklyOffers,
      todayOffers,
      acceptanceRate,
      averageResponseTime,
      declineRate
    };
  }

  /**
   * 期間から日付範囲を取得
   */
  private getPeriodDateRange(period: string) {
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case 'last_week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'last_3_months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'last_6_months':
        start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'last_year':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }
    
    return { start, end: now };
  }
}

export const offerService = new OfferService();
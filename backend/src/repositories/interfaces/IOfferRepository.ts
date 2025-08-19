/**
 * オファーリポジトリインターフェース
 */

import { Offer, OfferStatus } from '@prisma/client';

export interface CreateOfferData {
  clientCompanyId: string | bigint;
  engineerIds: string[];
  projectDetails: {
    name: string;
    periodStart: string | Date;
    periodEnd: string | Date;
    requiredSkills?: string[];
    description?: string;
    location?: string;
    rateMin?: number;
    rateMax?: number;
  };
  createdBy: string;
}

export interface OfferFilters {
  companyId: string;
  page?: number;
  limit?: number;
  status?: string | OfferStatus;
  search?: string;
  period?: string;
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

export interface IOfferRepository {
  // 基本的なCRUD操作
  create(data: any): Promise<Offer>;
  findById(id: string | bigint, options?: any): Promise<Offer | null>;
  findByIds(ids: (string | bigint)[]): Promise<Offer[]>;
  findMany(filters: OfferFilters): Promise<{ offers: Offer[]; total: number }>;
  update(id: string | bigint, data: Partial<Offer>): Promise<Offer | null>;
  updateMany(ids: (string | bigint)[], data: Partial<Offer>): Promise<void>;
  delete(id: string | bigint): Promise<boolean>;

  // オファー番号生成
  getNextOfferNumber(): Promise<string>;
  generateOfferNumber?(): Promise<string>;

  // 統計情報
  countTotal(companyId: string): Promise<number>;
  countMonthlyOffers(companyId: string): Promise<number>;
  countWeeklyOffers(companyId: string): Promise<number>;
  countTodayOffers(companyId: string): Promise<number>;
  countByStatus(companyId: string, status: string | OfferStatus): Promise<number>;
  
  // 分析情報
  calculateAcceptanceRate(companyId: string): Promise<number>;
  calculateAverageResponseTime(companyId: string): Promise<number>;
  calculateDeclineRate(companyId: string): Promise<number>;
  getOfferStatistics(companyId: string | bigint): Promise<OfferStatistics>;

  // 期間関連
  countOffersByPeriod(
    companyId: string | bigint,
    startDate: Date,
    endDate: Date
  ): Promise<number>;

  // 詳細取得
  getOfferById?(id: string | bigint): Promise<Offer | null>;
  getOffersByIds?(ids: (string | bigint)[]): Promise<Offer[]>;
  getOffers?(
    companyId: string | bigint,
    filters?: OfferFilters
  ): Promise<Offer[]>;
  getRecentOffers?(
    companyId: string | bigint,
    limit?: number
  ): Promise<Offer[]>;

  // ステータス更新
  updateOfferStatus?(
    id: string | bigint,
    status: string | OfferStatus
  ): Promise<Offer | null>;
  bulkUpdateStatus?(
    offerIds: (string | bigint)[],
    status: string | OfferStatus
  ): Promise<number>;
}
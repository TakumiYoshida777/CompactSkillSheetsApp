/**
 * オファーのステータス
 */
export type OfferStatus = 
  | 'DRAFT'      // 下書き
  | 'SENT'       // 送信済み
  | 'PARTIAL'    // 一部承諾
  | 'COMPLETED'  // 完了
  | 'WITHDRAWN'  // 取り下げ
  | 'EXPIRED';   // 期限切れ

/**
 * オファー対象エンジニアの個別ステータス
 */
export type OfferEngineerStatus = 
  | 'SENT'       // 送信済み
  | 'OPENED'     // 開封済み
  | 'PENDING'    // 検討中
  | 'ACCEPTED'   // 承諾
  | 'DECLINED'   // 辞退
  | 'WITHDRAWN'; // 取り下げ

/**
 * オファー作成データ
 */
export interface CreateOfferData {
  clientCompanyId: string;
  engineerIds: string[];
  projectName: string;
  projectDescription: string;
  projectPeriodStart: Date;
  projectPeriodEnd: Date;
  requiredSkills: string[];
  location?: string;
  rateMin?: number;
  rateMax?: number;
  remarks?: string;
  sendEmail: boolean;
}

/**
 * オファー検索条件
 */
export interface OfferSearchCriteria {
  status?: OfferStatus;
  engineerId?: string;
  projectName?: string;
  period?: 'last_week' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year';
  page?: number;
  limit?: number;
  sortBy?: 'sentAt' | 'createdAt' | 'projectPeriodStart';
  sortOrder?: 'asc' | 'desc';
}

/**
 * オファー統計データ
 */
export interface OfferStatistics {
  totalOffers: number;
  totalEngineers: number;
  acceptedCount: number;
  declinedCount: number;
  pendingCount: number;
  acceptanceRate: number;
  averageResponseTime: number;
  offersByStatus: Record<OfferStatus, number>;
  recentOffers: any[];
  recentResponses: any[];
}

/**
 * オファーボードデータ
 */
export interface OfferBoardData {
  statistics: OfferStatistics;
  availableEngineers: any[];
  activeOffers: any[];
  recentActivity: any[];
}
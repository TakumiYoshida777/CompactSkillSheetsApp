// オファー関連の型定義

export type OfferStatus = 
  | 'none'
  | 'sent'
  | 'opened'
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

export interface Engineer {
  id: string;
  name: string;
  email?: string;
  skills: string[];
  experience: number;
  availability: string;
  availabilityStatus?: 'available' | 'pending' | 'unavailable';
  rate?: {
    min: number;
    max: number;
  };
  hourlyRate?: number; // 後方互換性のため残す
  lastOfferDate?: string | null;
  lastOfferStatus?: OfferStatus | null;
  offerStatus?: OfferStatus;
  offerHistory?: Array<{
    offerId: string;
    projectName: string;
    status: OfferStatus;
    sentAt: string;
  }>;
  company?: string;
  projectHistory?: ProjectHistory[];
}

export interface ProjectHistory {
  id: string;
  projectName: string;
  role: string;
  period: string;
  technologies: string[];
}

export interface Offer {
  id: string;
  offerNumber: string;
  clientCompanyId: string;
  status: OfferStatus;
  projectName: string;
  projectPeriodStart: string;
  projectPeriodEnd: string;
  requiredSkills: string[];
  projectDescription: string;
  location?: string;
  rateMin?: number;
  rateMax?: number;
  remarks?: string;
  sentAt: string;
  openedAt?: string;
  respondedAt?: string;
  reminderSentAt?: string;
  reminderCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  engineers: OfferEngineer[];
}

export interface OfferEngineer {
  id: string;
  offerId: string;
  engineerId: string;
  engineer?: Engineer;
  individualStatus: OfferStatus;
  respondedAt?: string;
  responseNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferSummary {
  totalOffers: number;
  monthlyOffers: number;
  weeklyOffers: number;
  todayOffers: number;
  pendingResponses: number;
  acceptanceRate: number;
  averageResponseTime?: number;
  responseRate?: number;
}

export interface OfferBoardData {
  statistics?: {
    totalEngineers: number;
    availableEngineers: number;
    offeredEngineers: number;
    acceptedOffers: number;
    offerAcceptanceRate: number;
  };
  summary?: OfferSummary;
  engineers: Engineer[];
  recentOffers?: Offer[];
}

export interface CreateOfferDto {
  engineer_ids: string[];
  project_name: string;
  project_period_start: string;
  project_period_end: string;
  required_skills: string[];
  project_description: string;
  location?: string;
  rate_min?: number;
  rate_max?: number;
  remarks?: string;
  send_email: boolean;
}

export interface UpdateOfferStatusDto {
  status: OfferStatus;
  reason?: string;
}

export interface OfferFilter {
  status?: OfferStatus[];
  engineerId?: string;
  dateFrom?: string;
  dateTo?: string;
  projectName?: string;
  skills?: string[];
}

export interface OfferStatistics {
  totalSent: number;
  totalOpened: number;
  totalAccepted: number;
  totalDeclined: number;
  totalPending: number;
  acceptanceRate: number;
  averageResponseTime: number;
  monthlyTrend: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  sent: number;
  accepted: number;
  declined: number;
}

export interface EngineerOfferStatus {
  engineerId: string;
  hasActiveOffer: boolean;
  lastOfferDate?: string;
  offerCount: number;
  status?: 'available' | 'pending' | 'accepted' | 'rejected';
}

export interface EngineerFilter {
  skills?: string[];
  minExperience?: number;
  maxExperience?: number;
  location?: string;
  availability?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export interface MonthlyStatistics {
  month: string;
  year: number;
  sentOffers: number;
  acceptedOffers: number;
  rejectedOffers: number;
  conversionRate: number;
  revenue?: number;
}

export interface CompanyStatistics {
  companyId: string;
  companyName: string;
  totalOffers: number;
  acceptedOffers: number;
  conversionRate: number;
  totalRevenue?: number;
}

export interface ConversionRateData {
  overall: number;
  byMonth: Array<{
    month: string;
    rate: number;
  }>;
  byCompany: Array<{
    companyName: string;
    rate: number;
  }>;
}

export interface ReportParams {
  type: 'summary' | 'detailed' | 'analytics';
  format: 'pdf' | 'excel';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface ReportData {
  id: string;
  type: string;
  format: string;
  status: 'pending' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

// ページネーション関連の型定義
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// API用のフィルタ型（ページネーション含む）
export interface OfferFilters extends OfferFilter {
  page?: number;
  limit?: number;
}
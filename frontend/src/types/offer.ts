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
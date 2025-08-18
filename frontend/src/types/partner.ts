// 取引先企業関連の型定義

export interface BusinessPartner {
  id: string
  companyId: string
  partnerCompanyName: string
  partnerCompanyEmail: string
  partnerCompanyPhone?: string
  partnerCompanyAddress?: string
  websiteUrl?: string
  contractStatus: 'active' | 'expired' | 'pending'
  contractStartDate: string
  contractEndDate?: string
  maxViewableEngineers: number
  currentViewableEngineers: number
  contactPerson?: {
    name: string
    email: string
    phone?: string
    position?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PartnerPermissions {
  partnerId: string
  viewAllEngineers: boolean
  viewWaitingEngineers: boolean
  viewWorkingEngineers: boolean
  canSendOffers: boolean
  canViewDetailedSkillSheet: boolean
  allowedEngineers: string[] // エンジニアIDのリスト
  blockedEngineers: string[] // NG設定されたエンジニアIDのリスト
  maxOfferPerMonth?: number
  currentMonthOfferCount: number
  ipRestriction?: string[] // 許可IPアドレスリスト
}

export interface PartnerUser {
  id: string
  partnerId: string
  name: string
  email: string
  role: 'admin' | 'sales' | 'pm' | 'viewer'
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface AccessUrl {
  id: string
  partnerId: string
  url: string
  token: string
  expiresAt: string
  createdBy: string
  createdAt: string
  lastAccessedAt?: string
  accessCount: number
  isActive: boolean
}

export interface PartnerFilters {
  contractStatus?: 'active' | 'expired' | 'pending'
  searchQuery?: string
  sortBy?: 'name' | 'createdAt' | 'contractEndDate'
  sortOrder?: 'asc' | 'desc'
}

export interface PartnerStatistics {
  totalPartners: number
  activePartners: number
  expiredContracts: number
  totalOffersSent: number
  averageConversionRate: number
  monthlyTrend: {
    month: string
    partners: number
    offers: number
  }[]
}
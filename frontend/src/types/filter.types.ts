/**
 * フィルター関連の型定義
 */

export interface BaseFilter {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRangeFilter {
  startDate?: string
  endDate?: string
}

export interface StatusFilter<T = string> {
  status?: T | T[]
}

export interface SearchFilter {
  keyword?: string
  searchFields?: string[]
}

export interface EngineerFilter extends BaseFilter, SearchFilter {
  skills?: string[]
  minExperience?: number
  maxExperience?: number
  engineerType?: string[]
  availableFrom?: string
  availableTo?: string
  location?: string[]
  contractType?: string[]
  minRate?: number
  maxRate?: number
  languages?: string[]
  certifications?: string[]
  excludeIds?: string[]
}

export interface PartnerFilter extends BaseFilter, SearchFilter {
  industry?: string[]
  companySize?: string[]
  location?: string[]
  contractStatus?: string[]
  minRevenue?: number
  maxRevenue?: number
}

export interface ProjectFilter extends BaseFilter, SearchFilter, DateRangeFilter, StatusFilter {
  clientId?: string
  engineerId?: string
  projectType?: string[]
  budget?: {
    min?: number
    max?: number
  }
  technologies?: string[]
}

export interface OfferFilterParams extends BaseFilter, DateRangeFilter {
  partnerId?: string
  engineerId?: string
  status?: string[]
  offerType?: string[]
  minAmount?: number
  maxAmount?: number
  hasResponse?: boolean
}
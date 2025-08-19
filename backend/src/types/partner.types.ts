// 取引先関連の型定義

export interface PartnerCreateInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contractStatus?: 'active' | 'inactive' | 'pending';
  contractStartDate?: Date;
  contractEndDate?: Date;
  maxViewableEngineers?: number;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  notes?: string;
}

export interface PartnerUpdateInput extends Partial<PartnerCreateInput> {}

export interface PartnerPermissions {
  canViewEngineers: boolean;
  canSendOffers: boolean;
  maxViewableEngineers: number;
  visibleEngineerIds: number[];
  ngEngineerIds: number[];
  autoPublishWaiting: boolean;
  customPermissions?: Record<string, any>;
}

export interface AccessUrlCreateInput {
  expiresIn?: number; // days
  maxUses?: number;
}

export interface PartnerUserCreateInput {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'viewer' | 'editor';
}

export interface PartnerStatistics {
  totalOffers: number;
  totalViews: number;
  visibleEngineers: number;
  activeUsers: number;
  contractStatus: string;
  contractEndDate?: Date;
}
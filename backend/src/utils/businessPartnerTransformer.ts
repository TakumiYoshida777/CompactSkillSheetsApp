/**
 * BusinessPartner データ変換層
 * 
 * 目的：
 * - 正式なPrismaモデルと暫定実装のレスポンス形式の変換
 * - 後方互換性の維持
 * - 段階的移行のサポート
 */

import { 
  BusinessPartner, 
  Company, 
  ClientUser,
  BusinessPartnerDetail,
  BusinessPartnerSetting,
  Approach,
  Prisma
} from '@prisma/client';

// 暫定実装のレスポンス形式
export interface LegacyBusinessPartnerResponse {
  id: string;
  companyName: string;
  companyNameKana?: string;
  industry?: string;
  employeeSize?: string;
  website?: string;
  phone?: string;
  address?: string;
  businessDescription?: string;
  contacts: LegacyContact[];
  contractTypes?: string[];
  budgetMin?: number;
  budgetMax?: number;
  preferredSkills?: string[];
  preferredIndustries?: string[];
  requirements?: string;
  status: 'active' | 'inactive' | 'prospective';
  registeredDate: string;
  lastContactDate?: string;
  totalProposals: number;
  acceptedProposals: number;
  currentEngineers: number;
  monthlyRevenue?: number;
  totalRevenue?: number;
  rating?: number;
  tags?: string[];
  paymentTerms?: string;
  autoEmailEnabled?: boolean;
  followUpEnabled?: boolean;
  notes?: string;
  approaches?: LegacyApproach[];
}

export interface LegacyContact {
  id: string;
  name: string;
  department?: string;
  position?: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

export interface LegacyApproach {
  id: string;
  date: string;
  type: 'email' | 'phone' | 'meeting' | 'proposal';
  subject: string;
  engineerCount?: number;
  status: 'sent' | 'replied' | 'pending' | 'accepted' | 'rejected';
  note?: string;
}

// 拡張された型定義（リレーションを含む）
export type BusinessPartnerWithRelations = BusinessPartner & {
  clientCompany: Company;
  sesCompany?: Partial<Company>;
  clientUsers?: ClientUser[];
  detail?: BusinessPartnerDetail | null;
  setting?: BusinessPartnerSetting | null;
  approaches?: any[];
};

/**
 * Prismaモデルから暫定実装形式への変換
 */
export function transformToLegacyFormat(
  partner: BusinessPartnerWithRelations
): LegacyBusinessPartnerResponse {
  
  const clientCompany = partner.clientCompany;
  const detail = partner.detail;
  
  // ステータスの判定
  const status = determineStatus(partner);
  
  // 担当者情報の変換
  const contacts = transformContacts(partner.clientUsers || []);
  
  // アプローチ履歴の変換
  const approaches = transformApproaches(partner.approaches || []);
  
  return {
    id: partner.id.toString(),
    companyName: clientCompany.name,
    companyNameKana: detail?.companyNameKana || clientCompany.nameKana || undefined,
    industry: detail?.industry || clientCompany.industry || undefined,
    employeeSize: detail?.employeeSize || clientCompany.employeeCount || undefined,
    website: clientCompany.website || undefined,
    phone: clientCompany.phone || undefined,
    address: clientCompany.address || undefined,
    businessDescription: detail?.businessDescription || undefined,
    contacts,
    contractTypes: parseJsonArray(detail?.contractTypes),
    budgetMin: detail?.budgetMin || undefined,
    budgetMax: detail?.budgetMax || undefined,
    preferredSkills: parseJsonArray(detail?.preferredSkills),
    preferredIndustries: parseJsonArray(detail?.preferredIndustries),
    requirements: detail?.requirements || undefined,
    status,
    registeredDate: partner.createdAt.toISOString(),
    lastContactDate: detail?.lastContactDate?.toISOString(),
    totalProposals: detail?.totalProposals || 0,
    acceptedProposals: detail?.acceptedProposals || 0,
    currentEngineers: detail?.currentEngineers || 0,
    monthlyRevenue: detail?.monthlyRevenue || undefined,
    totalRevenue: detail?.totalRevenue || undefined,
    rating: detail?.rating || undefined,
    tags: parseJsonArray(detail?.tags),
    paymentTerms: detail?.paymentTerms || undefined,
    autoEmailEnabled: detail?.autoEmailEnabled || false,
    followUpEnabled: detail?.followUpEnabled || false,
    notes: detail?.notes || undefined,
    approaches
  };
}

/**
 * 暫定実装形式からPrismaモデルへの変換（作成用）
 */
export function transformFromLegacyForCreate(
  data: Partial<LegacyBusinessPartnerResponse>,
  sesCompanyId: bigint,
  createdBy: bigint
) {
  return {
    businessPartner: {
      sesCompanyId,
      createdBy,
      isActive: data.status !== 'inactive',
      // accessUrlとurlTokenは自動生成が必要
    },
    detail: {
      companyNameKana: data.companyNameKana,
      industry: data.industry,
      employeeSize: data.employeeSize,
      businessDescription: data.businessDescription,
      contractTypes: data.contractTypes ? JSON.stringify(data.contractTypes) : undefined,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      preferredSkills: data.preferredSkills ? JSON.stringify(data.preferredSkills) : undefined,
      preferredIndustries: data.preferredIndustries ? JSON.stringify(data.preferredIndustries) : undefined,
      requirements: data.requirements,
      rating: data.rating,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      paymentTerms: data.paymentTerms,
      autoEmailEnabled: data.autoEmailEnabled,
      followUpEnabled: data.followUpEnabled,
      notes: data.notes,
      currentEngineers: data.currentEngineers || 0,
      monthlyRevenue: data.monthlyRevenue || 0,
      totalProposals: data.totalProposals || 0,
      acceptedProposals: data.acceptedProposals || 0,
      lastContactDate: data.lastContactDate ? new Date(data.lastContactDate) : undefined
    }
  };
}

/**
 * 暫定実装形式からPrismaモデルへの変換（更新用）
 */
export function transformFromLegacyForUpdate(
  data: Partial<LegacyBusinessPartnerResponse>
) {
  const updateData: any = {
    businessPartner: {},
    detail: {}
  };
  
  if (data.status !== undefined) {
    updateData.businessPartner.isActive = data.status !== 'inactive';
  }
  
  // BusinessPartnerDetailの更新データ
  const detailFields = [
    'companyNameKana', 'industry', 'employeeSize', 'businessDescription',
    'budgetMin', 'budgetMax', 'requirements', 'rating', 'paymentTerms',
    'autoEmailEnabled', 'followUpEnabled', 'notes', 'currentEngineers',
    'monthlyRevenue', 'totalProposals', 'acceptedProposals'
  ];
  
  detailFields.forEach(field => {
    if (data[field as keyof LegacyBusinessPartnerResponse] !== undefined) {
      updateData.detail[field] = data[field as keyof LegacyBusinessPartnerResponse];
    }
  });
  
  // JSON配列フィールドの処理
  if (data.contractTypes) {
    updateData.detail.contractTypes = JSON.stringify(data.contractTypes);
  }
  if (data.preferredSkills) {
    updateData.detail.preferredSkills = JSON.stringify(data.preferredSkills);
  }
  if (data.preferredIndustries) {
    updateData.detail.preferredIndustries = JSON.stringify(data.preferredIndustries);
  }
  if (data.tags) {
    updateData.detail.tags = JSON.stringify(data.tags);
  }
  if (data.lastContactDate) {
    updateData.detail.lastContactDate = new Date(data.lastContactDate);
  }
  
  return updateData;
}

/**
 * ClientUserから暫定実装のContactへの変換
 */
function transformContacts(clientUsers: ClientUser[]): LegacyContact[] {
  return clientUsers.map((user, index) => ({
    id: user.id.toString(),
    name: user.name,
    department: user.department || undefined,
    position: user.position || undefined,
    email: user.email,
    phone: user.phone || undefined,
    isPrimary: index === 0 // 最初のユーザーを主担当とする
  }));
}

/**
 * Approachから暫定実装のアプローチ履歴への変換
 */
function transformApproaches(approaches: any[]): LegacyApproach[] {
  return approaches.map(approach => ({
    id: approach.id.toString(),
    date: approach.sentAt.toISOString(),
    type: mapApproachType(approach.approachType),
    subject: approach.messageContent || 'アプローチ',
    engineerCount: approach.targetEngineers ? 
      (Array.isArray(approach.targetEngineers) ? approach.targetEngineers.length : 1) : undefined,
    status: mapApproachStatus(approach.status),
    note: approach.projectDetails || undefined
  }));
}

/**
 * ステータスの判定
 */
function determineStatus(partner: BusinessPartnerWithRelations): 'active' | 'inactive' | 'prospective' {
  if (!partner.isActive) {
    return 'inactive';
  }
  
  // 詳細情報がある場合は、エンジニア数で判定
  if (partner.detail && partner.detail.currentEngineers > 0) {
    return 'active';
  }
  
  // それ以外は見込み
  return 'prospective';
}

/**
 * JSON配列のパース
 */
function parseJsonArray(jsonData: any): string[] | undefined {
  if (!jsonData) return undefined;
  
  try {
    if (typeof jsonData === 'string') {
      return JSON.parse(jsonData);
    }
    if (Array.isArray(jsonData)) {
      return jsonData;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * アプローチタイプのマッピング
 */
function mapApproachType(type: string): 'email' | 'phone' | 'meeting' | 'proposal' {
  const typeMap: { [key: string]: 'email' | 'phone' | 'meeting' | 'proposal' } = {
    'EMAIL': 'email',
    'PHONE': 'phone',
    'MEETING': 'meeting',
    'PROPOSAL': 'proposal',
    'DIRECT': 'meeting',
    'REFERRAL': 'meeting'
  };
  return typeMap[type] || 'email';
}

/**
 * アプローチステータスのマッピング
 */
function mapApproachStatus(status: string): 'sent' | 'replied' | 'pending' | 'accepted' | 'rejected' {
  const statusMap: { [key: string]: 'sent' | 'replied' | 'pending' | 'accepted' | 'rejected' } = {
    'SENT': 'sent',
    'OPENED': 'sent',
    'REPLIED': 'replied',
    'PENDING': 'pending',
    'ACCEPTED': 'accepted',
    'REJECTED': 'rejected'
  };
  return statusMap[status] || 'pending';
}

/**
 * 一括変換（リスト用）
 */
export function transformListToLegacyFormat(
  partners: BusinessPartnerWithRelations[]
): LegacyBusinessPartnerResponse[] {
  return partners.map(partner => transformToLegacyFormat(partner));
}
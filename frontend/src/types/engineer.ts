/**
 * エンジニア関連の型定義
 */

/**
 * エンジニア種別
 */
export type EngineerType = 'employee' | 'partner' | 'freelance';

/**
 * エンジニアステータス
 */
export type EngineerStatus = 'working' | 'waiting' | 'adjusting' | 'leaving';

/**
 * エンジニア基本情報
 */
export interface Engineer {
  id: string;
  name: string;
  nameKana?: string;
  email: string;
  phone?: string;
  engineerType: EngineerType;
  currentStatus: EngineerStatus;
  availableDate?: string | null;
  nearestStation?: string;
  birthDate?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  githubUrl?: string;
  portfolioUrl?: string;
  profileImageUrl?: string;
  companyId: string;
  isPublic: boolean;
  joinDate?: string;
  yearsOfExperience?: number;
  
  // リレーション
  skillSheet?: SkillSheetSummary;
  currentProject?: ProjectSummary;
  tags?: string[];
  
  // メタ情報
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

/**
 * スキルシートサマリー
 */
export interface SkillSheetSummary {
  id: string;
  isCompleted: boolean;
  completionRate: number;
  lastUpdatedAt: string;
  mainSkills: string[];
}

/**
 * プロジェクトサマリー
 */
export interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  startDate: string;
  endDate?: string;
  role: string;
}

/**
 * エンジニア一覧レスポンス
 */
export interface EngineerListResponse {
  data: Engineer[];
  meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

/**
 * エンジニア検索パラメータ
 */
export interface EngineerFilterParams {
  // 基本フィルター
  search?: string;
  status?: EngineerStatus | EngineerStatus[];
  engineerType?: EngineerType | EngineerType[];
  companyId?: string;
  
  // スキルフィルター
  skills?: string[];
  skillLevel?: number;
  
  // 経験年数フィルター
  experienceYearsMin?: number;
  experienceYearsMax?: number;
  
  // 稼働可能日フィルター
  availableFrom?: string;
  availableTo?: string;
  
  // その他のフィルター
  isPublic?: boolean;
  hasSkillSheet?: boolean;
  tags?: string[];
  
  // ページネーション
  page?: number;
  limit?: number;
  
  // ソート
  sortBy?: 'name' | 'experience' | 'availableDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * エンジニア作成リクエスト
 */
export interface EngineerCreateRequest {
  name: string;
  nameKana?: string;
  email: string;
  phone?: string;
  engineerType: EngineerType;
  currentStatus?: EngineerStatus;
  availableDate?: string;
  nearestStation?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  githubUrl?: string;
  portfolioUrl?: string;
  joinDate?: string;
  yearsOfExperience?: number;
  tags?: string[];
}

/**
 * エンジニア更新リクエスト
 */
export interface EngineerUpdateRequest extends Partial<EngineerCreateRequest> {
  isPublic?: boolean;
}

/**
 * 一括ステータス更新リクエスト
 */
export interface BulkStatusUpdateRequest {
  engineerIds: string[];
  status: EngineerStatus;
  availableDate?: string;
}

/**
 * エクスポート形式
 */
export type ExportFormat = 'csv' | 'excel';

/**
 * エンジニア統計情報
 */
export interface EngineerStatistics {
  total: number;
  byStatus: {
    working: number;
    waiting: number;
    adjusting: number;
    leaving: number;
  };
  byType: {
    employee: number;
    partner: number;
    freelance: number;
  };
  skillSheetCompleted: number;
  publicProfiles: number;
  averageExperience: number;
}
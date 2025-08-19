/**
 * エンジニアリポジトリインターフェース
 */

export interface Engineer {
  id: string | bigint;
  name: string;
  email: string;
  companyId: string | bigint;
  skills?: string[];
  experienceYears?: number;
  hourlyRate?: number;
  status?: string;
  engineerId?: string;
  phone?: string;
  availableFrom?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EngineerFilters {
  companyId?: string | bigint;
  status?: string;
  skills?: string[];
  minExperience?: number;
  maxExperience?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EngineerWithOfferStatus extends Engineer {
  lastOfferDate?: Date | null;
  offerCount?: number;
  offerStatus?: string | null;
}

export interface IEngineerRepository {
  // 基本的なCRUD操作
  create(data: Partial<Engineer>): Promise<Engineer>;
  findById(id: string | bigint): Promise<Engineer | null>;
  findByIds(ids: (string | bigint)[]): Promise<Engineer[]>;
  findByCompanyId(companyId: string | bigint): Promise<Engineer[]>;
  update(id: string | bigint, data: Partial<Engineer>): Promise<Engineer | null>;
  delete(id: string | bigint): Promise<boolean>;

  // 検索・フィルタリング
  findAvailable(companyId: string | bigint): Promise<Engineer[]>;
  findByFilters(filters: EngineerFilters): Promise<{
    engineers: Engineer[];
    total: number;
  }>;
  search(query: string, companyId?: string | bigint): Promise<Engineer[]>;

  // 統計情報
  count(companyId?: string | bigint): Promise<number>;
  countAvailableEngineers(companyId: string | bigint): Promise<number>;
  countByStatus(companyId: string | bigint, status: string): Promise<number>;
  countBySkill(companyId: string | bigint, skill: string): Promise<number>;

  // オファー関連
  findAvailableWithOfferStatus(
    companyId: string | bigint
  ): Promise<EngineerWithOfferStatus[]>;
  getEngineerWithOfferHistory(
    engineerId: string | bigint,
    companyId: string | bigint
  ): Promise<EngineerWithOfferStatus | null>;

  // スキル関連
  getUniqueSkills(companyId?: string | bigint): Promise<string[]>;
  findBySkills(
    skills: string[],
    companyId?: string | bigint
  ): Promise<Engineer[]>;

  // ステータス管理
  updateStatus(
    id: string | bigint,
    status: string
  ): Promise<Engineer | null>;
  bulkUpdateStatus(
    ids: (string | bigint)[],
    status: string
  ): Promise<number>;

  // 経験年数関連
  findByExperienceRange(
    minYears: number,
    maxYears: number,
    companyId?: string | bigint
  ): Promise<Engineer[]>;
  getAverageExperience(companyId?: string | bigint): Promise<number>;

  // 単価関連
  findByRateRange(
    minRate: number,
    maxRate: number,
    companyId?: string | bigint
  ): Promise<Engineer[]>;
  getAverageRate(companyId?: string | bigint): Promise<number>;
}
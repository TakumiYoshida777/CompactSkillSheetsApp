import { PrismaClient } from '@prisma/client';
import { PaginationOptions } from '../middleware/pagination.middleware';
import { SortOptions, FilterOptions } from '../middleware/pagination.middleware';
import { BaseFilterOptions, PaginatedResult } from '../types/repository.types';

export interface RepositoryOptions {
  pagination?: PaginationOptions;
  sort?: SortOptions;
  filters?: FilterOptions;
  include?: Record<string, boolean | object>;
  select?: Record<string, boolean | object>;
}

export interface FindAllResult<T> {
  data: T[];
  total: number;
}

/**
 * ベースリポジトリクラス
 * 全てのリポジトリの基底クラス
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected modelName: string;
  
  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }
  
  /**
   * 全件取得（ページネーション付き）
   */
  async findAll(
    companyId: number,
    options?: RepositoryOptions
  ): Promise<FindAllResult<T>> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    // WHERE条件の構築
    const where: Record<string, any> = { companyId };
    
    // フィルタ条件の追加
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // 文字列の場合は部分一致検索
          if (typeof value === 'string' && !['true', 'false'].includes(value)) {
            where[key] = { contains: value, mode: 'insensitive' };
          } else if (value === 'true' || value === 'false') {
            where[key] = value === 'true';
          } else {
            where[key] = value;
          }
        }
      });
    }
    
    // ソート条件の構築
    const orderBy = options?.sort 
      ? { [options.sort.field]: options.sort.order }
      : { createdAt: 'desc' };
    
    // データ取得
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        skip: options?.pagination?.offset,
        take: options?.pagination?.limit,
        include: options?.include,
        select: options?.select
      }),
      model.count({ where })
    ]);
    
    return { data, total };
  }
  
  /**
   * ID指定で1件取得
   */
  async findById(
    id: number,
    companyId: number,
    options?: Pick<RepositoryOptions, 'include' | 'select'>
  ): Promise<T | null> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    return model.findFirst({
      where: { id, companyId },
      include: options?.include,
      select: options?.select
    });
  }
  
  /**
   * 条件指定で1件取得
   */
  async findOne(
    where: Record<string, any>,
    options?: Pick<RepositoryOptions, 'include' | 'select'>
  ): Promise<T | null> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    return model.findFirst({
      where,
      include: options?.include,
      select: options?.select
    });
  }
  
  /**
   * 新規作成
   */
  async create(
    data: CreateInput,
    companyId: number,
    options?: Pick<RepositoryOptions, 'include' | 'select'>
  ): Promise<T> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    return model.create({
      data: {
        ...data,
        companyId
      },
      include: options?.include,
      select: options?.select
    });
  }
  
  /**
   * 更新
   */
  async update(
    id: number,
    data: UpdateInput,
    companyId: number,
    options?: Pick<RepositoryOptions, 'include' | 'select'>
  ): Promise<T> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    // 存在確認（企業IDも含めてチェック）
    const exists = await model.findFirst({
      where: { id, companyId }
    });
    
    if (!exists) {
      throw new Error('更新対象が見つかりません');
    }
    
    return model.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: options?.include,
      select: options?.select
    });
  }
  
  /**
   * 削除
   */
  async delete(id: number, companyId: number): Promise<boolean> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    // 存在確認（企業IDも含めてチェック）
    const exists = await model.findFirst({
      where: { id, companyId }
    });
    
    if (!exists) {
      return false;
    }
    
    await model.delete({
      where: { id }
    });
    
    return true;
  }
  
  /**
   * 複数削除
   */
  async deleteMany(ids: number[], companyId: number): Promise<number> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    const result = await model.deleteMany({
      where: {
        id: { in: ids },
        companyId
      }
    });
    
    return result.count;
  }
  
  /**
   * カウント
   */
  async count(companyId: number, filters?: FilterOptions): Promise<number> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    const where: any = { companyId };
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          where[key] = value;
        }
      });
    }
    
    return model.count({ where });
  }
  
  /**
   * 存在確認
   */
  async exists(id: number, companyId: number): Promise<boolean> {
    const count = await this.count(companyId, { id });
    return count > 0;
  }
  
  /**
   * トランザクション実行
   */
  async transaction<R>(fn: (tx: PrismaClient) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }
  
  /**
   * バルクインサート
   */
  async createMany(
    data: CreateInput[],
    companyId: number
  ): Promise<number> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    const dataWithCompanyId = data.map(item => ({
      ...item,
      companyId
    }));
    
    const result = await model.createMany({
      data: dataWithCompanyId
    });
    
    return result.count;
  }
  
  /**
   * バルクアップデート
   */
  async updateMany(
    where: any,
    data: UpdateInput,
    companyId: number
  ): Promise<number> {
    const model = (this.prisma as Record<string, any>)[this.modelName];
    
    const result = await model.updateMany({
      where: {
        ...where,
        companyId
      },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    
    return result.count;
  }
}
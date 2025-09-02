/**
 * リポジトリ層の型定義
 */

import { Prisma } from '@prisma/client';

/**
 * リポジトリオプションの基本型
 */
export interface BaseRepositoryOptions {
  page?: number;
  limit?: number;
  offset?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * フィルター条件の基本型
 */
export interface BaseFilterOptions {
  [key: string]: string | number | boolean | Date | bigint | undefined | null;
}

/**
 * リポジトリのfindManyオプション
 */
export interface RepositoryFindManyOptions extends BaseRepositoryOptions {
  filters?: BaseFilterOptions;
  include?: Record<string, boolean | object>;
  select?: Record<string, boolean | object>;
}

/**
 * リポジトリのfindOneオプション
 */
export interface RepositoryFindOneOptions {
  include?: Record<string, boolean | object>;
  select?: Record<string, boolean | object>;
}

/**
 * ページネーション付き結果の型
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

/**
 * Prismaのwhere条件型
 */
export type WhereCondition<T> = Prisma.Args<T, 'findMany'>['where'];

/**
 * Prismaのinclude条件型
 */
export type IncludeCondition<T> = Prisma.Args<T, 'findMany'>['include'];

/**
 * Prismaのselect条件型
 */
export type SelectCondition<T> = Prisma.Args<T, 'findMany'>['select'];

/**
 * Prismaのorderby条件型
 */
export type OrderByCondition<T> = Prisma.Args<T, 'findMany'>['orderBy'];

/**
 * 作成データの型
 */
export type CreateInput<T> = Prisma.Args<T, 'create'>['data'];

/**
 * 更新データの型
 */
export type UpdateInput<T> = Prisma.Args<T, 'update'>['data'];

/**
 * バルク作成データの型
 */
export type CreateManyInput<T> = Prisma.Args<T, 'createMany'>['data'];

/**
 * トランザクション処理の型
 */
export type TransactionClient = Prisma.TransactionClient;

/**
 * リポジトリインターフェースの基本型
 */
export interface BaseRepository<T, CreateData, UpdateData> {
  findAll(options?: RepositoryFindManyOptions): Promise<PaginatedResult<T>>;
  findById(id: number | bigint | string): Promise<T | null>;
  findOne(where: Partial<T>, options?: RepositoryFindOneOptions): Promise<T | null>;
  create(data: CreateData): Promise<T>;
  update(id: number | bigint | string, data: UpdateData): Promise<T>;
  delete(id: number | bigint | string): Promise<void>;
  count(filters?: BaseFilterOptions): Promise<number>;
}

/**
 * 企業IDを含むリポジトリインターフェース
 */
export interface CompanyRepository<T, CreateData, UpdateData> extends BaseRepository<T, CreateData, UpdateData> {
  findByCompany(companyId: number | bigint, options?: RepositoryFindManyOptions): Promise<PaginatedResult<T>>;
  findByIdAndCompany(id: number | bigint | string, companyId: number | bigint): Promise<T | null>;
  updateByCompany(id: number | bigint | string, companyId: number | bigint, data: UpdateData): Promise<T>;
  deleteByCompany(id: number | bigint | string, companyId: number | bigint): Promise<void>;
}

/**
 * JSONフィールドの型
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {}

/**
 * Prismaモデルの型マッピング
 */
export interface PrismaModelTypes {
  Engineer: 'engineer';
  Project: 'project';
  BusinessPartner: 'businessPartner';
  Approach: 'approach';
  Offer: 'offer';
  Company: 'company';
  User: 'user';
  SkillSheet: 'skillSheet';
  EmailTemplate: 'emailTemplate';
}

/**
 * BigInt変換用のヘルパー型
 */
export interface SerializedBigInt {
  id: string;
  [key: string]: unknown;
}

/**
 * BigIntを含むオブジェクトのシリアライズ結果
 */
export type SerializeObject<T> = {
  [K in keyof T]: T[K] extends bigint 
    ? string 
    : T[K] extends Date 
    ? string 
    : T[K] extends object 
    ? SerializeObject<T[K]> 
    : T[K];
};
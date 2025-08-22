import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface Partner {
  id: number;
  companyId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contractStatus: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  maxViewableEngineers: number;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartnerInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contractStatus?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  maxViewableEngineers?: number;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  notes?: string;
}

export interface UpdatePartnerInput extends Partial<CreatePartnerInput> {}

export class PartnerRepository extends BaseRepository<Partner, CreatePartnerInput, UpdatePartnerInput> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'businessPartner');
  }
  
  // BigIntとDateをシリアライズするヘルパー関数
  private serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeBigInt(item));
    }
    
    if (typeof obj === 'object') {
      const serialized: any = {};
      for (const key in obj) {
        serialized[key] = this.serializeBigInt(obj[key]);
      }
      return serialized;
    }
    
    return obj;
  }
  
  // BusinessPartnerモデルはcompanyIdではなくsesCompanyIdを使用するため、findAllをオーバーライド
  async findAll(
    companyId: number | string,
    options?: any
  ): Promise<{ data: any[]; total: number }> {
    const model = (this.prisma as any)[this.modelName];
    
    // company-1のような形式から数値部分を抽出してBigIntに変換
    const numericId = typeof companyId === 'string' && companyId.includes('-') 
      ? companyId.split('-').pop() 
      : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    
    // companyIdをsesCompanyIdに変換
    const where: any = { sesCompanyId: companyIdBigInt };
    
    // フィルター条件の追加
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string' && value.includes(',')) {
            where[key] = { in: value.split(',').map(v => v.trim()) };
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
    
    // BigIntをstringに変換
    const serializedData = this.serializeBigInt(data);
    
    return { data: serializedData, total };
  }
  
  // findByIdもオーバーライド
  async findById(
    id: number,
    companyId: number | string,
    options?: any
  ): Promise<any | null> {
    const model = (this.prisma as any)[this.modelName];
    
    // company-1のような形式から数値部分を抽出してBigIntに変換
    const numericId = typeof companyId === 'string' && companyId.includes('-') 
      ? companyId.split('-').pop() 
      : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    
    const result = await model.findFirst({
      where: { 
        id: BigInt(id), 
        sesCompanyId: companyIdBigInt 
      },
      include: options?.include,
      select: options?.select
    });
    
    return this.serializeBigInt(result);
  }
  
  // createもオーバーライド
  async create(
    data: CreatePartnerInput,
    companyId: number | string,
    options?: any
  ): Promise<any> {
    const model = (this.prisma as any)[this.modelName];
    
    // company-1のような形式から数値部分を抽出してBigIntに変換
    const numericId = typeof companyId === 'string' && companyId.includes('-') 
      ? companyId.split('-').pop() 
      : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    
    const result = await model.create({
      data: {
        ...data,
        sesCompanyId: companyIdBigInt,
        clientCompanyId: companyIdBigInt, // 暫定的に同じ値を設定
        accessUrl: `https://partner-${Date.now()}.example.com`,
        urlToken: `token-${Date.now()}`,
        createdBy: BigInt(1) // 暫定的に1を設定
      },
      include: options?.include,
      select: options?.select
    });
    
    return this.serializeBigInt(result);
  }
  
  // updateもオーバーライド
  async update(
    id: number,
    data: UpdatePartnerInput,
    companyId: number | string,
    options?: any
  ): Promise<any> {
    const model = (this.prisma as any)[this.modelName];
    
    // company-1のような形式から数値部分を抽出してBigIntに変換
    const numericId = typeof companyId === 'string' && companyId.includes('-') 
      ? companyId.split('-').pop() 
      : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    
    return model.updateMany({
      where: { 
        id: BigInt(id), 
        sesCompanyId: companyIdBigInt 
      },
      data
    });
  }
  
  // deleteもオーバーライド
  async delete(id: number, companyId: number | string): Promise<boolean> {
    const model = (this.prisma as any)[this.modelName];
    
    // company-1のような形式から数値部分を抽出してBigIntに変換
    const numericId = typeof companyId === 'string' && companyId.includes('-') 
      ? companyId.split('-').pop() 
      : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    
    const result = await model.deleteMany({
      where: { 
        id: BigInt(id), 
        sesCompanyId: companyIdBigInt 
      }
    });
    
    return result.count > 0;
  }
  
  // countもオーバーライド
  async count(companyId: number | string, filters?: any): Promise<number> {
    const model = (this.prisma as any)[this.modelName];
    
    // company-1のような形式から数値部分を抽出してBigIntに変換
    const numericId = typeof companyId === 'string' && companyId.includes('-') 
      ? companyId.split('-').pop() 
      : companyId;
    const companyIdBigInt = BigInt(numericId || '0');
    
    const where: any = { sesCompanyId: companyIdBigInt };
    
    // フィルター条件の追加
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          where[key] = value;
        }
      });
    }
    
    return model.count({ where });
  }
  
  async findActive(companyId: number): Promise<Partner[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM business_partners
      WHERE ses_company_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `, companyId);
  }
  
  async findExpiring(companyId: number, days: number = 30): Promise<Partner[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM business_partners
      WHERE ses_company_id = $1 
      AND is_active = true
      ORDER BY created_at DESC
    `, companyId);
  }
}
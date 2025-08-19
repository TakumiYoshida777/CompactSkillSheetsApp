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
  
  async findActive(companyId: number): Promise<Partner[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM business_partners
      WHERE company_id = $1 AND contract_status = 'active'
      ORDER BY name ASC
    `, companyId);
  }
  
  async findExpiring(companyId: number, days: number = 30): Promise<Partner[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM business_partners
      WHERE company_id = $1 
      AND contract_end_date <= $2
      AND contract_status = 'active'
      ORDER BY contract_end_date ASC
    `, companyId, futureDate);
  }
}
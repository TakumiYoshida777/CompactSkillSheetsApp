import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface Approach {
  id: number;
  companyId: number;
  targetType: string;
  targetId?: number;
  targetName?: string;
  engineerIds: any;
  templateId?: number;
  subject: string;
  body: string;
  status: string;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  errorMessage?: string;
  metadata: any;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApproachInput {
  targetType: string;
  targetId?: number;
  targetName?: string;
  engineerIds?: number[];
  templateId?: number;
  subject: string;
  body: string;
  status?: string;
  createdBy?: number;
}

export interface UpdateApproachInput extends Partial<CreateApproachInput> {
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  errorMessage?: string;
}

export class ApproachRepository extends BaseRepository<Approach, CreateApproachInput, UpdateApproachInput> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'approach');
  }
  
  async findByTargetType(companyId: number, targetType: string): Promise<Approach[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM approaches
      WHERE company_id = $1 AND target_type = $2
      ORDER BY created_at DESC
    `, companyId, targetType);
  }
  
  async updateTracking(approachId: number, field: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      UPDATE approaches
      SET ${field} = NOW(), updated_at = NOW()
      WHERE id = $1
    `, approachId);
  }

  async findByStatus(companyId: number, status: string): Promise<Approach[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM approaches
      WHERE company_id = $1 AND status = $2
      ORDER BY created_at DESC
    `, companyId, status);
  }
}
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface EmailTemplate {
  id: number;
  companyId: number;
  name: string;
  category?: string;
  subject: string;
  body: string;
  variables: any;
  isActive: boolean;
  useCount: number;
  lastUsedAt?: Date;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmailTemplateInput {
  name: string;
  category?: string;
  subject: string;
  body: string;
  variables?: any;
  isActive?: boolean;
  createdBy?: number;
}

export interface UpdateEmailTemplateInput extends Partial<CreateEmailTemplateInput> {
  useCount?: number;
  lastUsedAt?: Date;
}

export class EmailTemplateRepository extends BaseRepository<EmailTemplate, CreateEmailTemplateInput, UpdateEmailTemplateInput> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'emailTemplate');
  }
  
  async findByCategory(companyId: number, category: string): Promise<EmailTemplate[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM email_templates
      WHERE company_id = $1 AND category = $2 AND is_active = true
      ORDER BY name ASC
    `, companyId, category);
  }

  async findActive(companyId: number): Promise<EmailTemplate[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM email_templates
      WHERE company_id = $1 AND is_active = true
      ORDER BY use_count DESC, name ASC
    `, companyId);
  }

  async incrementUseCount(id: number): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      UPDATE email_templates
      SET use_count = use_count + 1, last_used_at = NOW()
      WHERE id = $1
    `, id);
  }
}
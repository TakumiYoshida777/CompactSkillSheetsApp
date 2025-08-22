import { PrismaClient } from '@prisma/client';

export interface PartnerPermission {
  id: number;
  partnerId: number;
  canViewEngineers: boolean;
  canSendOffers: boolean;
  maxViewableEngineers: number;
  visibleEngineerIds: any;
  ngEngineerIds: any;
  autoPublishWaiting: boolean;
  customPermissions: any;
  createdAt: Date;
  updatedAt: Date;
}

export class PartnerPermissionRepository {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async findByPartnerId(partnerId: number): Promise<PartnerPermission | null> {
    const result = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM partner_permissions
      WHERE partner_id = $1
      LIMIT 1
    `, partnerId);
    
    return (result as PartnerPermission[])[0] || null;
  }
  
  async create(data: any): Promise<PartnerPermission> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    
    const query = `
      INSERT INTO partner_permissions (${keys.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.prisma.$queryRawUnsafe(query, ...values);
    return (result as PartnerPermission[])[0];
  }
  
  async update(partnerId: number, data: any): Promise<PartnerPermission> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE partner_permissions
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE partner_id = $${keys.length + 1}
      RETURNING *
    `;
    
    const result = await this.prisma.$queryRawUnsafe(query, ...values, partnerId);
    return (result as PartnerPermission[])[0];
  }
}
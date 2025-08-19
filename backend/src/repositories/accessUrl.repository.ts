import { PrismaClient } from '@prisma/client';

export interface AccessUrl {
  id: number;
  partnerId: number;
  token: string;
  expiresAt: Date;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  createdBy?: number;
  createdAt: Date;
}

export class AccessUrlRepository {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async findByPartnerId(partnerId: number): Promise<AccessUrl[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM partner_access_urls
      WHERE partner_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `, partnerId);
  }
  
  async findByToken(token: string): Promise<AccessUrl | null> {
    const result = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM partner_access_urls
      WHERE token = $1 AND is_active = true
      LIMIT 1
    `, token);
    
    return (result as AccessUrl[])[0] || null;
  }
  
  async create(data: any): Promise<AccessUrl> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    
    const query = `
      INSERT INTO partner_access_urls (${keys.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.prisma.$queryRawUnsafe(query, ...values);
    return (result as AccessUrl[])[0];
  }
  
  async incrementUsage(token: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      UPDATE partner_access_urls
      SET used_count = used_count + 1
      WHERE token = $1
    `, token);
  }
  
  async deactivate(id: number): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      UPDATE partner_access_urls
      SET is_active = false
      WHERE id = $1
    `, id);
  }
  
  async delete(id: number, partnerId: number): Promise<boolean> {
    const result = await this.prisma.$executeRawUnsafe(`
      DELETE FROM partner_access_urls
      WHERE id = $1 AND partner_id = $2
    `, id, partnerId);
    
    return result > 0;
  }
}
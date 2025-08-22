import { PrismaClient } from '@prisma/client';

export interface PartnerUser {
  id: number;
  partnerId: number;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PartnerUserRepository {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async findByPartnerId(partnerId: number): Promise<PartnerUser[]> {
    return this.prisma.$queryRawUnsafe(`
      SELECT id, partner_id, name, email, role, is_active, last_login_at, created_at, updated_at
      FROM partner_users
      WHERE partner_id = $1
      ORDER BY created_at DESC
    `, partnerId);
  }
  
  async findById(id: number, partnerId: number): Promise<PartnerUser | null> {
    const result = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM partner_users
      WHERE id = $1 AND partner_id = $2
      LIMIT 1
    `, id, partnerId);
    
    return (result as PartnerUser[])[0] || null;
  }
  
  async findByEmail(email: string): Promise<PartnerUser | null> {
    const result = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM partner_users
      WHERE email = $1
      LIMIT 1
    `, email);
    
    return (result as PartnerUser[])[0] || null;
  }
  
  async create(data: any): Promise<PartnerUser> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    
    const query = `
      INSERT INTO partner_users (${keys.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, partner_id, name, email, role, is_active, last_login_at, created_at, updated_at
    `;
    
    const result = await this.prisma.$queryRawUnsafe(query, ...values);
    return (result as PartnerUser[])[0];
  }
  
  async update(id: number, data: any, partnerId: number): Promise<PartnerUser> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE partner_users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${keys.length + 1} AND partner_id = $${keys.length + 2}
      RETURNING id, partner_id, name, email, role, is_active, last_login_at, created_at, updated_at
    `;
    
    const result = await this.prisma.$queryRawUnsafe(query, ...values, id, partnerId);
    return (result as PartnerUser[])[0];
  }
  
  async delete(id: number, partnerId: number): Promise<boolean> {
    const result = await this.prisma.$executeRawUnsafe(`
      DELETE FROM partner_users
      WHERE id = $1 AND partner_id = $2
    `, id, partnerId);
    
    return result > 0;
  }
  
  async updateLastLogin(id: number): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      UPDATE partner_users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, id);
  }
}
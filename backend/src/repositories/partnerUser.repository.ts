import { PrismaClient } from '@prisma/client';

export interface PartnerUser {
  id: number;
  businessPartnerId: number;
  name: string;
  email: string;
  passwordHash: string;
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
      SELECT id, "businessPartnerId", name, email, "passwordHash", "isActive", "lastLoginAt", "createdAt", "updatedAt"
      FROM client_users
      WHERE "businessPartnerId" = $1
      ORDER BY "createdAt" DESC
    `, partnerId);
  }
  
  async findById(id: number, partnerId: number): Promise<PartnerUser | null> {
    const result = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM client_users
      WHERE id = $1 AND "businessPartnerId" = $2
      LIMIT 1
    `, id, partnerId);
    
    return (result as PartnerUser[])[0] || null;
  }
  
  async findByEmail(email: string): Promise<PartnerUser | null> {
    const result = await this.prisma.$queryRawUnsafe(`
      SELECT * FROM client_users
      WHERE email = $1
      LIMIT 1
    `, email);
    
    return (result as PartnerUser[])[0] || null;
  }
  
  async create(data: any): Promise<PartnerUser> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    const columns = keys.map(key => `"${key}"`).join(', ');
    
    const query = `
      INSERT INTO client_users (${columns})
      VALUES (${placeholders.join(', ')})
      RETURNING id, "businessPartnerId", name, email, "isActive", "lastLoginAt", "createdAt", "updatedAt"
    `;
    
    const result = await this.prisma.$queryRawUnsafe(query, ...values);
    return (result as PartnerUser[])[0];
  }
  
  async update(id: number, data: any, partnerId: number): Promise<PartnerUser> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `"${key}" = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE client_users
      SET ${setClause}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${keys.length + 1} AND "businessPartnerId" = $${keys.length + 2}
      RETURNING id, "businessPartnerId", name, email, "isActive", "lastLoginAt", "createdAt", "updatedAt"
    `;
    
    const result = await this.prisma.$queryRawUnsafe(query, ...values, id, partnerId);
    return (result as PartnerUser[])[0];
  }
  
  async delete(id: number, partnerId: number): Promise<boolean> {
    const result = await this.prisma.$executeRawUnsafe(`
      DELETE FROM client_users
      WHERE id = $1 AND "businessPartnerId" = $2
    `, id, partnerId);
    
    return result > 0;
  }
  
  async updateLastLogin(id: number): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      UPDATE client_users
      SET "lastLoginAt" = CURRENT_TIMESTAMP
      WHERE id = $1
    `, id);
  }
}
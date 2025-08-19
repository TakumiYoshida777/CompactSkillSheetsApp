import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProjectRepository {
  async findAllWithFilters(companyId: number, pagination: any, filters: any) {
    // 企業のエンジニアを取得
    const engineers = await prisma.engineer.findMany({
      where: { companyId: BigInt(companyId) },
      select: { id: true }
    });
    
    const engineerIds = engineers.map(e => e.id);
    
    const where: any = {
      engineerProjects: {
        some: {
          engineerId: { in: engineerIds }
        }
      }
    };
    
    // フィルタ条件の追加
    if (filters?.status) {
      where.projectScale = filters.status;
    }
    
    if (filters?.dateFrom) {
      where.startDate = { gte: new Date(filters.dateFrom) };
    }
    
    if (filters?.dateTo) {
      where.endDate = { lte: new Date(filters.dateTo) };
    }
    
    return prisma.project.findMany({
      where,
      skip: pagination?.offset,
      take: pagination?.limit,
      include: {
        engineerProjects: {
          include: {
            engineer: true
          }
        }
      }
    });
  }
  
  async countWithFilters(companyId: number, filters: any) {
    const engineers = await prisma.engineer.findMany({
      where: { companyId: BigInt(companyId) },
      select: { id: true }
    });
    
    const engineerIds = engineers.map(e => e.id);
    
    const where: any = {
      engineerProjects: {
        some: {
          engineerId: { in: engineerIds }
        }
      }
    };
    
    if (filters?.status) {
      where.projectScale = filters.status;
    }
    
    return prisma.project.count({ where });
  }
  
  async findById(id: number, companyId: number) {
    const engineers = await prisma.engineer.findMany({
      where: { companyId: BigInt(companyId) },
      select: { id: true }
    });
    
    const engineerIds = engineers.map(e => e.id);
    
    return prisma.project.findFirst({
      where: {
        id: BigInt(id),
        engineerProjects: {
          some: {
            engineerId: { in: engineerIds }
          }
        }
      },
      include: {
        engineerProjects: {
          include: {
            engineer: true
          }
        }
      }
    });
  }
  
  async create(data: any, companyId: number) {
    return prisma.project.create({
      data,
      include: {
        engineerProjects: true
      }
    });
  }
  
  async update(id: number, data: any) {
    return prisma.project.update({
      where: { id: BigInt(id) },
      data,
      include: {
        engineerProjects: true
      }
    });
  }
  
  async delete(id: number) {
    return prisma.project.delete({
      where: { id: BigInt(id) }
    });
  }
}
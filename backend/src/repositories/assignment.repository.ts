import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AssignmentRepository {
  async findByProjectId(projectId: number) {
    return prisma.engineerProject.findMany({
      where: { projectId: BigInt(projectId) },
      include: {
        engineer: true
      },
      orderBy: { startDate: 'asc' }
    });
  }
  
  async findByEngineerId(engineerId: number) {
    return prisma.engineerProject.findMany({
      where: { engineerId: BigInt(engineerId) },
      include: {
        project: true
      },
      orderBy: { startDate: 'desc' }
    });
  }
  
  async findByProjectAndEngineer(projectId: number, engineerId: number) {
    return prisma.engineerProject.findFirst({
      where: {
        projectId: BigInt(projectId),
        engineerId: BigInt(engineerId)
      }
    });
  }
  
  async findById(id: number) {
    return prisma.engineerProject.findUnique({
      where: { id: BigInt(id) }
    });
  }
  
  async create(data: any) {
    return prisma.engineerProject.create({
      data: {
        projectId: BigInt(data.projectId),
        engineerId: BigInt(data.engineerId),
        role: data.role,
        responsibilities: data.responsibilities,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent ?? true
      },
      include: {
        engineer: true,
        project: true
      }
    });
  }
  
  async update(id: number, data: any) {
    return prisma.engineerProject.update({
      where: { id: BigInt(id) },
      data
    });
  }
  
  async delete(id: number) {
    await prisma.engineerProject.delete({
      where: { id: BigInt(id) }
    });
    return true;
  }
  
  async deleteByProjectId(projectId: number) {
    const result = await prisma.engineerProject.deleteMany({
      where: { projectId: BigInt(projectId) }
    });
    return result.count;
  }
  
  async findActiveByEngineerId(engineerId: number, date: string) {
    const targetDate = new Date(date);
    return prisma.engineerProject.findMany({
      where: {
        engineerId: BigInt(engineerId),
        startDate: { lte: targetDate },
        OR: [
          { endDate: null },
          { endDate: { gte: targetDate } }
        ]
      }
    });
  }
  
  async findByDateRange(startDate: string, endDate: string) {
    return prisma.engineerProject.findMany({
      where: {
        startDate: { lte: new Date(endDate) },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date(startDate) } }
        ]
      },
      orderBy: { startDate: 'asc' }
    });
  }
}
import { PrismaClient, Project, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class ProjectRepository extends BaseRepository<
  Project,
  Prisma.ProjectCreateInput,
  Prisma.ProjectUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'project');
  }

  /**
   * 企業に関連するプロジェクトを取得
   * 注: Projectテーブルにcompanyカラムがないため、
   * EngineerProjectを経由して取得する必要がある
   */
  async findByCompany(
    companyId: number,
    options?: any
  ): Promise<{ data: Project[]; total: number }> {
    // 企業のエンジニアIDを取得
    const engineers = await this.prisma.engineer.findMany({
      where: { companyId: BigInt(companyId) },
      select: { id: true }
    });
    
    const engineerIds = engineers.map(e => e.id);
    
    // エンジニアが参加しているプロジェクトを取得
    const where = {
      engineerProjects: {
        some: {
          engineerId: { in: engineerIds }
        }
      }
    };
    
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: options?.pagination?.offset,
        take: options?.pagination?.limit,
        orderBy: options?.sort 
          ? { [options.sort.field]: options.sort.order }
          : { createdAt: 'desc' },
        include: {
          engineerProjects: {
            include: {
              engineer: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      this.prisma.project.count({ where })
    ]);
    
    return { data, total };
  }

  /**
   * プロジェクトを作成し、エンジニアをアサイン
   */
  async createWithEngineers(
    projectData: Prisma.ProjectCreateInput,
    engineerIds: bigint[]
  ): Promise<Project> {
    return await this.prisma.$transaction(async (tx) => {
      // プロジェクトを作成
      const project = await tx.project.create({
        data: projectData
      });
      
      // エンジニアをアサイン
      if (engineerIds.length > 0) {
        await tx.engineerProject.createMany({
          data: engineerIds.map(engineerId => ({
            projectId: project.id,
            engineerId,
            startDate: projectData.startDate,
            isCurrent: true
          }))
        });
      }
      
      return project;
    });
  }

  /**
   * 進行中のプロジェクトを取得
   */
  async findActiveProjects(companyId: number): Promise<Project[]> {
    const engineers = await this.prisma.engineer.findMany({
      where: { companyId: BigInt(companyId) },
      select: { id: true }
    });
    
    const engineerIds = engineers.map(e => e.id);
    
    return this.prisma.project.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ],
        engineerProjects: {
          some: {
            engineerId: { in: engineerIds },
            isCurrent: true
          }
        }
      },
      include: {
        engineerProjects: {
          where: {
            engineerId: { in: engineerIds }
          },
          include: {
            engineer: true
          }
        }
      }
    });
  }
}
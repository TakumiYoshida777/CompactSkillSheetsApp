import { PrismaClient } from '@prisma/client';
import { ProjectRepository } from '../repositories/projectRepository';
import { NotFoundError, ValidationError } from '../middleware/error.middleware';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.projectRepository = new ProjectRepository(prisma);
  }

  /**
   * プロジェクト一覧を取得
   */
  async getProjects(companyId: number, options?: any) {
    return await this.projectRepository.findByCompany(companyId, options);
  }

  /**
   * プロジェクト詳細を取得
   */
  async getProjectById(projectId: number, companyId: number) {
    // 企業のエンジニアがプロジェクトに参加しているか確認
    const project = await this.prisma.project.findFirst({
      where: {
        id: BigInt(projectId),
        engineerProjects: {
          some: {
            engineer: {
              companyId: BigInt(companyId)
            }
          }
        }
      },
      include: {
        engineerProjects: {
          include: {
            engineer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                currentStatus: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundError('プロジェクト');
    }

    return project;
  }

  /**
   * プロジェクトを作成
   */
  async createProject(companyId: number, data: any) {
    // バリデーション
    if (!data.name) {
      throw new ValidationError('プロジェクト名は必須です');
    }
    if (!data.startDate) {
      throw new ValidationError('開始日は必須です');
    }

    // エンジニアIDの検証（指定された場合）
    const engineerIds = data.engineerIds || [];
    if (engineerIds.length > 0) {
      const engineers = await this.prisma.engineer.findMany({
        where: {
          id: { in: engineerIds.map((id: number) => BigInt(id)) },
          companyId: BigInt(companyId)
        }
      });

      if (engineers.length !== engineerIds.length) {
        throw new ValidationError('指定されたエンジニアが見つかりません');
      }
    }

    // プロジェクトデータの準備
    const projectData = {
      name: data.name,
      clientCompany: data.clientCompany,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
      projectScale: data.projectScale,
      industry: data.industry,
      businessType: data.businessType,
      developmentMethodology: data.developmentMethodology,
      teamSize: data.teamSize,
      description: data.description
    };

    return await this.projectRepository.createWithEngineers(
      projectData,
      engineerIds.map((id: number) => BigInt(id))
    );
  }

  /**
   * プロジェクトを更新
   */
  async updateProject(projectId: number, companyId: number, data: any) {
    // プロジェクトの存在確認と権限チェック
    await this.getProjectById(projectId, companyId);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.clientCompany !== undefined) updateData.clientCompany = data.clientCompany;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.plannedEndDate !== undefined) updateData.plannedEndDate = data.plannedEndDate ? new Date(data.plannedEndDate) : null;
    if (data.projectScale !== undefined) updateData.projectScale = data.projectScale;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.businessType !== undefined) updateData.businessType = data.businessType;
    if (data.developmentMethodology !== undefined) updateData.developmentMethodology = data.developmentMethodology;
    if (data.teamSize !== undefined) updateData.teamSize = data.teamSize;
    if (data.description !== undefined) updateData.description = data.description;

    return await this.prisma.project.update({
      where: { id: BigInt(projectId) },
      data: updateData,
      include: {
        engineerProjects: {
          include: {
            engineer: true
          }
        }
      }
    });
  }

  /**
   * プロジェクトにエンジニアをアサイン
   */
  async assignEngineer(projectId: number, companyId: number, data: any) {
    // プロジェクトの存在確認
    await this.getProjectById(projectId, companyId);

    // エンジニアの存在確認
    const engineer = await this.prisma.engineer.findFirst({
      where: {
        id: BigInt(data.engineerId),
        companyId: BigInt(companyId)
      }
    });

    if (!engineer) {
      throw new NotFoundError('エンジニア');
    }

    // 既にアサインされているか確認
    const existing = await this.prisma.engineerProject.findFirst({
      where: {
        projectId: BigInt(projectId),
        engineerId: BigInt(data.engineerId)
      }
    });

    if (existing) {
      throw new ValidationError('エンジニアは既にプロジェクトにアサインされています');
    }

    return await this.prisma.engineerProject.create({
      data: {
        projectId: BigInt(projectId),
        engineerId: BigInt(data.engineerId),
        role: data.role,
        responsibilities: data.responsibilities,
        startDate: new Date(data.startDate || Date.now()),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isCurrent: data.isCurrent !== false
      },
      include: {
        engineer: true,
        project: true
      }
    });
  }

  /**
   * エンジニアのアサインを解除
   */
  async unassignEngineer(projectId: number, engineerId: number, companyId: number) {
    // プロジェクトの存在確認
    await this.getProjectById(projectId, companyId);

    const assignment = await this.prisma.engineerProject.findFirst({
      where: {
        projectId: BigInt(projectId),
        engineerId: BigInt(engineerId)
      }
    });

    if (!assignment) {
      throw new NotFoundError('アサインメント');
    }

    await this.prisma.engineerProject.delete({
      where: { id: assignment.id }
    });

    return { success: true };
  }

  /**
   * 進行中のプロジェクトを取得
   */
  async getActiveProjects(companyId: number) {
    return await this.projectRepository.findActiveProjects(companyId);
  }

  /**
   * プロジェクト統計を取得
   */
  async getProjectStats(companyId: number) {
    const engineers = await this.prisma.engineer.findMany({
      where: { companyId: BigInt(companyId) },
      select: { id: true }
    });
    
    const engineerIds = engineers.map(e => e.id);

    const [total, active, completed] = await Promise.all([
      this.prisma.project.count({
        where: {
          engineerProjects: {
            some: { engineerId: { in: engineerIds } }
          }
        }
      }),
      this.prisma.project.count({
        where: {
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ],
          engineerProjects: {
            some: { engineerId: { in: engineerIds } }
          }
        }
      }),
      this.prisma.project.count({
        where: {
          endDate: { lt: new Date() },
          engineerProjects: {
            some: { engineerId: { in: engineerIds } }
          }
        }
      })
    ]);

    return {
      total,
      active,
      completed,
      activeRate: total > 0 ? (active / total * 100).toFixed(1) : 0
    };
  }
}
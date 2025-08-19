import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/error.handler';
import logger from '../config/logger';

interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

interface ProjectFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface SearchCriteria {
  query?: string;
  status?: string;
  clientName?: string;
}

export class ProjectService {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async findAll(companyId: number, pagination: PaginationOptions, filters: ProjectFilters) {
    try {
      // 企業のエンジニアを取得
      const engineers = await this.prisma.engineer.findMany({
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
      
      return await this.prisma.project.findMany({
        where,
        skip: pagination?.offset,
        take: pagination?.limit,
        include: {
          engineerProjects: {
            include: {
              engineer: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('プロジェクト一覧取得エラー:', error);
      throw new AppError('プロジェクト一覧の取得に失敗しました', 500);
    }
  }
  
  async count(companyId: number, filters: any) {
    try {
      const engineers = await this.prisma.engineer.findMany({
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
      
      return await this.prisma.project.count({ where });
    } catch (error) {
      logger.error('プロジェクト数取得エラー:', error);
      throw new AppError('プロジェクト数の取得に失敗しました', 500);
    }
  }
  
  async findById(id: number, companyId: number) {
    try {
      const engineers = await this.prisma.engineer.findMany({
        where: { companyId: BigInt(companyId) },
        select: { id: true }
      });
      
      const engineerIds = engineers.map(e => e.id);
      
      const project = await this.prisma.project.findFirst({
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
      
      return project;
    } catch (error) {
      logger.error('プロジェクト詳細取得エラー:', error);
      throw new AppError('プロジェクト情報の取得に失敗しました', 500);
    }
  }
  
  async create(data: any, companyId: number) {
    try {
      // プロジェクト作成
      const project = await this.prisma.project.create({
        data: {
          projectName: data.name,
          clientCompanyName: data.clientCompany,
          projectScale: data.projectScale || 'SMALL',
          businessType: data.businessType,
          systemType: data.systemType,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          contractAmount: data.contractAmount ? BigInt(data.contractAmount) : undefined,
          salesAmount: data.salesAmount ? BigInt(data.salesAmount) : undefined,
          costAmount: data.costAmount ? BigInt(data.costAmount) : undefined,
          profitAmount: data.profitAmount ? BigInt(data.profitAmount) : undefined,
          profitRate: data.profitRate,
          isActive: true
        },
        include: {
          engineerProjects: true
        }
      });
      
      return project;
    } catch (error) {
      logger.error('プロジェクト作成エラー:', error);
      throw new AppError('プロジェクトの作成に失敗しました', 500);
    }
  }
  
  async update(id: number, data: any, companyId: number) {
    try {
      // まずプロジェクトが企業に関連しているか確認
      const existing = await this.findById(id, companyId);
      if (!existing) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      const updateData: Prisma.ProjectUpdateInput = {};
      
      if (data.name !== undefined) updateData.projectName = data.name;
      if (data.clientCompany !== undefined) updateData.clientCompanyName = data.clientCompany;
      if (data.projectScale !== undefined) updateData.projectScale = data.projectScale;
      if (data.businessType !== undefined) updateData.businessType = data.businessType;
      if (data.systemType !== undefined) updateData.systemType = data.systemType;
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
      if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
      if (data.contractAmount !== undefined) updateData.contractAmount = BigInt(data.contractAmount);
      if (data.salesAmount !== undefined) updateData.salesAmount = BigInt(data.salesAmount);
      if (data.costAmount !== undefined) updateData.costAmount = BigInt(data.costAmount);
      if (data.profitAmount !== undefined) updateData.profitAmount = BigInt(data.profitAmount);
      if (data.profitRate !== undefined) updateData.profitRate = data.profitRate;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      
      return await this.prisma.project.update({
        where: { id: BigInt(id) },
        data: updateData,
        include: {
          engineerProjects: true
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('プロジェクト更新エラー:', error);
      throw new AppError('プロジェクトの更新に失敗しました', 500);
    }
  }
  
  async delete(id: number, companyId: number) {
    try {
      // まずプロジェクトが企業に関連しているか確認
      const existing = await this.findById(id, companyId);
      if (!existing) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      await this.prisma.$transaction(async (prisma) => {
        // アサインメント削除
        await prisma.engineerProject.deleteMany({
          where: { projectId: BigInt(id) }
        });
        
        // プロジェクト削除
        await prisma.project.delete({
          where: { id: BigInt(id) }
        });
      });
      
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('プロジェクト削除エラー:', error);
      throw new AppError('プロジェクトの削除に失敗しました', 500);
    }
  }
  
  async updateStatus(id: number, status: string, companyId: number) {
    const validStatuses = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'];
    const statusUpper = status.toUpperCase();
    if (!validStatuses.includes(statusUpper)) {
      throw new AppError('無効なステータスです', 400);
    }
    
    try {
      // まずプロジェクトが企業に関連しているか確認
      const existing = await this.findById(id, companyId);
      if (!existing) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      const project = await this.prisma.$transaction(async (prisma) => {
        const updated = await prisma.project.update({
          where: { id: BigInt(id) },
          data: { 
            projectScale: statusUpper as any
          },
          include: {
            engineerProjects: true
          }
        });
        
        // プロジェクトが終了の場合、エンジニアを待機状態に
        if (status === 'completed' || !existing.isActive) {
          const assignments = await prisma.engineerProject.findMany({
            where: { projectId: BigInt(id) }
          });
          
          for (const assignment of assignments) {
            await prisma.engineer.update({
              where: { id: assignment.engineerId },
              data: { currentStatus: 'WAITING' }
            });
          }
        }
        
        return updated;
      });
      
      return project;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('プロジェクトステータス更新エラー:', error);
      throw new AppError('ステータスの更新に失敗しました', 500);
    }
  }
  
  async getAssignments(projectId: number, companyId: number) {
    try {
      // プロジェクト存在確認
      const project = await this.findById(projectId, companyId);
      if (!project) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      const assignments = await this.prisma.engineerProject.findMany({
        where: { projectId: BigInt(projectId) },
        include: {
          engineer: true
        },
        orderBy: { startDate: 'desc' }
      });
      
      return assignments;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('アサインメント取得エラー:', error);
      throw new AppError('アサインメントの取得に失敗しました', 500);
    }
  }
  
  async createAssignment(projectId: number, data: any, companyId: number) {
    try {
      const assignment = await this.prisma.$transaction(async (prisma) => {
        // プロジェクト存在確認
        const project = await this.findById(projectId, companyId);
        if (!project) {
          throw new AppError('プロジェクトが見つかりません', 404);
        }
        
        // エンジニア存在確認
        const engineer = await prisma.engineer.findFirst({
          where: {
            id: BigInt(data.engineerId),
            companyId: BigInt(companyId)
          }
        });
        if (!engineer) {
          throw new AppError('エンジニアが見つかりません', 404);
        }
        
        // 重複チェック
        const existing = await prisma.engineerProject.findFirst({
          where: {
            projectId: BigInt(projectId),
            engineerId: BigInt(data.engineerId)
          }
        });
        if (existing) {
          throw new AppError('既にアサイン済みです', 400);
        }
        
        // アサイン作成
        const newAssignment = await prisma.engineerProject.create({
          data: {
            projectId: BigInt(projectId),
            engineerId: BigInt(data.engineerId),
            role: data.role,
            responsibilities: data.responsibilities,
            startDate: data.startDate ? new Date(data.startDate) : new Date(),
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            isCurrent: data.isCurrent !== undefined ? data.isCurrent : true
          },
          include: {
            engineer: true,
            project: true
          }
        });
        
        // エンジニアステータス更新
        await prisma.engineer.update({
          where: { id: BigInt(data.engineerId) },
          data: { currentStatus: 'ASSIGNED' }
        });
        
        return newAssignment;
      });
      
      return assignment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('アサインメント作成エラー:', error);
      throw new AppError('アサインメントの作成に失敗しました', 500);
    }
  }
  
  async updateAssignment(projectId: number, assignmentId: number, data: any, companyId: number) {
    try {
      // プロジェクト存在確認
      const project = await this.findById(projectId, companyId);
      if (!project) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      const updateData: any = {};
      if (data.role !== undefined) updateData.role = data.role;
      if (data.responsibilities !== undefined) updateData.responsibilities = data.responsibilities;
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
      if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
      if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent;
      
      return await this.prisma.engineerProject.update({
        where: { id: BigInt(assignmentId) },
        data: updateData
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('アサインメント更新エラー:', error);
      throw new AppError('アサインメントの更新に失敗しました', 500);
    }
  }
  
  async deleteAssignment(projectId: number, assignmentId: number, companyId: number) {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // プロジェクト存在確認
        const project = await this.findById(projectId, companyId);
        if (!project) {
          throw new AppError('プロジェクトが見つかりません', 404);
        }
        
        // アサインメント取得
        const assignment = await prisma.engineerProject.findUnique({
          where: { id: BigInt(assignmentId) }
        });
        if (!assignment) {
          throw new AppError('アサインメントが見つかりません', 404);
        }
        
        // アサインメント削除
        await prisma.engineerProject.delete({
          where: { id: BigInt(assignmentId) }
        });
        
        // エンジニアステータスを待機に戻す
        await prisma.engineer.update({
          where: { id: assignment.engineerId },
          data: { currentStatus: 'WAITING' }
        });
        
        return true;
      });
      
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('アサインメント削除エラー:', error);
      throw new AppError('アサインメントの削除に失敗しました', 500);
    }
  }
  
  async getCompanyTimeline(companyId: number, startDate: string, endDate: string) {
    try {
      // 企業のエンジニアを取得
      const engineers = await this.prisma.engineer.findMany({
        where: { companyId: BigInt(companyId) },
        select: { id: true }
      });
      
      const engineerIds = engineers.map(e => e.id);
      
      const projects = await this.prisma.project.findMany({
        where: {
          engineerProjects: {
            some: {
              engineerId: { in: engineerIds }
            }
          },
          startDate: { lte: new Date(endDate) },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date(startDate) } }
          ]
        },
        include: {
          engineerProjects: {
            include: {
              engineer: true
            }
          }
        },
        orderBy: { startDate: 'asc' }
      });
      
      const timeline = projects.map(project => ({
        project,
        assignments: project.engineerProjects
      }));
      
      return timeline;
    } catch (error) {
      logger.error('タイムライン取得エラー:', error);
      throw new AppError('タイムラインの取得に失敗しました', 500);
    }
  }
  
  async getProjectTimeline(projectId: number, companyId: number) {
    try {
      const project = await this.findById(projectId, companyId);
      if (!project) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      const timeline = {
        project,
        assignments: project.engineerProjects
      };
      
      return timeline;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('プロジェクトタイムライン取得エラー:', error);
      throw new AppError('プロジェクトタイムラインの取得に失敗しました', 500);
    }
  }
  
  async calculateUtilization(companyId: number) {
    try {
      const [totalEngineers, assignedEngineers, waitingEngineers, upcomingEngineers] = await Promise.all([
        this.prisma.engineer.count({
          where: { companyId: BigInt(companyId) }
        }),
        this.prisma.engineer.count({
          where: { 
            companyId: BigInt(companyId),
            currentStatus: 'ASSIGNED'
          }
        }),
        this.prisma.engineer.count({
          where: { 
            companyId: BigInt(companyId),
            currentStatus: 'WAITING'
          }
        }),
        this.prisma.engineer.count({
          where: { 
            companyId: BigInt(companyId),
            currentStatus: 'UPCOMING'
          }
        })
      ]);
      
      return {
        total: totalEngineers,
        assigned: assignedEngineers,
        waiting: waitingEngineers,
        upcoming: upcomingEngineers,
        utilizationRate: totalEngineers > 0 
          ? Math.round((assignedEngineers / totalEngineers) * 100)
          : 0,
        availabilityRate: totalEngineers > 0
          ? Math.round((waitingEngineers / totalEngineers) * 100)
          : 0
      };
    } catch (error) {
      logger.error('稼働率計算エラー:', error);
      throw new AppError('稼働率の計算に失敗しました', 500);
    }
  }
  
  async getCalendarData(companyId: number, year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // 企業のエンジニアを取得
      const engineers = await this.prisma.engineer.findMany({
        where: { companyId: BigInt(companyId) },
        select: { id: true }
      });
      
      const engineerIds = engineers.map(e => e.id);
      
      const projects = await this.prisma.project.findMany({
        where: {
          engineerProjects: {
            some: {
              engineerId: { in: engineerIds }
            }
          },
          startDate: { lte: endDate },
          OR: [
            { endDate: null },
            { endDate: { gte: startDate } }
          ]
        },
        include: {
          engineerProjects: true
        }
      });
      
      // カレンダー形式にデータを整形
      const calendarData: any = {};
      
      for (const project of projects) {
        const projectStart = new Date(project.startDate);
        const projectEnd = project.endDate ? new Date(project.endDate) : new Date();
        
        for (let d = new Date(projectStart); d <= projectEnd; d.setDate(d.getDate() + 1)) {
          if (d.getFullYear() === year && d.getMonth() === month - 1) {
            const dateKey = d.toISOString().split('T')[0];
            if (!calendarData[dateKey]) {
              calendarData[dateKey] = [];
            }
            calendarData[dateKey].push({
              id: project.id.toString(),
              name: project.projectName,
              scale: project.projectScale,
              clientCompany: project.clientCompanyName,
              isActive: project.isActive
            });
          }
        }
      }
      
      return calendarData;
    } catch (error) {
      logger.error('カレンダーデータ取得エラー:', error);
      throw new AppError('カレンダーデータの取得に失敗しました', 500);
    }
  }
  
  async search(companyId: number, criteria: SearchCriteria, pagination: PaginationOptions) {
    try {
      // 企業のエンジニアを取得
      const engineers = await this.prisma.engineer.findMany({
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
      
      if (criteria.query) {
        where.OR = [
          { projectName: { contains: criteria.query, mode: 'insensitive' } },
          { clientCompanyName: { contains: criteria.query, mode: 'insensitive' } },
          { businessType: { contains: criteria.query, mode: 'insensitive' } },
          { systemType: { contains: criteria.query, mode: 'insensitive' } }
        ];
      }
      
      if (criteria.status) {
        where.projectScale = criteria.status.toUpperCase();
      }
      
      if (criteria.clientName) {
        where.clientCompanyName = { contains: criteria.clientName, mode: 'insensitive' };
      }
      
      const [data, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          skip: pagination.offset,
          take: pagination.limit,
          orderBy: { createdAt: 'desc' },
          include: {
            engineerProjects: {
              include: { engineer: true }
            }
          }
        }),
        this.prisma.project.count({ where })
      ]);
      
      return { data, total };
    } catch (error) {
      logger.error('プロジェクト検索エラー:', error);
      throw new AppError('プロジェクトの検索に失敗しました', 500);
    }
  }
}
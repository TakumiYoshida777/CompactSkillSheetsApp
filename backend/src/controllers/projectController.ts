import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProjectService } from '../services/projectService';
import { ApiResponse } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();
const projectService = new ProjectService(prisma);

export const projectController = {
  /**
   * プロジェクト一覧を取得
   */
  getProjects: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);
    const options = {
      pagination: req.pagination,
      sort: req.sort,
      filters: req.filters
    };

    const result = await projectService.getProjects(companyId, options);
    
    res.json(ApiResponse.paginated(result.data, {
      page: req.pagination!.page,
      limit: req.pagination!.limit,
      total: result.total
    }));
  }),

  /**
   * プロジェクト詳細を取得
   */
  getProjectById: asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);

    const project = await projectService.getProjectById(projectId, companyId);
    
    res.json(ApiResponse.success(project));
  }),

  /**
   * プロジェクトを作成
   */
  createProject: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);
    const project = await projectService.createProject(companyId, req.body);
    
    res.status(201).json(ApiResponse.created(project, 'プロジェクトが正常に作成されました'));
  }),

  /**
   * プロジェクトを更新
   */
  updateProject: asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);

    const project = await projectService.updateProject(projectId, companyId, req.body);
    
    res.json(ApiResponse.updated(project, 'プロジェクトが正常に更新されました'));
  }),

  /**
   * エンジニアをアサイン
   */
  assignEngineer: asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);

    const assignment = await projectService.assignEngineer(projectId, companyId, req.body);
    
    res.status(201).json(ApiResponse.created(assignment, 'エンジニアがプロジェクトにアサインされました'));
  }),

  /**
   * エンジニアのアサインを解除
   */
  unassignEngineer: asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.id);
    const engineerId = parseInt(req.params.engineerId);
    const companyId = parseInt(req.companyId!);

    const result = await projectService.unassignEngineer(projectId, engineerId, companyId);
    
    res.json(ApiResponse.success(result, 'エンジニアのアサインが解除されました'));
  }),

  /**
   * 進行中のプロジェクトを取得
   */
  getActiveProjects: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);

    const projects = await projectService.getActiveProjects(companyId);
    
    res.json(ApiResponse.success(projects));
  }),

  /**
   * プロジェクト統計を取得
   */
  getProjectStats: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);

    const stats = await projectService.getProjectStats(companyId);
    
    res.json(ApiResponse.success(stats));
  })
};
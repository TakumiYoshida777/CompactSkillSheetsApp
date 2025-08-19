import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { ApiResponse } from '../utils/response.util';
import { AppError } from '../utils/error.handler';

export class ProjectController {
  private service: ProjectService;
  
  constructor() {
    this.service = new ProjectService();
  }
  
  // プロジェクト一覧取得
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, dateFrom, dateTo } = req.query;
      const { page = 1, limit = 20, offset = 0 } = req.pagination || {};
      
      const projects = await this.service.findAll(
        req.companyId!,
        { page, limit, offset },
        { 
          status: status as string, 
          dateFrom: dateFrom as string, 
          dateTo: dateTo as string 
        }
      );
      
      const total = await this.service.count(req.companyId!, { status });
      
      res.json(ApiResponse.paginated(projects, {
        page,
        limit,
        total
      }));
    } catch (error) {
      next(error);
    }
  };
  
  // プロジェクト詳細取得
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.service.findById(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!project) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      res.json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  };
  
  // プロジェクト作成
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.service.create(req.body, req.companyId!);
      res.status(201).json(ApiResponse.success(project, 'プロジェクトを作成しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // プロジェクト更新
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.service.update(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      if (!project) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      res.json(ApiResponse.success(project, 'プロジェクトを更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // プロジェクト削除
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await this.service.delete(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!success) {
        throw new AppError('プロジェクトが見つかりません', 404);
      }
      
      res.json(ApiResponse.success(null, 'プロジェクトを削除しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // ステータス更新
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const project = await this.service.updateStatus(
        parseInt(req.params.id),
        status,
        req.companyId!
      );
      
      res.json(ApiResponse.success(project, 'ステータスを更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // アサインメント一覧取得
  getAssignments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignments = await this.service.getAssignments(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(assignments));
    } catch (error) {
      next(error);
    }
  };
  
  // アサインメント作成
  createAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignment = await this.service.createAssignment(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      res.status(201).json(ApiResponse.success(assignment, 'アサインメントを作成しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // アサインメント更新
  updateAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignment = await this.service.updateAssignment(
        parseInt(req.params.id),
        parseInt(req.params.assignmentId),
        req.body,
        req.companyId!
      );
      
      res.json(ApiResponse.success(assignment, 'アサインメントを更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // アサインメント削除
  deleteAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await this.service.deleteAssignment(
        parseInt(req.params.id),
        parseInt(req.params.assignmentId),
        req.companyId!
      );
      
      if (!success) {
        throw new AppError('アサインメントが見つかりません', 404);
      }
      
      res.json(ApiResponse.success(null, 'アサインメントを削除しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // タイムライン取得
  getTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      
      const timeline = await this.service.getCompanyTimeline(
        req.companyId!,
        startDate as string,
        endDate as string
      );
      
      res.json(ApiResponse.success(timeline));
    } catch (error) {
      next(error);
    }
  };
  
  // プロジェクトタイムライン取得
  getProjectTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeline = await this.service.getProjectTimeline(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(timeline));
    } catch (error) {
      next(error);
    }
  };
  
  // 稼働率取得
  getUtilization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const utilization = await this.service.calculateUtilization(req.companyId!);
      
      res.json(ApiResponse.success(utilization));
    } catch (error) {
      next(error);
    }
  };
  
  // カレンダービュー取得
  getCalendarView = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        const now = new Date();
        const calendar = await this.service.getCalendarData(
          req.companyId!,
          now.getFullYear(),
          now.getMonth() + 1
        );
        res.json(ApiResponse.success(calendar));
      } else {
        const calendar = await this.service.getCalendarData(
          req.companyId!,
          parseInt(year as string),
          parseInt(month as string)
        );
        res.json(ApiResponse.success(calendar));
      }
    } catch (error) {
      next(error);
    }
  };
  
  // プロジェクト検索
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, status, clientName } = req.body;
      const { page = 1, limit = 20, offset = 0 } = req.pagination || {};
      
      const results = await this.service.search(
        req.companyId!,
        { query, status, clientName },
        { page, limit, offset }
      );
      
      res.json(ApiResponse.paginated(results.data, {
        page,
        limit,
        total: results.total
      }));
    } catch (error) {
      next(error);
    }
  };
}
import { Request, Response, NextFunction } from 'express';
import { EngineerService } from '../services/engineer.service';
import { ApiResponse } from '../utils/response.util';
import { AppError } from '../utils/error.handler';

export class EngineerController {
  private service: EngineerService;
  
  constructor() {
    this.service = new EngineerService();
  }
  
  // メールアドレス重複チェック
  checkEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        res.status(400).json(ApiResponse.error('INVALID_REQUEST', 'メールアドレスが指定されていません'));
        return;
      }
      
      const exists = await this.service.checkEmailExists(email, req.companyId!);
      
      res.json(ApiResponse.success({
        email,
        available: !exists,
        exists
      }));
    } catch (error) {
      next(error);
    }
  };
  
  // エンジニア一覧取得
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, offset = 0 } = req.pagination || {};
      const filters = req.query;
      
      const engineers = await this.service.findAll(
        req.companyId!,
        { page, limit, offset },
        filters
      );
      
      const total = await this.service.count(req.companyId!, filters);
      
      res.json(ApiResponse.paginated(engineers, {
        page,
        limit,
        total
      }));
    } catch (error) {
      next(error);
    }
  };
  
  // エンジニア詳細取得
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineer = await this.service.findById(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!engineer) {
        throw new AppError('エンジニアが見つかりません', 404);
      }
      
      res.json(ApiResponse.success(engineer));
    } catch (error) {
      next(error);
    }
  };
  
  // エンジニア作成
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineer = await this.service.create(req.body, req.companyId!);
      res.status(201).json(ApiResponse.success(engineer, 'エンジニアを登録しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // エンジニア更新
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineer = await this.service.update(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      if (!engineer) {
        throw new AppError('エンジニアが見つかりません', 404);
      }
      
      res.json(ApiResponse.success(engineer, 'エンジニア情報を更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // エンジニア削除
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await this.service.delete(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!success) {
        throw new AppError('エンジニアが見つかりません', 404);
      }
      
      res.json(ApiResponse.success(null, 'エンジニアを削除しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // ステータス更新
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const engineer = await this.service.updateStatus(
        parseInt(req.params.id),
        status,
        req.companyId!
      );
      
      res.json(ApiResponse.success(engineer, 'ステータスを更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // 稼働可能時期更新
  updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { availableDate } = req.body;
      const engineer = await this.service.updateAvailability(
        parseInt(req.params.id),
        availableDate,
        req.companyId!
      );
      
      res.json(ApiResponse.success(engineer, '稼働可能時期を更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // 公開状態更新
  updatePublicStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isPublic } = req.body;
      const engineer = await this.service.updatePublicStatus(
        parseInt(req.params.id),
        isPublic,
        req.companyId!
      );
      
      res.json(ApiResponse.success(engineer, '公開状態を更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // スキルシート取得
  getSkillSheet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skillSheet = await this.service.getSkillSheet(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(skillSheet));
    } catch (error) {
      next(error);
    }
  };
  
  // スキルシート更新
  updateSkillSheet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skillSheet = await this.service.updateSkillSheet(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      res.json(ApiResponse.success(skillSheet, 'スキルシートを更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // スキルシートエクスポート
  exportSkillSheet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { format = 'pdf' } = req.body;
      const exportData = await this.service.exportSkillSheet(
        parseInt(req.params.id),
        format,
        req.companyId!
      );
      
      res.json(ApiResponse.success(exportData));
    } catch (error) {
      next(error);
    }
  };
  
  // エンジニア検索
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, skills, status, yearsOfExperience } = req.body;
      const { page = 1, limit = 20, offset = 0 } = req.pagination || {};
      
      const results = await this.service.search(
        req.companyId!,
        {
          query,
          skills,
          status,
          yearsOfExperience
        },
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
  
  // 待機中エンジニア取得
  getWaitingEngineers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, offset = 0 } = req.pagination || {};
      const engineers = await this.service.findByStatus(
        req.companyId!,
        'waiting',
        { page, limit, offset }
      );
      
      res.json(ApiResponse.success(engineers));
    } catch (error) {
      next(error);
    }
  };
  
  // 稼働可能エンジニア取得
  getAvailableEngineers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, offset = 0 } = req.pagination || {};
      const engineers = await this.service.getAvailableEngineers(
        req.companyId!,
        { page, limit, offset }
      );
      
      res.json(ApiResponse.success(engineers));
    } catch (error) {
      next(error);
    }
  };
  
  // 一括ステータス更新
  bulkUpdateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { engineerIds, status } = req.body;
      
      const updated = await this.service.bulkUpdateStatus(
        engineerIds,
        status,
        req.companyId!
      );
      
      res.json(ApiResponse.success({
        updated: updated.length,
        engineerIds: updated
      }, '一括でステータスを更新しました'));
    } catch (error) {
      next(error);
    }
  };
  
  // 一括エクスポート
  bulkExport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { engineerIds, format = 'csv' } = req.body;
      
      const exportData = await this.service.bulkExport(
        engineerIds,
        format,
        req.companyId!
      );
      
      res.json(ApiResponse.success(exportData));
    } catch (error) {
      next(error);
    }
  };
}
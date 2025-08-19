import { Request, Response, NextFunction } from 'express';
import { ApproachService } from '../services/approach.service';
import { ApiResponse } from '../utils/response.util';
import logger from '../config/logger';

export class ApproachController {
  private service: ApproachService;
  
  constructor() {
    this.service = new ApproachService();
  }
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, targetType, dateFrom, dateTo } = req.query;
      const { page, limit, offset } = req.pagination!;
      
      const result = await this.service.findAll(
        req.companyId!,
        { page, limit, offset },
        { 
          status: status as string, 
          targetType: targetType as string, 
          dateFrom: dateFrom as string, 
          dateTo: dateTo as string 
        }
      );
      
      res.json(ApiResponse.paginated(result.data, {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }));
    } catch (error) {
      logger.error('アプローチ一覧取得エラー:', error);
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approach = await this.service.findById(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!approach) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'アプローチが見つかりません')
        );
      }
      
      res.json(ApiResponse.success(approach));
    } catch (error) {
      logger.error('アプローチ取得エラー:', error);
      next(error);
    }
  };
  
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approach = await this.service.create(req.body, req.companyId!, req.user?.id);
      res.status(201).json(ApiResponse.success(approach));
    } catch (error) {
      logger.error('アプローチ作成エラー:', error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approach = await this.service.update(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      if (!approach) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'アプローチが見つかりません')
        );
      }
      
      res.json(ApiResponse.success(approach));
    } catch (error) {
      logger.error('アプローチ更新エラー:', error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.delete(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!result) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'アプローチが見つかりません')
        );
      }
      
      res.json(ApiResponse.success({ deleted: true }));
    } catch (error) {
      logger.error('アプローチ削除エラー:', error);
      next(error);
    }
  };
  
  send = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.sendApproach(req.body, req.companyId!);
      res.json(ApiResponse.success(result));
    } catch (error) {
      logger.error('アプローチ送信エラー:', error);
      next(error);
    }
  };
  
  bulkSend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targetIds, engineerIds, templateId, customMessage } = req.body;
      
      const results = await this.service.bulkSendApproaches(
        {
          targetIds,
          engineerIds,
          templateId,
          customMessage
        },
        req.companyId!
      );
      
      res.json(ApiResponse.success({
        sent: results.successful.length,
        failed: results.failed.length,
        details: results
      }));
    } catch (error) {
      logger.error('一括アプローチエラー:', error);
      next(error);
    }
  };

  resend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.resendApproach(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      logger.error('アプローチ再送信エラー:', error);
      next(error);
    }
  };
  
  getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await this.service.getTemplates(req.companyId!);
      res.json(ApiResponse.success(templates));
    } catch (error) {
      logger.error('テンプレート一覧取得エラー:', error);
      next(error);
    }
  };

  getTemplateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await this.service.getTemplateById(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!template) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'テンプレートが見つかりません')
        );
      }
      
      res.json(ApiResponse.success(template));
    } catch (error) {
      logger.error('テンプレート取得エラー:', error);
      next(error);
    }
  };
  
  createTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await this.service.createTemplate(req.body, req.companyId!, req.user?.id);
      res.status(201).json(ApiResponse.success(template));
    } catch (error) {
      logger.error('テンプレート作成エラー:', error);
      next(error);
    }
  };

  updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await this.service.updateTemplate(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      if (!template) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'テンプレートが見つかりません')
        );
      }
      
      res.json(ApiResponse.success(template));
    } catch (error) {
      logger.error('テンプレート更新エラー:', error);
      next(error);
    }
  };

  deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deleteTemplate(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!result) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'テンプレートが見つかりません')
        );
      }
      
      res.json(ApiResponse.success({ deleted: true }));
    } catch (error) {
      logger.error('テンプレート削除エラー:', error);
      next(error);
    }
  };

  getPeriodicApproaches = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const periodicApproaches = await this.service.getPeriodicApproaches(req.companyId!);
      res.json(ApiResponse.success(periodicApproaches));
    } catch (error) {
      logger.error('定期アプローチ取得エラー:', error);
      next(error);
    }
  };
  
  createPeriodicApproach = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const periodicApproach = await this.service.createPeriodicApproach(
        req.body,
        req.companyId!,
        req.user?.id
      );
      res.status(201).json(ApiResponse.success(periodicApproach));
    } catch (error) {
      logger.error('定期アプローチ作成エラー:', error);
      next(error);
    }
  };

  updatePeriodicApproach = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const periodicApproach = await this.service.updatePeriodicApproach(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      if (!periodicApproach) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', '定期アプローチが見つかりません')
        );
      }
      
      res.json(ApiResponse.success(periodicApproach));
    } catch (error) {
      logger.error('定期アプローチ更新エラー:', error);
      next(error);
    }
  };

  pausePeriodicApproach = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.pausePeriodicApproach(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      logger.error('定期アプローチ一時停止エラー:', error);
      next(error);
    }
  };

  resumePeriodicApproach = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.resumePeriodicApproach(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      logger.error('定期アプローチ再開エラー:', error);
      next(error);
    }
  };

  deletePeriodicApproach = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deletePeriodicApproach(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!result) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', '定期アプローチが見つかりません')
        );
      }
      
      res.json(ApiResponse.success({ deleted: true }));
    } catch (error) {
      logger.error('定期アプローチ削除エラー:', error);
      next(error);
    }
  };

  getFreelancers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const freelancers = await this.service.getFreelancers();
      res.json(ApiResponse.success(freelancers));
    } catch (error) {
      logger.error('フリーランス一覧取得エラー:', error);
      next(error);
    }
  };
  
  approachFreelance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { freelanceId, projectDetails, message } = req.body;
      
      const result = await this.service.approachFreelance(
        {
          freelanceId,
          projectDetails,
          message
        },
        req.companyId!
      );
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      logger.error('フリーランスアプローチエラー:', error);
      next(error);
    }
  };

  getFreelanceHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await this.service.getFreelanceHistory(req.companyId!);
      res.json(ApiResponse.success(history));
    } catch (error) {
      logger.error('フリーランスアプローチ履歴取得エラー:', error);
      next(error);
    }
  };
  
  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const stats = await this.service.getStatistics(
        req.companyId!,
        dateFrom as string,
        dateTo as string
      );
      
      res.json(ApiResponse.success(stats));
    } catch (error) {
      logger.error('統計取得エラー:', error);
      next(error);
    }
  };
  
  getMonthlyStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, month } = req.query;
      
      const stats = await this.service.getMonthlyStatistics(
        req.companyId!,
        parseInt(year as string),
        parseInt(month as string)
      );
      
      res.json(ApiResponse.success(stats));
    } catch (error) {
      logger.error('月次統計取得エラー:', error);
      next(error);
    }
  };
}
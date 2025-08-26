import { Request, Response, NextFunction } from 'express';
import { PartnerService } from '../services/partner.service';
import { ApiResponse } from '../utils/response.util';
import logger from '../config/logger';

export class PartnerController {
  private service: PartnerService;
  
  constructor() {
    this.service = new PartnerService();
  }
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, contractStatus, search } = req.query;
      const { page, limit, offset } = req.pagination!;
      
      const partners = await this.service.findAll(
        req.companyId!,
        { page, limit, offset },
        { status: status as string, contractStatus: contractStatus as string, search: search as string }
      );
      
      const total = await this.service.count(req.companyId!, { status, contractStatus, search });
      
      res.json(ApiResponse.paginated(partners, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }));
    } catch (error) {
      logger.error('取引先一覧取得エラー:', error);
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const partner = await this.service.findById(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!partner) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', '取引先企業が見つかりません')
        );
      }
      
      res.json(ApiResponse.success(partner));
    } catch (error) {
      logger.error('取引先取得エラー:', error);
      next(error);
    }
  };
  
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const partner = await this.service.create(req.body, req.companyId!);
      res.status(201).json(ApiResponse.success(partner));
    } catch (error) {
      logger.error('取引先作成エラー:', error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const partner = await this.service.update(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      if (!partner) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', '取引先企業が見つかりません')
        );
      }
      
      res.json(ApiResponse.success(partner));
    } catch (error) {
      logger.error('取引先更新エラー:', error);
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
          ApiResponse.error('NOT_FOUND', '取引先企業が見つかりません')
        );
      }
      
      res.json(ApiResponse.success({ deleted: true }));
    } catch (error) {
      logger.error('取引先削除エラー:', error);
      next(error);
    }
  };

  getPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await this.service.getPermissions(
        parseInt(req.params.id),
        req.companyId!
      );
      
      if (!permissions) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', '権限設定が見つかりません')
        );
      }
      
      res.json(ApiResponse.success(permissions));
    } catch (error) {
      logger.error('権限取得エラー:', error);
      next(error);
    }
  };
  
  updatePermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await this.service.updatePermissions(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      res.json(ApiResponse.success(permissions));
    } catch (error) {
      logger.error('権限更新エラー:', error);
      next(error);
    }
  };
  
  getVisibleEngineers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineers = await this.service.getVisibleEngineers(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(engineers));
    } catch (error) {
      logger.error('公開エンジニア取得エラー:', error);
      next(error);
    }
  };
  
  setVisibleEngineers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { engineerIds, autoPublish } = req.body;
      
      const result = await this.service.setVisibleEngineers(
        parseInt(req.params.id),
        engineerIds,
        autoPublish,
        req.companyId!
      );
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      logger.error('公開エンジニア設定エラー:', error);
      next(error);
    }
  };

  removeVisibleEngineer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.removeVisibleEngineer(
        parseInt(req.params.id),
        parseInt(req.params.engineerId),
        req.companyId!
      );
      
      res.json(ApiResponse.success(result));
    } catch (error) {
      logger.error('公開エンジニア削除エラー:', error);
      next(error);
    }
  };

  getAccessUrls = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const urls = await this.service.getAccessUrls(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(urls));
    } catch (error) {
      logger.error('アクセスURL取得エラー:', error);
      next(error);
    }
  };
  
  createAccessUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expiresIn, maxUses } = req.body;
      
      const accessUrl = await this.service.createAccessUrl(
        parseInt(req.params.id),
        { expiresIn, maxUses },
        req.companyId!,
        req.user?.id
      );
      
      res.status(201).json(ApiResponse.success(accessUrl));
    } catch (error) {
      logger.error('アクセスURL作成エラー:', error);
      next(error);
    }
  };

  deleteAccessUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deleteAccessUrl(
        parseInt(req.params.id),
        parseInt(req.params.urlId),
        req.companyId!
      );
      
      if (!result) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'アクセスURLが見つかりません')
        );
      }
      
      res.json(ApiResponse.success({ deleted: true }));
    } catch (error) {
      logger.error('アクセスURL削除エラー:', error);
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.service.getPartnerUsers(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(users));
    } catch (error) {
      logger.error('取引先ユーザー取得エラー:', error);
      next(error);
    }
  };
  
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.createPartnerUser(
        parseInt(req.params.id),
        req.body,
        req.companyId!
      );
      
      res.status(201).json(ApiResponse.success(user));
    } catch (error) {
      logger.error('取引先ユーザー作成エラー:', error);
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.updatePartnerUser(
        parseInt(req.params.id),
        parseInt(req.params.userId),
        req.body,
        req.companyId!
      );
      
      if (!user) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'ユーザーが見つかりません')
        );
      }
      
      res.json(ApiResponse.success(user));
    } catch (error) {
      logger.error('取引先ユーザー更新エラー:', error);
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.deletePartnerUser(
        parseInt(req.params.id),
        parseInt(req.params.userId),
        req.companyId!
      );
      
      if (!result) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'ユーザーが見つかりません')
        );
      }
      
      res.json(ApiResponse.success({ deleted: true }));
    } catch (error) {
      logger.error('取引先ユーザー削除エラー:', error);
      next(error);
    }
  };
  resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPassword } = req.body;
      
      const result = await this.service.resetPartnerUserPassword(
        parseInt(req.params.id),
        parseInt(req.params.userId),
        newPassword,
        req.companyId!
      );
      
      if (!result) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'ユーザーが見つかりません')
        );
      }
      
      res.json(ApiResponse.success({ message: 'パスワードをリセットしました' }));
    } catch (error) {
      logger.error('取引先ユーザーパスワードリセットエラー:', error);
      next(error);
    }
  };
  
  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getPartnerStatistics(
        parseInt(req.params.id),
        req.companyId!
      );
      
      res.json(ApiResponse.success(stats));
    } catch (error) {
      logger.error('統計取得エラー:', error);
      next(error);
    }
  };
}
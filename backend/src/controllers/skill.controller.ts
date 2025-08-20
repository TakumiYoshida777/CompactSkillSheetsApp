import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.util';
import logger from '../config/logger';

export class SkillController {
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(ApiResponse.success([]));
    } catch (error) {
      logger.error('スキル一覧取得エラー:', error);
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(ApiResponse.success(null));
    } catch (error) {
      logger.error('スキル取得エラー:', error);
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(ApiResponse.success(req.body));
    } catch (error) {
      logger.error('スキル作成エラー:', error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(ApiResponse.success(req.body));
    } catch (error) {
      logger.error('スキル更新エラー:', error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(ApiResponse.success({ deleted: true }));
    } catch (error) {
      logger.error('スキル削除エラー:', error);
      next(error);
    }
  };
}
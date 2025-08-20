import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.util';
import logger from '../config/logger';

export class SearchController {
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(ApiResponse.success({ results: [] }));
    } catch (error) {
      logger.error('検索エラー:', error);
      next(error);
    }
  };

  searchEngineers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(ApiResponse.success({ engineers: [] }));
    } catch (error) {
      logger.error('エンジニア検索エラー:', error);
      next(error);
    }
  };

  searchProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(ApiResponse.success({ projects: [] }));
    } catch (error) {
      logger.error('プロジェクト検索エラー:', error);
      next(error);
    }
  };
}
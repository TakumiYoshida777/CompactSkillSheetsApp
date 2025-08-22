import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { handleError } from '../utils/error.handler';

class AnalyticsController {
  // ダッシュボードデータ取得
  async getDashboardData(req: Request, res: Response): Promise<Response | void> {
    try {
      // company.middlewareが設定したcompanyIdを使用
      const companyId = req.companyId || req.user?.companyId;
      if (!companyId) {
        return res.status(403).json({
          success: false,
          message: '企業IDが見つかりません'
        });
      }

      const dashboardData = await analyticsService.getDashboardData(companyId);
      
      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // エンジニア統計取得
  async getEngineerStatistics(req: Request, res: Response): Promise<Response | void> {
    try {
      // company.middlewareが設定したcompanyIdを使用
      const companyId = req.companyId || req.user?.companyId;
      if (!companyId) {
        return res.status(403).json({
          success: false,
          message: '企業IDが見つかりません'
        });
      }

      const statistics = await analyticsService.getEngineerStatistics(companyId);
      
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // アプローチ統計取得
  async getApproachStatistics(req: Request, res: Response): Promise<Response | void> {
    try {
      // company.middlewareが設定したcompanyIdを使用
      const companyId = req.companyId || req.user?.companyId;
      if (!companyId) {
        return res.status(403).json({
          success: false,
          message: '企業IDが見つかりません'
        });
      }

      const statistics = await analyticsService.getApproachStatistics(companyId);
      
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      handleError(res, error);
    }
  }
}

export const analyticsController = new AnalyticsController();
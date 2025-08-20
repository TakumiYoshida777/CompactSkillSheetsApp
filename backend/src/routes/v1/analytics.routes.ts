import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { companyMiddleware } from '../../middleware/company.middleware';
import { analyticsController } from '../../controllers/analytics.controller';
import { ApiResponse } from '../../utils/response.util';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// 認証必須
router.use(authMiddleware);
router.use(companyMiddleware);

// ダッシュボードデータ取得
router.get('/dashboard', analyticsController.getDashboardData.bind(analyticsController));

// エンジニア統計取得
router.get('/engineers/statistics', analyticsController.getEngineerStatistics.bind(analyticsController));

// プロジェクト統計取得
router.get('/projects/statistics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statistics = {
      total: 12,
      byStatus: {
        planning: 1,
        active: 8,
        completed: 3,
      },
      byScale: {
        small: 3,
        medium: 6,
        large: 2,
        extraLarge: 1,
      },
      revenue: {
        total: 145000000,
        average: 12083333,
        highest: 35000000,
        lowest: 3000000,
      },
      clientDistribution: [
        { client: '金融・保険', count: 4 },
        { client: '製造業', count: 3 },
        { client: '情報通信', count: 3 },
        { client: 'その他', count: 2 },
      ],
    };
    
    res.json(ApiResponse.success(statistics));
  } catch (error) {
    next(error);
  }
});

// アプローチ統計取得
router.get('/approaches/statistics', analyticsController.getApproachStatistics.bind(analyticsController));

// 売上分析取得
router.get('/revenue/analysis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    const analysis = {
      period,
      year,
      data: [
        { period: '2024-01', revenue: 10500000, cost: 7350000, profit: 3150000 },
        { period: '2024-02', revenue: 11200000, cost: 7840000, profit: 3360000 },
        { period: '2024-03', revenue: 12800000, cost: 8960000, profit: 3840000 },
        { period: '2024-04', revenue: 11500000, cost: 8050000, profit: 3450000 },
        { period: '2024-05', revenue: 11800000, cost: 8260000, profit: 3540000 },
        { period: '2024-06', revenue: 12500000, cost: 8750000, profit: 3750000 },
      ],
      summary: {
        totalRevenue: 70300000,
        totalCost: 49210000,
        totalProfit: 21090000,
        profitRate: 30.0,
        averageMonthlyRevenue: 11716667,
      },
    };
    
    res.json(ApiResponse.success(analysis));
  } catch (error) {
    next(error);
  }
});

export default router;
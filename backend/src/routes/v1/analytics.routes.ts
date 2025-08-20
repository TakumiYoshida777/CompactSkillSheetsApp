import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { companyMiddleware } from '../../middleware/company.middleware';
import { ApiResponse } from '../../utils/response.util';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// 認証必須
router.use(authMiddleware);
router.use(companyMiddleware);

// ダッシュボードデータ取得
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: 実際のデータベースクエリを実装
    const dashboardData = {
      engineers: {
        total: 25,
        working: 15,
        waiting: 8,
        waitingSoon: 2,
      },
      projects: {
        total: 12,
        active: 8,
        completed: 3,
        upcoming: 1,
      },
      approaches: {
        total: 45,
        thisMonth: 12,
        pending: 5,
        responseRate: 68,
      },
      revenue: {
        thisMonth: 12500000,
        lastMonth: 11800000,
        growth: 5.9,
      },
      utilizationRate: 72,
      averageSkillScore: 4.2,
    };
    
    res.json(ApiResponse.success(dashboardData));
  } catch (error) {
    next(error);
  }
});

// エンジニア統計取得
router.get('/engineers/statistics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statistics = {
      total: 25,
      byStatus: {
        working: 15,
        waiting: 8,
        waitingSoon: 2,
      },
      byType: {
        employee: 18,
        partner: 5,
        freelance: 2,
      },
      skillDistribution: {
        'JavaScript': 18,
        'TypeScript': 15,
        'React': 14,
        'Python': 10,
        'Java': 8,
      },
      experienceDistribution: {
        '0-2年': 3,
        '3-5年': 8,
        '6-10年': 10,
        '11年以上': 4,
      },
      utilizationTrend: [
        { month: '2024-01', rate: 68 },
        { month: '2024-02', rate: 72 },
        { month: '2024-03', rate: 75 },
        { month: '2024-04', rate: 70 },
        { month: '2024-05', rate: 72 },
        { month: '2024-06', rate: 74 },
      ],
    };
    
    res.json(ApiResponse.success(statistics));
  } catch (error) {
    next(error);
  }
});

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
router.get('/approaches/statistics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statistics = {
      total: 245,
      thisMonth: 28,
      byStatus: {
        sent: 180,
        opened: 150,
        replied: 65,
        negotiating: 15,
        contracted: 25,
      },
      responseRate: 36.1,
      conversionRate: 13.9,
      averageResponseTime: '2.3日',
      topPerformingTemplates: [
        { id: 1, name: 'スキルマッチ提案', responseRate: 42 },
        { id: 2, name: '即戦力アピール', responseRate: 38 },
        { id: 3, name: '長期安定提案', responseRate: 35 },
      ],
      monthlyTrend: [
        { month: '2024-01', sent: 35, replied: 12 },
        { month: '2024-02', sent: 42, replied: 15 },
        { month: '2024-03', sent: 38, replied: 14 },
        { month: '2024-04', sent: 45, replied: 18 },
        { month: '2024-05', sent: 30, replied: 10 },
        { month: '2024-06', sent: 28, replied: 11 },
      ],
    };
    
    res.json(ApiResponse.success(statistics));
  } catch (error) {
    next(error);
  }
});

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
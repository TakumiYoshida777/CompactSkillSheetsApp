import { errorLog } from '../../utils/logger';
import { Request, Response } from 'express';
import { AuthRequest } from '../../types/auth';

export const engineerDashboardController = {
  getDashboardData: async (req: AuthRequest, res: Response) => {
    try {
      // 一時的に認証をスキップ（開発用）
      const engineerId = req.user?.id || 'demo-engineer-id';

      // デモ用のダッシュボードデータ
      const dashboardData = {
        engineer: {
          id: engineerId,
          name: 'テストエンジニア',
          email: req.user?.email || 'test@example.com',
          currentStatus: 'working',
          availableDate: '2024-04-01',
          isPublic: true,
          totalExperience: 5,
        },
        skillSheetCompletion: 75,
        currentProject: 'サンプルプロジェクト',
        upcomingProjects: [
          {
            id: '1',
            name: '次期プロジェクトA',
            startDate: '2024-05-01',
            client: 'クライアントA',
          },
        ],
        recentActivities: [
          {
            id: '1',
            type: 'skill_update',
            title: 'スキルシート更新',
            description: 'JavaScriptスキルを追加しました',
            timestamp: new Date('2024-01-15T10:30:00'),
          },
          {
            id: '2',
            type: 'project_complete',
            title: 'プロジェクト完了',
            description: 'ECサイト開発プロジェクトが完了しました',
            timestamp: new Date('2024-01-10T18:00:00'),
          },
        ],
        statistics: {
          totalProjects: 12,
          completedProjects: 10,
          averageRating: 4.5,
          skillCount: 15,
        },
      };

      res.json(dashboardData);
    } catch (error) {
      errorLog('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'ダッシュボードデータの取得に失敗しました' });
    }
  },
};
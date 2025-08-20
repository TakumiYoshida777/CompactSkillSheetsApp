import axiosInstance from '../../lib/axios';
import type { 
  DashboardData, 
  EngineerStatistics, 
  ApproachStatistics 
} from '../../types/dashboard';

const API_V1_PATH = '/v1';

// 共通のAxiosインスタンスを使用
const apiClient = {
  get: (path: string) => axiosInstance.get(`${API_V1_PATH}${path}`),
  post: (path: string, data?: any) => axiosInstance.post(`${API_V1_PATH}${path}`, data),
  put: (path: string, data?: any) => axiosInstance.put(`${API_V1_PATH}${path}`, data),
  delete: (path: string) => axiosInstance.delete(`${API_V1_PATH}${path}`),
};

export const dashboardAPI = {
  // ダッシュボードデータ取得
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const response = await apiClient.get('/analytics/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('ダッシュボードデータ取得エラー:', error);
      // モックデータを返す（開発中）
      return {
        kpi: {
          totalEngineers: 45,
          activeEngineers: 32,
          waitingEngineers: 13,
          monthlyRevenue: 19200000,
          acceptanceRate: 65
        },
        approaches: {
          current: 15,
          previous: 12,
          growth: 25
        },
        recentActivities: [
          {
            type: 'approach',
            title: '田中太郎へのアプローチ',
            status: 'pending',
            createdAt: new Date()
          },
          {
            type: 'project',
            title: '山田花子のプロジェクト: システム開発案件',
            status: 'active',
            createdAt: new Date()
          }
        ]
      };
    }
  },

  // エンジニア統計取得
  getEngineerStatistics: async (): Promise<EngineerStatistics> => {
    try {
      const response = await apiClient.get('/analytics/engineers/statistics');
      return response.data.data;
    } catch (error) {
      console.error('エンジニア統計取得エラー:', error);
      // モックデータを返す（開発中）
      return {
        statusDistribution: [
          { status: 'ACTIVE', count: 32 },
          { status: 'WAITING', count: 13 }
        ],
        upcomingEngineers: [
          {
            id: '1',
            name: '田中太郎',
            startDate: new Date('2025-09-01'),
            projectName: 'システム開発プロジェクト'
          },
          {
            id: '2',
            name: '山田花子',
            startDate: new Date('2025-09-15'),
            projectName: 'Webアプリケーション開発'
          }
        ],
        skillDistribution: [
          { skillName: 'JavaScript', count: 28 },
          { skillName: 'TypeScript', count: 25 },
          { skillName: 'React', count: 22 },
          { skillName: 'Node.js', count: 18 },
          { skillName: 'Python', count: 15 }
        ]
      };
    }
  },

  // アプローチ統計取得
  getApproachStatistics: async (): Promise<ApproachStatistics> => {
    try {
      const response = await apiClient.get('/analytics/approaches/statistics');
      return response.data.data;
    } catch (error) {
      console.error('アプローチ統計取得エラー:', error);
      // モックデータを返す（開発中）
      const today = new Date();
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      return {
        statusDistribution: [
          { status: 'PENDING', count: 12 },
          { status: 'ACCEPTED', count: 8 },
          { status: 'REJECTED', count: 3 }
        ],
        dailyTrend: dates.map(date => ({
          date,
          total: Math.floor(Math.random() * 10) + 1,
          accepted: Math.floor(Math.random() * 5)
        })),
        topClients: [
          { clientName: '株式会社ABC', count: 15 },
          { clientName: '株式会社XYZ', count: 12 },
          { clientName: '株式会社DEF', count: 8 }
        ]
      };
    }
  },

  // 待機中エンジニア一覧取得
  getWaitingEngineers: async (limit = 5) => {
    try {
      const response = await apiClient.get(`/engineers?status=waiting&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('待機中エンジニア取得エラー:', error);
      return [];
    }
  },

  // 稼働予定エンジニア一覧取得
  getUpcomingEngineers: async (limit = 5) => {
    try {
      const response = await apiClient.get(`/engineers?status=upcoming&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('稼働予定エンジニア取得エラー:', error);
      return [];
    }
  }
};
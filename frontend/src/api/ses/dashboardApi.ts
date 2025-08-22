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
    const response = await apiClient.get('/analytics/dashboard');
    return response.data.data;
  },

  // エンジニア統計取得
  getEngineerStatistics: async (): Promise<EngineerStatistics> => {
    const response = await apiClient.get('/analytics/engineers/statistics');
    return response.data.data;
  },

  // アプローチ統計取得
  getApproachStatistics: async (): Promise<ApproachStatistics> => {
    const response = await apiClient.get('/analytics/approaches/statistics');
    return response.data.data;
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
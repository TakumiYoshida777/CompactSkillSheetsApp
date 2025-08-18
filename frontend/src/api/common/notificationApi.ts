import axios from 'axios';
import { Notification, SystemAnnouncement } from '../../stores/notificationStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const notificationAPI = {
  // 通知一覧取得
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    try {
      const response = await apiClient.get('/notifications', {
        params: { page, limit, unreadOnly }
      });
      return response.data.data;
    } catch (error) {
      console.error('通知一覧取得エラー:', error);
      // モックデータを返す（開発中）
      return {
        notifications: [
          {
            id: '1',
            type: 'approach',
            title: '新しいアプローチがあります',
            content: '株式会社ABCから田中太郎へのアプローチがありました',
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            type: 'project',
            title: 'プロジェクト開始のお知らせ',
            content: '山田花子のプロジェクトが開始されました',
            isRead: true,
            readAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ] as Notification[],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      };
    }
  },

  // 未読数取得
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.data.count;
    } catch (error) {
      console.error('未読数取得エラー:', error);
      return 5; // モックデータ
    }
  },

  // 通知を既読にする
  markAsRead: async (notificationIds: string[]): Promise<void> => {
    try {
      await apiClient.post('/notifications/mark-read', {
        notificationIds
      });
    } catch (error) {
      console.error('既読処理エラー:', error);
      throw error;
    }
  },

  // すべての通知を既読にする
  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.post('/notifications/mark-all-read');
    } catch (error) {
      console.error('すべて既読処理エラー:', error);
      throw error;
    }
  },

  // システムアナウンス取得
  getAnnouncements: async (): Promise<SystemAnnouncement[]> => {
    try {
      const response = await apiClient.get('/notifications/announcements');
      return response.data.data;
    } catch (error) {
      console.error('アナウンス取得エラー:', error);
      // モックデータを返す（開発中）
      return [
        {
          id: '1',
          title: 'システムメンテナンスのお知らせ',
          content: '8月20日 2:00〜4:00にシステムメンテナンスを実施します',
          type: 'info',
          priority: 1,
          isActive: true,
          startDate: new Date(),
          endDate: new Date('2025-08-20')
        }
      ];
    }
  }
};
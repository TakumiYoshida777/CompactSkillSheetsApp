import { errorLog } from '../utils/logger';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { notificationAPI } from '../api/common/notificationApi';

// 型定義
export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  relatedId?: string;
  relatedType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

interface NotificationState {
  // データ
  notifications: Notification[];
  announcements: SystemAnnouncement[];
  unreadCount: number;
  
  // ページネーション
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // 状態管理
  isLoading: boolean;
  error: string | null;
  
  // アクション
  fetchNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  setPageSize: (size: number) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      // 初期状態
      notifications: [],
      announcements: [],
      unreadCount: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      isLoading: false,
      error: null,

      // 通知一覧取得
      fetchNotifications: async (page = 1, unreadOnly = false) => {
        set({ isLoading: true, error: null });
        try {
          const { pageSize } = get();
          const response = await notificationAPI.getNotifications(page, pageSize, unreadOnly);
          
          set({ 
            notifications: response.notifications,
            currentPage: response.pagination.page,
            totalPages: response.pagination.totalPages,
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '通知の取得に失敗しました';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          errorLog('通知取得エラー:', error);
        }
      },

      // 未読数取得
      fetchUnreadCount: async () => {
        try {
          const count = await notificationAPI.getUnreadCount();
          set({ unreadCount: count });
        } catch (error) {
          errorLog('未読数取得エラー:', error);
        }
      },

      // アナウンス取得
      fetchAnnouncements: async () => {
        try {
          const announcements = await notificationAPI.getAnnouncements();
          set({ announcements });
        } catch (error) {
          errorLog('アナウンス取得エラー:', error);
        }
      },

      // 既読にする
      markAsRead: async (notificationIds: string[]) => {
        try {
          await notificationAPI.markAsRead(notificationIds);
          
          // ローカル状態を更新
          const { notifications, unreadCount } = get();
          const updatedNotifications = notifications.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          );
          
          const readCount = notificationIds.filter(id => 
            notifications.find(n => n.id === id && !n.isRead)
          ).length;
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: Math.max(0, unreadCount - readCount)
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '既読処理に失敗しました';
          set({ error: errorMessage });
          errorLog('既読処理エラー:', error);
        }
      },

      // すべて既読にする
      markAllAsRead: async () => {
        try {
          await notificationAPI.markAllAsRead();
          
          // ローカル状態を更新
          const { notifications } = get();
          const updatedNotifications = notifications.map(notif => ({
            ...notif,
            isRead: true,
            readAt: new Date()
          }));
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: 0
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'すべて既読処理に失敗しました';
          set({ error: errorMessage });
          errorLog('すべて既読処理エラー:', error);
        }
      },

      // 通知クリア
      clearNotifications: () => {
        set({ 
          notifications: [],
          unreadCount: 0,
          currentPage: 1,
          totalPages: 1
        });
      },

      // ページサイズ設定
      setPageSize: (size: number) => {
        set({ pageSize: size });
      },

      // エラークリア
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'notification-store'
    }
  )
);
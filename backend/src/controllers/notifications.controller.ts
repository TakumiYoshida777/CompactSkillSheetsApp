import { Request, Response } from 'express';
import { notificationsService } from '../services/notifications.service';
import { handleError } from '../utils/error.handler';

class NotificationsController {
  // 通知一覧取得
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(403).json({
          success: false,
          message: 'ユーザーIDが見つかりません'
        });
      }

      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      const notifications = await notificationsService.getNotifications(
        userId,
        Number(page),
        Number(limit),
        unreadOnly === 'true'
      );
      
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // 未読数取得
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(403).json({
          success: false,
          message: 'ユーザーIDが見つかりません'
        });
      }

      const count = await notificationsService.getUnreadCount(userId);
      
      res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // 通知を既読にする
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { notificationIds } = req.body;

      if (!userId) {
        return res.status(403).json({
          success: false,
          message: 'ユーザーIDが見つかりません'
        });
      }

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({
          success: false,
          message: '通知IDの配列が必要です'
        });
      }

      await notificationsService.markAsRead(userId, notificationIds);
      
      res.status(200).json({
        success: true,
        message: '通知を既読にしました'
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // すべての通知を既読にする
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(403).json({
          success: false,
          message: 'ユーザーIDが見つかりません'
        });
      }

      await notificationsService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: 'すべての通知を既読にしました'
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // システムアナウンス取得
  async getAnnouncements(req: Request, res: Response) {
    try {
      const announcements = await notificationsService.getAnnouncements();
      
      res.status(200).json({
        success: true,
        data: announcements
      });
    } catch (error) {
      handleError(res, error);
    }
  }
}

export const notificationsController = new NotificationsController();
import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// 通知一覧取得
router.get(
  '/',
  authenticateToken,
  notificationsController.getNotifications
);

// 未読数取得
router.get(
  '/unread-count',
  authenticateToken,
  notificationsController.getUnreadCount
);

// 通知を既読にする
router.post(
  '/mark-read',
  authenticateToken,
  notificationsController.markAsRead
);

// すべての通知を既読にする
router.post(
  '/mark-all-read',
  authenticateToken,
  notificationsController.markAllAsRead
);

// システムアナウンス取得
router.get(
  '/announcements',
  authenticateToken,
  notificationsController.getAnnouncements
);

export default router;
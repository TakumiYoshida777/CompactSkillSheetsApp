import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { ApiResponse } from '../../utils/response.util';
import { paginationMiddleware } from '../../middleware/pagination.middleware';
import { notificationsService } from '../../services/notifications.service';
import { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

const router = Router();
const prisma = new PrismaClient();

// 認証必須
router.use(authMiddleware);

// 通知一覧取得
router.get('/', paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    const result = await notificationsService.getNotifications(
      userId,
      Number(page),
      Number(limit),
      Boolean(unreadOnly)
    );
    
    res.json(ApiResponse.success({
      data: result.notifications,
      meta: {
        pagination: result.pagination,
      },
    }));
  } catch (error) {
    next(error);
  }
});

// 未読件数取得
router.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    const unreadCount = await notificationsService.getUnreadCount(userId);
    
    res.json(ApiResponse.success({ count: unreadCount }));
  } catch (error) {
    next(error);
  }
});

// 通知詳細取得
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    const notification = await prisma.notification.findFirst({
      where: {
        id: BigInt(id),
        userId: BigInt(userId),
      },
    });
    
    if (!notification) {
      return res.status(404).json(ApiResponse.error('NOT_FOUND', '通知が見つかりません'));
    }
    
    // BigIntをstringに変換
    const serializedNotification = {
      ...notification,
      id: notification.id.toString(),
      userId: notification.userId.toString(),
    };
    
    res.json(ApiResponse.success(serializedNotification));
  } catch (error) {
    next(error);
  }
});

// 通知作成
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, title, message, targetUserId } = req.body;
    const currentUserId = req.user?.id;
    
    if (!currentUserId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    // 管理者権限チェック（通知作成は管理者のみ可能）
    const user = await prisma.user.findUnique({
      where: { id: BigInt(currentUserId) },
      select: { role: true },
    });
    
    if (user?.role !== 'admin') {
      return res.status(403).json(ApiResponse.error('FORBIDDEN', '権限がありません'));
    }
    
    const notification = await notificationsService.createNotification({
      userId: targetUserId || currentUserId,
      type,
      title,
      content: message,
    });
    
    // BigIntをstringに変換
    const serializedNotification = {
      ...notification,
      id: notification.id.toString(),
      userId: notification.userId.toString(),
    };
    
    res.status(201).json(ApiResponse.success(serializedNotification, '通知を作成しました'));
  } catch (error) {
    next(error);
  }
});

// 既読設定
router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    await notificationsService.markAsRead(userId, [id]);
    
    res.json(ApiResponse.success(null, '通知を既読にしました'));
  } catch (error) {
    next(error);
  }
});

// 通知削除
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    await prisma.notification.deleteMany({
      where: {
        id: BigInt(id),
        userId: BigInt(userId),
      },
    });
    
    res.json(ApiResponse.success(null, '通知を削除しました'));
  } catch (error) {
    next(error);
  }
});

// 全既読設定
router.patch('/mark-all-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    await notificationsService.markAllAsRead(userId);
    
    res.json(ApiResponse.success(null, 'すべての通知を既読にしました'));
  } catch (error) {
    next(error);
  }
});

// 既読通知削除
router.delete('/clear-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    await prisma.notification.deleteMany({
      where: {
        userId: BigInt(userId),
        isRead: true,
      },
    });
    
    res.json(ApiResponse.success(null, '既読の通知を削除しました'));
  } catch (error) {
    next(error);
  }
});

// 通知設定取得
router.get('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    // ユーザーのプリファレンスを取得（存在しない場合はデフォルト値を返す）
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: { 
        notificationPreferences: true,
        emailNotifications: true,
      },
    });
    
    const settings = {
      email: {
        enabled: user?.emailNotifications !== false,
        projectUpdates: true,
        approachResponses: true,
        engineerUpdates: true,
        systemNotifications: false,
      },
      push: {
        enabled: false,
        projectUpdates: false,
        approachResponses: false,
        engineerUpdates: false,
        systemNotifications: false,
      },
      preferences: user?.notificationPreferences || {},
    };
    
    res.json(ApiResponse.success(settings));
  } catch (error) {
    next(error);
  }
});

// 通知設定更新
router.put('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const settings = req.body;
    
    if (!userId) {
      return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
    }
    
    // ユーザーの通知設定を更新
    const updatedUser = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        emailNotifications: settings.email?.enabled,
        notificationPreferences: settings.preferences || {},
        updatedAt: new Date(),
      },
      select: {
        emailNotifications: true,
        notificationPreferences: true,
      },
    });
    
    const updatedSettings = {
      email: {
        enabled: updatedUser.emailNotifications !== false,
        ...settings.email,
      },
      push: settings.push || {
        enabled: false,
        projectUpdates: false,
        approachResponses: false,
        engineerUpdates: false,
        systemNotifications: false,
      },
      preferences: updatedUser.notificationPreferences,
    };
    
    res.json(ApiResponse.success(updatedSettings, '通知設定を更新しました'));
  } catch (error) {
    next(error);
  }
});

export default router;
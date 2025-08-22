import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { ApiResponse } from '../../utils/response.util';
import { paginationMiddleware } from '../../middleware/pagination.middleware';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// 認証必須
router.use(authMiddleware);

// 通知一覧取得
router.get('/', paginationMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // TODO: 実際のデータベースクエリを実装
    const notifications = [
      {
        id: '1',
        type: 'info',
        title: '新規プロジェクト登録',
        message: 'プロジェクト「ECサイトリニューアル」が登録されました',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'success',
        title: 'アプローチ成功',
        message: '株式会社ABCからアプローチに返信がありました',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        type: 'warning',
        title: 'エンジニア稼働終了予定',
        message: '田中太郎さんのプロジェクトが来月終了予定です',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    
    res.json(ApiResponse.success({
      data: notifications,
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 3,
          totalPages: 1,
        },
      },
    }));
  } catch (error) {
    next(error);
  }
});

// 未読件数取得
router.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: 実際のデータベースクエリを実装
    const unreadCount = 2;
    
    res.json(ApiResponse.success({ count: unreadCount }));
  } catch (error) {
    next(error);
  }
});

// 通知詳細取得
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // TODO: 実際のデータベースクエリを実装
    const notification = {
      id,
      type: 'info',
      title: '新規プロジェクト登録',
      message: 'プロジェクト「ECサイトリニューアル」が登録されました',
      details: {
        projectId: 'PRJ001',
        projectName: 'ECサイトリニューアル',
        clientName: '株式会社XYZ',
      },
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    res.json(ApiResponse.success(notification));
  } catch (error) {
    next(error);
  }
});

// 通知作成
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, title, message, userId } = req.body;
    
    // TODO: 実際のデータベース保存を実装
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      userId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    res.status(201).json(ApiResponse.success(notification, '通知を作成しました'));
  } catch (error) {
    next(error);
  }
});

// 既読設定
router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // TODO: 実際のデータベース更新を実装
    res.json(ApiResponse.success(null, '通知を既読にしました'));
  } catch (error) {
    next(error);
  }
});

// 通知削除
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // TODO: 実際のデータベース削除を実装
    res.json(ApiResponse.success(null, '通知を削除しました'));
  } catch (error) {
    next(error);
  }
});

// 全既読設定
router.patch('/mark-all-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: 実際のデータベース更新を実装
    res.json(ApiResponse.success(null, 'すべての通知を既読にしました'));
  } catch (error) {
    next(error);
  }
});

// 既読通知削除
router.delete('/clear-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: 実際のデータベース削除を実装
    res.json(ApiResponse.success(null, '既読の通知を削除しました'));
  } catch (error) {
    next(error);
  }
});

// 通知設定取得
router.get('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: 実際のデータベースクエリを実装
    const settings = {
      email: {
        enabled: true,
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
    };
    
    res.json(ApiResponse.success(settings));
  } catch (error) {
    next(error);
  }
});

// 通知設定更新
router.put('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = req.body;
    
    // TODO: 実際のデータベース更新を実装
    res.json(ApiResponse.success(settings, '通知設定を更新しました'));
  } catch (error) {
    next(error);
  }
});

export default router;
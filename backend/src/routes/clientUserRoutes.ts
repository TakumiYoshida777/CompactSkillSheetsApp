import { Router } from 'express';
import { clientUserController } from '../controllers/clientUserController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleMiddleware';
import { clientUserValidation } from '../middleware/validationMiddleware';

const router = Router();

// 全てのルートで認証が必要
router.use(authenticateToken);

// ============================================
// 取引先ユーザー管理エンドポイント
// ============================================

// 取引先ユーザー一覧取得（管理者・営業）
router.get(
  '/business-partners/:partnerId/users',
  requireRole(['admin', 'sales']),
  clientUserValidation.list,
  clientUserController.getClientUsers.bind(clientUserController)
);

// 取引先ユーザー詳細取得（管理者・営業）
router.get(
  '/business-partners/:partnerId/users/:userId',
  requireRole(['admin', 'sales']),
  clientUserValidation.getById,
  clientUserController.getClientUserById.bind(clientUserController)
);

// 取引先ユーザー新規作成（管理者・営業）
router.post(
  '/business-partners/:partnerId/users',
  requireRole(['admin', 'sales']),
  clientUserValidation.create,
  clientUserController.createClientUser.bind(clientUserController)
);

// 取引先ユーザー更新（管理者・営業）
router.put(
  '/business-partners/:partnerId/users/:userId',
  requireRole(['admin', 'sales']),
  clientUserValidation.update,
  clientUserController.updateClientUser.bind(clientUserController)
);

// 取引先ユーザー削除（管理者のみ）
router.delete(
  '/business-partners/:partnerId/users/:userId',
  requireRole(['admin']),
  clientUserValidation.delete,
  clientUserController.deleteClientUser.bind(clientUserController)
);

// 取引先ユーザーアクティブ/非アクティブ切り替え（管理者・営業）
router.patch(
  '/business-partners/:partnerId/users/:userId/status',
  requireRole(['admin', 'sales']),
  clientUserValidation.updateStatus,
  clientUserController.updateClientUserStatus.bind(clientUserController)
);

// パスワードリセット（管理者のみ）
router.post(
  '/business-partners/:partnerId/users/:userId/reset-password',
  requireRole(['admin']),
  clientUserValidation.resetPassword,
  clientUserController.resetClientUserPassword.bind(clientUserController)
);

export default router;
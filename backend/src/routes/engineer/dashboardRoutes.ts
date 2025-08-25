import { Router } from 'express';
import { engineerDashboardController } from '../../controllers/engineer/dashboardController';
import { authenticateToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleAuth';

const router = Router();

// 認証ミドルウェアを適用
// 開発環境では環境変数で無効化可能
if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_AUTH === 'true') {
  router.use(authenticateToken);
  router.use(requireRole('engineer'));
}

// ダッシュボードデータ取得
router.get('/me', engineerDashboardController.getDashboardData);

export default router;
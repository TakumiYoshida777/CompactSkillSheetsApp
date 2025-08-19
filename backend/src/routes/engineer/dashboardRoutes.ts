import { Router } from 'express';
import { engineerDashboardController } from '../../controllers/engineer/dashboardController';
import { authenticateToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleAuth';

const router = Router();

// 一時的に認証を無効化（開発用）
// TODO: 本番環境では必ず認証を有効にすること
// router.use(authenticateToken);
// router.use(requireRole('engineer'));

// ダッシュボードデータ取得
router.get('/me', engineerDashboardController.getDashboardData);

export default router;
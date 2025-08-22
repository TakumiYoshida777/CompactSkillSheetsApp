import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// ダッシュボードデータ取得
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles(['ADMIN', 'SES_COMPANY_ADMIN', 'SES_COMPANY_USER']),
  analyticsController.getDashboardData
);

// エンジニア統計取得
router.get(
  '/engineers/statistics',
  authenticateToken,
  authorizeRoles(['ADMIN', 'SES_COMPANY_ADMIN', 'SES_COMPANY_USER']),
  analyticsController.getEngineerStatistics
);

// アプローチ統計取得
router.get(
  '/approaches/statistics',
  authenticateToken,
  authorizeRoles(['ADMIN', 'SES_COMPANY_ADMIN', 'SES_COMPANY_USER']),
  analyticsController.getApproachStatistics
);

export default router;
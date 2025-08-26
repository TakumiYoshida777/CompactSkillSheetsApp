import { Router } from 'express';

// 各ルートのインポート
import authRoutes from './auth.routes';
import engineerRoutes from './engineer.routes';
import projectRoutes from './project.routes';
import businessPartnerRoutes from './businessPartner.routes';
import approachRoutes from './approach.routes';
import skillSheetRoutes from './skillsheet.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// ヘルスチェックエンドポイント
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// APIバージョン情報
router.get('/version', (_req, res) => {
  res.json({
    version: 'v1',
    apiName: 'SES Skill Sheet Management API',
    documentation: 'https://docs.api.skillsheet.com'
  });
});

// 認証ルート（企業ID不要）
router.use('/auth', authRoutes);

// 企業IDが必要なルート
// SES企業向けAPI
router.use('/engineers', engineerRoutes);
router.use('/projects', projectRoutes);
router.use('/approaches', approachRoutes);
router.use('/business-partners', businessPartnerRoutes);
router.use('/skill-sheets', skillSheetRoutes);

// 分析・統計API
router.use('/analytics', analyticsRoutes);

// 通知API
router.use('/notifications', notificationRoutes);


export default router;
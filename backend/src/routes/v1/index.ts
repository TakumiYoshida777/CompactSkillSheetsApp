import { Router } from 'express';
import { companyMiddleware } from '../../middleware/company.middleware';

// 各ルートのインポート
import authRoutes from './auth.routes';
import engineerRoutes from './engineer.routes';
import projectRoutes from './project.routes';
import partnerRoutes from './partner.routes';
import partnerListRoutes from './partnerList.routes'; // 暫定実装（段階的移行中）
import approachRoutes from './approach.routes';
import skillSheetRoutes from './skillsheet.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
// import skillRoutes from './skill.routes';
// import searchRoutes from './search.routes';
// import exportRoutes from './export.routes';
// import fileRoutes from './file.routes';

const router = Router();

// ヘルスチェックエンドポイント
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// APIバージョン情報
router.get('/version', (req, res) => {
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
router.use('/business-partners', partnerRoutes);
router.use('/partner-list', partnerListRoutes); // 暫定実装（段階的移行中）
router.use('/skill-sheets', skillSheetRoutes);

// 分析・統計API
router.use('/analytics', analyticsRoutes);

// 通知API
router.use('/notifications', notificationRoutes);

// 共通API（一時的に無効化）
// router.use('/skills', skillRoutes);
// router.use('/search', searchRoutes);
// router.use('/export', exportRoutes);
// router.use('/files', fileRoutes);

export default router;
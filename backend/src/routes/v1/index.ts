import { Router } from 'express';
import { companyMiddleware } from '../../middleware/company.middleware';

// 各ルートのインポート
import engineerRoutes from './engineer.routes';
import projectRoutes from './project.routes';
import partnerRoutes from './partner.routes';
import approachRoutes from './approach.routes';
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

// 企業IDが必要なルート
// SES企業向けAPI
router.use('/engineers', engineerRoutes);
router.use('/projects', projectRoutes);
router.use('/approaches', approachRoutes);
router.use('/business-partners', partnerRoutes);

// 共通API
// router.use('/skills', skillRoutes);
// router.use('/search', searchRoutes);
// router.use('/export', exportRoutes);
// router.use('/files', fileRoutes);

export default router;
import { Router } from 'express';
import { ExportController } from '../../controllers/export.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { exportValidation } from '../../validators/export.validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { companyMiddleware } from '../../middleware/company.middleware';

const router = Router();
const controller = new ExportController();

// 認証とマルチテナント対応のミドルウェアを適用
router.use(authMiddleware);
router.use(companyMiddleware);

// スキルシートエクスポート
router.post('/skill-sheet/:engineerId', validateRequest(exportValidation.skillSheet), controller.exportSkillSheet);
router.post('/skill-sheets/bulk', validateRequest(exportValidation.bulkSkillSheets), controller.exportBulkSkillSheets);

// エンジニアリストエクスポート
router.post('/engineers', validateRequest(exportValidation.engineers), controller.exportEngineers);

// プロジェクトリストエクスポート
router.post('/projects', validateRequest(exportValidation.projects), controller.exportProjects);

// アプローチ履歴エクスポート
router.post('/approaches', validateRequest(exportValidation.approaches), controller.exportApproaches);

// 統計レポートエクスポート
router.post('/statistics', validateRequest(exportValidation.statistics), controller.exportStatistics);

// カスタムレポート
router.post('/custom', validateRequest(exportValidation.custom), controller.exportCustomReport);

// エクスポート履歴
router.get('/history', controller.getExportHistory);
router.get('/download/:id', controller.downloadExport);
router.delete('/history/:id', controller.deleteExportHistory);

// テンプレート管理
router.get('/templates', controller.getTemplates);
router.post('/templates', validateRequest(exportValidation.template), controller.createTemplate);
router.put('/templates/:id', validateRequest(exportValidation.template), controller.updateTemplate);
router.delete('/templates/:id', controller.deleteTemplate);

export default router;
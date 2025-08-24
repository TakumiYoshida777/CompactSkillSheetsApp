import { Router } from 'express';
import { EngineerController } from '../../controllers/engineer.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { engineerValidation } from '../../validators/engineer.validator';
import { companyMiddleware } from '../../middleware/company.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permissionMiddleware';

const router = Router();
const controller = new EngineerController();

// 全エンドポイントで認証と企業ID確認が必要
router.use(authMiddleware);
router.use(companyMiddleware);

// 基本CRUD
router.get('/', requirePermission('engineer', 'view', 'company'), paginationMiddleware, controller.getAll);
router.get('/check-email', requirePermission('engineer', 'view', 'company'), controller.checkEmail);
router.get('/:id', requirePermission('engineer', 'view', 'company'), controller.getById);
router.post('/', requirePermission('engineer', 'create'), validateRequest(engineerValidation.create), controller.create);
router.put('/:id', requirePermission('engineer', 'update', 'company'), validateRequest(engineerValidation.update), controller.update);
router.delete('/:id', requirePermission('engineer', 'delete'), controller.delete);

// ステータス管理
router.patch('/:id/status', requirePermission('engineer', 'update', 'company'), validateRequest(engineerValidation.updateStatus), controller.updateStatus);
router.patch('/:id/availability', requirePermission('engineer', 'update', 'company'), validateRequest(engineerValidation.updateAvailability), controller.updateAvailability);
router.patch('/:id/public', requirePermission('engineer', 'update', 'company'), validateRequest(engineerValidation.updatePublicStatus), controller.updatePublicStatus);

// スキルシート
router.get('/:id/skill-sheet', requirePermission('skillsheet', 'view', 'company'), controller.getSkillSheet);
router.put('/:id/skill-sheet', requirePermission('skillsheet', 'update', 'company'), validateRequest(engineerValidation.skillSheet), controller.updateSkillSheet);
router.post('/:id/skill-sheet/export', requirePermission('skillsheet', 'export'), controller.exportSkillSheet);

// 検索・フィルタリング
router.post('/search', requirePermission('engineer', 'view', 'company'), paginationMiddleware, controller.search);
router.get('/waiting', requirePermission('engineer', 'view', 'company'), paginationMiddleware, controller.getWaitingEngineers);
router.get('/available', requirePermission('engineer', 'view', 'company'), paginationMiddleware, controller.getAvailableEngineers);

// 一括操作
router.patch('/bulk/status', requirePermission('engineer', 'update', 'company'), validateRequest(engineerValidation.bulkUpdateStatus), controller.bulkUpdateStatus);
router.post('/bulk/export', requirePermission('engineer', 'export'), validateRequest(engineerValidation.bulkExport), controller.bulkExport);

export default router;
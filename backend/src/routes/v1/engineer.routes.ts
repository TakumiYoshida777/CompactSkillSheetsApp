import { Router } from 'express';
import { EngineerController } from '../../controllers/engineer.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { engineerValidation } from '../../validators/engineer.validator';
import { companyMiddleware } from '../../middleware/company.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new EngineerController();

// 全エンドポイントで認証と企業ID確認が必要
router.use(authMiddleware);
router.use(companyMiddleware);

// 基本CRUD
router.get('/', paginationMiddleware, controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(engineerValidation.create), controller.create);
router.put('/:id', validateRequest(engineerValidation.update), controller.update);
router.delete('/:id', controller.delete);

// ステータス管理
router.patch('/:id/status', validateRequest(engineerValidation.updateStatus), controller.updateStatus);
router.patch('/:id/availability', validateRequest(engineerValidation.updateAvailability), controller.updateAvailability);
router.patch('/:id/public', validateRequest(engineerValidation.updatePublicStatus), controller.updatePublicStatus);

// スキルシート
router.get('/:id/skill-sheet', controller.getSkillSheet);
router.put('/:id/skill-sheet', validateRequest(engineerValidation.skillSheet), controller.updateSkillSheet);
router.post('/:id/skill-sheet/export', controller.exportSkillSheet);

// 検索・フィルタリング
router.post('/search', paginationMiddleware, controller.search);
router.get('/waiting', paginationMiddleware, controller.getWaitingEngineers);
router.get('/available', paginationMiddleware, controller.getAvailableEngineers);

// 一括操作
router.patch('/bulk/status', validateRequest(engineerValidation.bulkUpdateStatus), controller.bulkUpdateStatus);
router.post('/bulk/export', validateRequest(engineerValidation.bulkExport), controller.bulkExport);

export default router;
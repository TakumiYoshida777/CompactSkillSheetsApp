import { Router } from 'express';
import { ApproachController } from '../../controllers/approach.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { approachValidation } from '../../validators/approach.validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { companyMiddleware } from '../../middleware/company.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';

const router = Router();
const controller = new ApproachController();

// 認証とマルチテナント対応のミドルウェアを適用
router.use(authMiddleware);
router.use(companyMiddleware);

// 基本CRUD
router.get('/', paginationMiddleware, controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(approachValidation.create), controller.create);
router.put('/:id', validateRequest(approachValidation.update), controller.update);
router.delete('/:id', controller.delete);

// 送信管理
router.post('/send', validateRequest(approachValidation.send), controller.send);
router.post('/bulk', validateRequest(approachValidation.bulk), controller.bulkSend);
router.post('/:id/resend', controller.resend);

// テンプレート管理
router.get('/templates', controller.getTemplates);
router.get('/templates/:id', controller.getTemplateById);
router.post('/templates', validateRequest(approachValidation.template), controller.createTemplate);
router.put('/templates/:id', validateRequest(approachValidation.template), controller.updateTemplate);
router.delete('/templates/:id', controller.deleteTemplate);

// 定期アプローチ
router.get('/periodic', controller.getPeriodicApproaches);
router.post('/periodic', validateRequest(approachValidation.periodic), controller.createPeriodicApproach);
router.put('/periodic/:id', validateRequest(approachValidation.periodic), controller.updatePeriodicApproach);
router.post('/periodic/:id/pause', controller.pausePeriodicApproach);
router.post('/periodic/:id/resume', controller.resumePeriodicApproach);
router.delete('/periodic/:id', controller.deletePeriodicApproach);

// フリーランスアプローチ
router.get('/freelance', controller.getFreelancers);
router.post('/freelance', validateRequest(approachValidation.freelance), controller.approachFreelance);
router.get('/freelance/history', controller.getFreelanceHistory);

// 統計
router.get('/statistics', controller.getStatistics);
router.get('/statistics/monthly', controller.getMonthlyStatistics);

export default router;
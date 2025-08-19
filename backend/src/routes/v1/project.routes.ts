import { Router } from 'express';
import { ProjectController } from '../../controllers/project.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { projectValidation } from '../../validators/project.validator';
import { companyMiddleware } from '../../middleware/company.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ProjectController();

// 全エンドポイントで認証と企業ID確認が必要
router.use(authMiddleware);
router.use(companyMiddleware);

// 基本CRUD
router.get('/', paginationMiddleware, controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(projectValidation.create), controller.create);
router.put('/:id', validateRequest(projectValidation.update), controller.update);
router.delete('/:id', controller.delete);

// ステータス管理
router.patch('/:id/status', validateRequest(projectValidation.updateStatus), controller.updateStatus);

// アサイン管理
router.get('/:id/assignments', controller.getAssignments);
router.post('/:id/assignments', validateRequest(projectValidation.createAssignment), controller.createAssignment);
router.put('/:id/assignments/:assignmentId', validateRequest(projectValidation.updateAssignment), controller.updateAssignment);
router.delete('/:id/assignments/:assignmentId', controller.deleteAssignment);

// 稼働状況
router.get('/timeline', controller.getTimeline);
router.get('/utilization', controller.getUtilization);
router.get('/:id/timeline', controller.getProjectTimeline);

// カレンダー表示
router.get('/calendar', controller.getCalendarView);

// 検索
router.post('/search', paginationMiddleware, controller.search);

export default router;
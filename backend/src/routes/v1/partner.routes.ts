import { Router } from 'express';
import { PartnerController } from '../../controllers/partner.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { partnerValidation } from '../../validations/partner.validation';
import { authMiddleware } from '../../middleware/auth.middleware';
import { companyMiddleware } from '../../middleware/company.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';

const router = Router();
const controller = new PartnerController();

// 認証とマルチテナント対応のミドルウェアを適用
router.use(authMiddleware);
router.use(companyMiddleware);

// 基本CRUD
router.get('/', paginationMiddleware, controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(partnerValidation.create), controller.create);
router.put('/:id', validateRequest(partnerValidation.update), controller.update);
router.delete('/:id', controller.delete);

// 権限管理
router.get('/:id/permissions', controller.getPermissions);
router.put('/:id/permissions', validateRequest(partnerValidation.permissions), controller.updatePermissions);

// エンジニア公開設定
router.get('/:id/visible-engineers', controller.getVisibleEngineers);
router.post('/:id/visible-engineers', validateRequest(partnerValidation.visibleEngineers), controller.setVisibleEngineers);
router.delete('/:id/visible-engineers/:engineerId', controller.removeVisibleEngineer);

// アクセスURL管理
router.get('/:id/access-urls', controller.getAccessUrls);
router.post('/:id/access-urls', validateRequest(partnerValidation.accessUrl), controller.createAccessUrl);
router.delete('/:id/access-urls/:urlId', controller.deleteAccessUrl);

// ユーザー管理
router.get('/:id/users', controller.getUsers);
router.post('/:id/users', validateRequest(partnerValidation.user), controller.createUser);
router.put('/:id/users/:userId', validateRequest(partnerValidation.user), controller.updateUser);
router.delete('/:id/users/:userId', controller.deleteUser);

// 統計
router.get('/:id/statistics', controller.getStatistics);

export default router;
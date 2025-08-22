import { Router } from 'express';
import { partnerListController } from '../../controllers/partnerListController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// 取引先一覧取得
router.get(
  '/',
  authenticateToken,
  partnerListController.getList
);

// 取引先詳細取得
router.get(
  '/:id',
  authenticateToken,
  partnerListController.getById
);

export default router;
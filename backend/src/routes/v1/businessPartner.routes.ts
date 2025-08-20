import { Router } from 'express';
import { businessPartnerController } from '../../controllers/businessPartnerController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// 取引先一覧取得
router.get(
  '/',
  authenticateToken,
  businessPartnerController.getList
);

// 取引先詳細取得
router.get(
  '/:id',
  authenticateToken,
  businessPartnerController.getById
);

// 取引先作成
router.post(
  '/',
  authenticateToken,
  businessPartnerController.create
);

// 取引先更新
router.put(
  '/:id',
  authenticateToken,
  businessPartnerController.update
);

// 取引先削除
router.delete(
  '/:id',
  authenticateToken,
  businessPartnerController.delete
);

// アプローチ履歴追加
router.post(
  '/:id/approaches',
  authenticateToken,
  businessPartnerController.addApproach
);

export default router;
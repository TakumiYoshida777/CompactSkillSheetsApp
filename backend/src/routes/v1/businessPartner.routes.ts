import { Router } from 'express';
import { businessPartnerController } from '../../controllers/businessPartnerController';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// 取引先一覧取得
router.get(
  '/',
  authMiddleware,
  (req, res) => businessPartnerController.getBusinessPartners(req, res)
);

// 取引先統計取得
router.get(
  '/stats',
  authMiddleware,
  (req, res) => businessPartnerController.getBusinessPartnerStats(req, res)
);

// 取引先詳細取得
router.get(
  '/:id',
  authMiddleware,
  (req, res) => businessPartnerController.getBusinessPartnerById(req, res)
);

// 取引先作成
router.post(
  '/',
  authMiddleware,
  (req, res) => businessPartnerController.createBusinessPartner(req, res)
);

// 取引先更新
router.put(
  '/:id',
  authMiddleware,
  (req, res) => businessPartnerController.updateBusinessPartner(req, res)
);

// 取引先削除
router.delete(
  '/:id',
  authMiddleware,
  (req, res) => businessPartnerController.deleteBusinessPartner(req, res)
);

export default router;
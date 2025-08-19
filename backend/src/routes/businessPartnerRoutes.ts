import { Router } from 'express';
import { businessPartnerController } from '../controllers/businessPartnerController';
import { accessControlController } from '../controllers/accessControlController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleMiddleware';
import { businessPartnerValidation, accessControlValidation } from '../middleware/validationMiddleware';

const router = Router();

// 全てのルートで認証が必要
router.use(authenticateToken);

// ============================================
// 取引先企業管理エンドポイント
// ============================================

// 取引先企業一覧取得（管理者・営業）
router.get(
  '/',
  requireRole(['admin', 'sales']),
  businessPartnerValidation.list,
  businessPartnerController.getBusinessPartners.bind(businessPartnerController)
);

// 取引先企業詳細取得（管理者・営業）
router.get(
  '/:id',
  requireRole(['admin', 'sales']),
  businessPartnerValidation.idParam,
  businessPartnerController.getBusinessPartnerById.bind(businessPartnerController)
);

// 取引先企業新規作成（管理者・営業）
router.post(
  '/',
  requireRole(['admin', 'sales']),
  businessPartnerValidation.create,
  businessPartnerController.createBusinessPartner.bind(businessPartnerController)
);

// 取引先企業更新（管理者・営業）
router.put(
  '/:id',
  requireRole(['admin', 'sales']),
  businessPartnerValidation.update,
  businessPartnerController.updateBusinessPartner.bind(businessPartnerController)
);

// 取引先企業削除（管理者のみ）
router.delete(
  '/:id',
  requireRole(['admin']),
  businessPartnerValidation.idParam,
  businessPartnerController.deleteBusinessPartner.bind(businessPartnerController)
);

// 取引先企業ステータス変更（管理者・営業）
router.patch(
  '/:id/status',
  requireRole(['admin', 'sales']),
  businessPartnerValidation.updateStatus,
  businessPartnerController.updateBusinessPartnerStatus.bind(businessPartnerController)
);

// 取引先企業統計情報取得（管理者・営業）
router.get(
  '/stats/summary',
  requireRole(['admin', 'sales']),
  businessPartnerController.getBusinessPartnerStats.bind(businessPartnerController)
);

// ============================================
// アクセス権限管理エンドポイント
// ============================================

// エンジニア表示権限取得
router.get(
  '/:id/permissions',
  requireRole(['admin', 'sales']),
  businessPartnerValidation.idParam,
  accessControlController.getEngineerPermissions.bind(accessControlController)
);

// エンジニア表示権限設定
router.put(
  '/:id/permissions',
  requireRole(['admin', 'sales']),
  accessControlValidation.setEngineerPermissions,
  accessControlController.setEngineerPermissions.bind(accessControlController)
);

// NGリスト取得
router.get(
  '/:id/ng-list',
  requireRole(['admin', 'sales']),
  businessPartnerValidation.idParam,
  accessControlController.getNgList.bind(accessControlController)
);

// NGリスト追加
router.post(
  '/:id/ng-list',
  requireRole(['admin', 'sales']),
  accessControlValidation.addToNgList,
  accessControlController.addToNgList.bind(accessControlController)
);

// NGリスト削除
router.delete(
  '/:id/ng-list/:engineerId',
  requireRole(['admin', 'sales']),
  accessControlValidation.removeFromNgList,
  accessControlController.removeFromNgList.bind(accessControlController)
);

// 表示可能エンジニア一覧取得（取引先企業向け）
router.get(
  '/:id/viewable-engineers',
  requireRole(['admin', 'sales']),
  businessPartnerValidation.idParam,
  accessControlController.getViewableEngineers.bind(accessControlController)
);

export default router;
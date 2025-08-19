import { Router } from 'express';
import { clientAuthController } from '../controllers/clientAuthController';
import { clientUserController } from '../controllers/clientUserController';
import { clientEngineerController } from '../controllers/clientEngineerController';
import { authenticateClientUser, checkClientAccessPermission, logClientView } from '../middleware/clientAuth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// ============================================
// 取引先企業認証エンドポイント
// ============================================

// ログイン（認証不要）
router.post('/client/auth/login', clientAuthController.login.bind(clientAuthController));

// トークン更新（認証不要）
router.post('/client/auth/refresh', clientAuthController.refresh.bind(clientAuthController));

// ログアウト
router.post('/client/auth/logout', authenticateClientUser, clientAuthController.logout.bind(clientAuthController));

// 現在のユーザー情報取得
router.get('/client/auth/me', authenticateClientUser, clientAuthController.me.bind(clientAuthController));

// ============================================
// 取引先企業ユーザー管理エンドポイント（SES企業側）
// ============================================

// 取引先企業ユーザー作成（SES企業の管理者・営業のみ）
router.post('/client-users', authenticateToken, clientUserController.createClientUser.bind(clientUserController));

// 取引先企業ユーザー一覧取得（SES企業の管理者・営業のみ）
router.get('/client-users', authenticateToken, clientUserController.getClientUsers.bind(clientUserController));

// 取引先企業ユーザー更新（SES企業の管理者・営業のみ）
router.put('/client-users/:id', authenticateToken, clientUserController.updateClientUser.bind(clientUserController));

// 取引先企業ユーザー削除（無効化）（SES企業の管理者のみ）
router.delete('/client-users/:id', authenticateToken, clientUserController.deleteClientUser.bind(clientUserController));

// ============================================
// アクセス権限管理エンドポイント（SES企業側）
// ============================================

// アクセス権限設定（SES企業の管理者・営業のみ）
router.put('/client-companies/:clientCompanyId/permissions', 
  authenticateToken, 
  clientUserController.setAccessPermissions.bind(clientUserController)
);

// アクセス権限取得（SES企業の管理者・営業のみ）
router.get('/client-companies/:clientCompanyId/permissions', 
  authenticateToken, 
  clientUserController.getAccessPermissions.bind(clientUserController)
);

// ============================================
// 取引先企業向けエンジニア情報閲覧エンドポイント
// ============================================

// オファーボードデータ取得（特定のURLを先に定義）
router.get('/client/engineers/offer-board',
  authenticateClientUser,
  logClientView,
  clientEngineerController.getOfferBoard.bind(clientEngineerController)
);

// 利用可能なエンジニア取得（オファー用）
router.get('/client/engineers/available',
  authenticateClientUser,
  logClientView,
  clientEngineerController.getEngineers.bind(clientEngineerController)
);

// エンジニア検索（アクセス権限に基づいてフィルタリング）
router.post('/client/engineers/search', 
  authenticateClientUser,
  logClientView,
  clientEngineerController.searchEngineers.bind(clientEngineerController)
);

// エンジニア一覧取得（アクセス権限に基づいてフィルタリング）
router.get('/client/engineers', 
  authenticateClientUser,
  logClientView,
  clientEngineerController.getEngineers.bind(clientEngineerController)
);

// エンジニア詳細取得（アクセス権限チェック付き）（パラメータ付きルートは最後に）
router.get('/client/engineers/:engineerId', 
  authenticateClientUser,
  checkClientAccessPermission,
  logClientView,
  clientEngineerController.getEngineerDetail.bind(clientEngineerController)
);

export default router;
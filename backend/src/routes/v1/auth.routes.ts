import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// ログイン
router.post('/login', authController.login);

// ログアウト
router.post('/logout', authController.logout);

// トークンリフレッシュ
router.post('/refresh', authController.refresh);

// 現在のユーザー情報取得
router.get('/me', authenticateToken, authController.getMe);

export default router;
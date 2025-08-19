import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { body } from 'express-validator';

const router = Router();
const authController = new AuthController();

// ログイン
router.post('/login', [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').notEmpty().withMessage('パスワードは必須です')
], validateRequest, authController.login);

// ログアウト
router.post('/logout', authController.logout);

// トークンリフレッシュ
router.post('/refresh', authController.refresh);

export default router;
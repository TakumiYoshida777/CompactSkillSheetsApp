import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    ユーザーログイン
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('有効なメールアドレスを入力してください')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('パスワードを入力してください'),
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('記憶設定は真偽値である必要があります')
  ],
  authController.login
);

/**
 * @route   POST /api/auth/register
 * @desc    新規ユーザー登録
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('有効なメールアドレスを入力してください')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('パスワードは8文字以上必要です')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('パスワードは大文字、小文字、数字を含む必要があります'),
    body('name')
      .notEmpty()
      .withMessage('名前を入力してください')
      .isLength({ max: 100 })
      .withMessage('名前は100文字以内で入力してください'),
    body('companyName')
      .optional()
      .isLength({ max: 255 })
      .withMessage('会社名は255文字以内で入力してください'),
    body('phone')
      .optional()
      .matches(/^[0-9-]+$/)
      .withMessage('電話番号は数字とハイフンのみ使用できます')
  ],
  authController.register
);

/**
 * @route   POST /api/auth/refresh
 * @desc    アクセストークンの更新
 * @access  Public
 */
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('リフレッシュトークンが必要です')
  ],
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    ログアウト
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    現在のユーザー情報取得
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

/**
 * @route   POST /api/auth/change-password
 * @desc    パスワード変更
 * @access  Private
 */
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('現在のパスワードを入力してください'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('新しいパスワードは8文字以上必要です')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('新しいパスワードは大文字、小文字、数字を含む必要があります')
      .custom((value, { req }) => value !== req.body.currentPassword)
      .withMessage('新しいパスワードは現在のパスワードと異なる必要があります')
  ],
  authController.changePassword
);

/**
 * @route   GET /api/auth/check-permission
 * @desc    権限確認
 * @access  Private
 */

export default router;
import { Router } from 'express';
import { body } from 'express-validator';
import { companyController } from '../controllers/companyController';
import { authenticateToken, requireAdmin, requirePermission, requireCompany } from '../middleware/auth';
import { USER_ROLES } from '../types/auth';

const router = Router();

/**
 * @route   POST /api/companies
 * @desc    新規企業作成（スーパー管理者のみ）
 * @access  Private (Super Admin)
 */
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('name')
      .notEmpty()
      .withMessage('企業名を入力してください')
      .isLength({ max: 255 })
      .withMessage('企業名は255文字以内で入力してください'),
    body('companyType')
      .isIn(['ses', 'client'])
      .withMessage('企業種別はsesまたはclientを指定してください'),
    body('emailDomain')
      .optional()
      .matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage('有効なドメインを入力してください'),
    body('maxEngineers')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('エンジニア上限数は1～10000の間で指定してください'),
    body('adminUser.email')
      .isEmail()
      .withMessage('有効なメールアドレスを入力してください'),
    body('adminUser.password')
      .isLength({ min: 8 })
      .withMessage('パスワードは8文字以上必要です')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('パスワードは大文字、小文字、数字を含む必要があります'),
    body('adminUser.name')
      .notEmpty()
      .withMessage('管理者名を入力してください')
  ],
  companyController.createCompany
);

/**
 * @route   GET /api/companies
 * @desc    企業一覧取得（管理者のみ）
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  companyController.getCompanies
);

/**
 * @route   GET /api/companies/current
 * @desc    現在のユーザーの企業情報取得
 * @access  Private
 */
router.get(
  '/current',
  authenticateToken,
  companyController.getCurrentCompany
);

/**
 * @route   GET /api/companies/:companyId
 * @desc    企業情報取得
 * @access  Private
 */
router.get(
  '/:companyId',
  authenticateToken,
  requireCompany('companyId'),
  companyController.getCompany
);

/**
 * @route   PUT /api/companies/:companyId
 * @desc    企業情報更新
 * @access  Private (Admin)
 */
router.put(
  '/:companyId',
  authenticateToken,
  requireCompany('companyId'),
  requirePermission('company', 'update'),
  [
    body('name')
      .optional()
      .isLength({ max: 255 })
      .withMessage('企業名は255文字以内で入力してください'),
    body('emailDomain')
      .optional()
      .matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .withMessage('有効なドメインを入力してください'),
    body('maxEngineers')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('エンジニア上限数は1～10000の間で指定してください'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('有効フラグは真偽値で指定してください')
  ],
  companyController.updateCompany
);

/**
 * @route   DELETE /api/companies/:companyId
 * @desc    企業削除（論理削除、スーパー管理者のみ）
 * @access  Private (Super Admin)
 */
router.delete(
  '/:companyId',
  authenticateToken,
  requireAdmin,
  companyController.deleteCompany
);

/**
 * @route   GET /api/companies/:companyId/users
 * @desc    企業のユーザー一覧取得
 * @access  Private
 */
router.get(
  '/:companyId/users',
  authenticateToken,
  requireCompany('companyId'),
  requirePermission('user', 'view'),
  companyController.getCompanyUsers
);

/**
 * @route   POST /api/companies/:companyId/users
 * @desc    企業にユーザー追加
 * @access  Private (Admin)
 */
router.post(
  '/:companyId/users',
  authenticateToken,
  requireCompany('companyId'),
  requirePermission('user', 'create'),
  [
    body('email')
      .isEmail()
      .withMessage('有効なメールアドレスを入力してください'),
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
    body('role')
      .isIn(Object.values(USER_ROLES))
      .withMessage('有効なロールを指定してください')
  ],
  companyController.addUserToCompany
);

/**
 * @route   GET /api/companies/:companyId/statistics
 * @desc    企業統計情報取得
 * @access  Private
 */
router.get(
  '/:companyId/statistics',
  authenticateToken,
  requireCompany('companyId'),
  companyController.getCompanyStatistics
);

export default router;
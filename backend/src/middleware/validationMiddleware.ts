import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * バリデーション結果チェックミドルウェア
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => {
      if ('msg' in error) {
        return error.msg;
      }
      return 'バリデーションエラー';
    });
    return res.status(400).json({ 
      error: 'バリデーションエラー',
      details: errorMessages 
    });
  }
  next();
};

/**
 * 取引先企業バリデーションルール
 */
export const businessPartnerValidation = {
  // 作成時のバリデーション
  create: [
    body('companyName')
      .notEmpty().withMessage('会社名は必須です')
      .isLength({ max: 100 }).withMessage('会社名は100文字以内で入力してください'),
    body('companyNameKana')
      .optional()
      .matches(/^[ァ-ヶー\s]+$/).withMessage('会社名カナは全角カタカナで入力してください')
      .isLength({ max: 100 }).withMessage('会社名カナは100文字以内で入力してください'),
    body('postalCode')
      .optional()
      .matches(/^\d{3}-?\d{4}$/).withMessage('郵便番号の形式が正しくありません'),
    body('phone')
      .optional()
      .matches(/^[\d-]+$/).withMessage('電話番号は数字とハイフンのみ使用できます'),
    body('fax')
      .optional()
      .matches(/^[\d-]+$/).withMessage('FAX番号は数字とハイフンのみ使用できます'),
    body('email')
      .optional()
      .isEmail().withMessage('メールアドレスの形式が正しくありません'),
    body('contactEmail')
      .optional()
      .isEmail().withMessage('担当者メールアドレスの形式が正しくありません'),
    body('website')
      .optional()
      .isURL().withMessage('WebサイトURLの形式が正しくありません'),
    body('monthlyFee')
      .optional()
      .isInt({ min: 0 }).withMessage('月額料金は0以上の整数で入力してください'),
    body('contractStartDate')
      .optional()
      .isISO8601().withMessage('契約開始日の形式が正しくありません'),
    body('contractEndDate')
      .optional()
      .isISO8601().withMessage('契約終了日の形式が正しくありません')
      .custom((value, { req }) => {
        if (value && req.body.contractStartDate) {
          return new Date(value) >= new Date(req.body.contractStartDate);
        }
        return true;
      }).withMessage('契約終了日は契約開始日より後の日付を指定してください'),
    handleValidationErrors
  ],

  // 更新時のバリデーション
  update: [
    param('id')
      .isNumeric().withMessage('IDは数値で指定してください'),
    body('companyName')
      .optional()
      .notEmpty().withMessage('会社名を空にすることはできません')
      .isLength({ max: 100 }).withMessage('会社名は100文字以内で入力してください'),
    body('companyNameKana')
      .optional()
      .matches(/^[ァ-ヶー\s]+$/).withMessage('会社名カナは全角カタカナで入力してください')
      .isLength({ max: 100 }).withMessage('会社名カナは100文字以内で入力してください'),
    body('postalCode')
      .optional()
      .matches(/^\d{3}-?\d{4}$/).withMessage('郵便番号の形式が正しくありません'),
    body('phone')
      .optional()
      .matches(/^[\d-]+$/).withMessage('電話番号は数字とハイフンのみ使用できます'),
    body('fax')
      .optional()
      .matches(/^[\d-]+$/).withMessage('FAX番号は数字とハイフンのみ使用できます'),
    body('email')
      .optional()
      .isEmail().withMessage('メールアドレスの形式が正しくありません'),
    body('contactEmail')
      .optional()
      .isEmail().withMessage('担当者メールアドレスの形式が正しくありません'),
    body('website')
      .optional()
      .isURL().withMessage('WebサイトURLの形式が正しくありません'),
    body('monthlyFee')
      .optional()
      .isInt({ min: 0 }).withMessage('月額料金は0以上の整数で入力してください'),
    handleValidationErrors
  ],

  // ID パラメータのバリデーション
  idParam: [
    param('id')
      .isNumeric().withMessage('IDは数値で指定してください'),
    handleValidationErrors
  ],

  // 一覧取得時のクエリバリデーション
  list: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('ページ番号は1以上の整数で指定してください'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('表示件数は1〜100の範囲で指定してください'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'companyName', 'contractStartDate'])
      .withMessage('ソート項目が正しくありません'),
    query('order')
      .optional()
      .isIn(['asc', 'desc']).withMessage('ソート順序はascまたはdescで指定してください'),
    query('status')
      .optional()
      .isIn(['active', 'inactive']).withMessage('ステータスはactiveまたはinactiveで指定してください'),
    handleValidationErrors
  ],

  // ステータス変更のバリデーション
  updateStatus: [
    param('id')
      .isNumeric().withMessage('IDは数値で指定してください'),
    body('isActive')
      .notEmpty().withMessage('ステータスは必須です')
      .isBoolean().withMessage('ステータスはtrue/falseで指定してください'),
    handleValidationErrors
  ]
};

/**
 * 取引先ユーザーバリデーションルール
 */
export const clientUserValidation = {
  // 作成時のバリデーション
  create: [
    body('businessPartnerId')
      .notEmpty().withMessage('取引先企業IDは必須です')
      .isNumeric().withMessage('取引先企業IDは数値で指定してください'),
    body('email')
      .notEmpty().withMessage('メールアドレスは必須です')
      .isEmail().withMessage('メールアドレスの形式が正しくありません'),
    body('password')
      .notEmpty().withMessage('パスワードは必須です')
      .isLength({ min: 8 }).withMessage('パスワードは8文字以上で入力してください')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('パスワードは英大文字・小文字・数字を含む必要があります'),
    body('name')
      .notEmpty().withMessage('氏名は必須です')
      .isLength({ max: 50 }).withMessage('氏名は50文字以内で入力してください'),
    body('department')
      .optional()
      .isLength({ max: 50 }).withMessage('部署名は50文字以内で入力してください'),
    body('position')
      .optional()
      .isLength({ max: 50 }).withMessage('役職は50文字以内で入力してください'),
    body('phone')
      .optional()
      .matches(/^[\d-]+$/).withMessage('電話番号は数字とハイフンのみ使用できます'),
    handleValidationErrors
  ],

  // 更新時のバリデーション
  update: [
    param('id')
      .isNumeric().withMessage('IDは数値で指定してください'),
    body('email')
      .optional()
      .isEmail().withMessage('メールアドレスの形式が正しくありません'),
    body('name')
      .optional()
      .notEmpty().withMessage('氏名を空にすることはできません')
      .isLength({ max: 50 }).withMessage('氏名は50文字以内で入力してください'),
    body('department')
      .optional()
      .isLength({ max: 50 }).withMessage('部署名は50文字以内で入力してください'),
    body('position')
      .optional()
      .isLength({ max: 50 }).withMessage('役職は50文字以内で入力してください'),
    body('phone')
      .optional()
      .matches(/^[\d-]+$/).withMessage('電話番号は数字とハイフンのみ使用できます'),
    handleValidationErrors
  ]
};

/**
 * アクセス権限バリデーションルール
 */
export const accessControlValidation = {
  // エンジニア権限設定
  setEngineerPermissions: [
    param('id')
      .isNumeric().withMessage('取引先企業IDは数値で指定してください'),
    body('engineerIds')
      .isArray().withMessage('エンジニアIDは配列で指定してください'),
    body('engineerIds.*')
      .isNumeric().withMessage('エンジニアIDは数値で指定してください'),
    body('viewType')
      .notEmpty().withMessage('表示タイプは必須です')
      .isIn(['all', 'waiting', 'custom']).withMessage('表示タイプが正しくありません'),
    handleValidationErrors
  ],

  // NGリスト追加
  addToNgList: [
    param('id')
      .isNumeric().withMessage('取引先企業IDは数値で指定してください'),
    body('engineerId')
      .notEmpty().withMessage('エンジニアIDは必須です')
      .isNumeric().withMessage('エンジニアIDは数値で指定してください'),
    body('reason')
      .optional()
      .isLength({ max: 500 }).withMessage('理由は500文字以内で入力してください'),
    handleValidationErrors
  ],

  // NGリスト削除
  removeFromNgList: [
    param('id')
      .isNumeric().withMessage('取引先企業IDは数値で指定してください'),
    param('engineerId')
      .isNumeric().withMessage('エンジニアIDは数値で指定してください'),
    handleValidationErrors
  ]
};
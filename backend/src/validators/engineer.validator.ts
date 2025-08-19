import { body, param, query } from 'express-validator';

export const engineerValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('氏名は必須です')
      .isString().withMessage('氏名は文字列で入力してください')
      .isLength({ max: 100 }).withMessage('氏名は100文字以内で入力してください'),
    body('email')
      .notEmpty().withMessage('メールアドレスは必須です')
      .isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('phone')
      .optional()
      .matches(/^[0-9-]+$/).withMessage('電話番号は数字とハイフンのみ入力可能です'),
    body('birthDate')
      .optional()
      .isISO8601().withMessage('生年月日は有効な日付形式で入力してください'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other']).withMessage('性別の値が不正です'),
    body('nearestStation')
      .optional()
      .isString().withMessage('最寄り駅は文字列で入力してください'),
    body('engineerType')
      .optional()
      .isIn(['employee', 'freelance']).withMessage('エンジニア種別の値が不正です'),
    body('status')
      .optional()
      .isIn(['waiting', 'assigned', 'upcoming', 'inactive']).withMessage('ステータスの値が不正です'),
  ],

  update: [
    param('id').isInt().withMessage('エンジニアIDは整数で指定してください'),
    body('name')
      .optional()
      .isString().withMessage('氏名は文字列で入力してください')
      .isLength({ max: 100 }).withMessage('氏名は100文字以内で入力してください'),
    body('email')
      .optional()
      .isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('phone')
      .optional()
      .matches(/^[0-9-]+$/).withMessage('電話番号は数字とハイフンのみ入力可能です'),
    body('birthDate')
      .optional()
      .isISO8601().withMessage('生年月日は有効な日付形式で入力してください'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other']).withMessage('性別の値が不正です'),
    body('nearestStation')
      .optional()
      .isString().withMessage('最寄り駅は文字列で入力してください'),
  ],

  updateStatus: [
    param('id').isInt().withMessage('エンジニアIDは整数で指定してください'),
    body('status')
      .notEmpty().withMessage('ステータスは必須です')
      .isIn(['waiting', 'assigned', 'upcoming', 'inactive']).withMessage('ステータスの値が不正です'),
  ],

  updateAvailability: [
    param('id').isInt().withMessage('エンジニアIDは整数で指定してください'),
    body('availableDate')
      .notEmpty().withMessage('稼働可能日は必須です')
      .isISO8601().withMessage('稼働可能日は有効な日付形式で入力してください'),
  ],

  updatePublicStatus: [
    param('id').isInt().withMessage('エンジニアIDは整数で指定してください'),
    body('isPublic')
      .notEmpty().withMessage('公開状態は必須です')
      .isBoolean().withMessage('公開状態は真偽値で指定してください'),
  ],

  skillSheet: [
    param('id').isInt().withMessage('エンジニアIDは整数で指定してください'),
    body('summary')
      .optional()
      .isString().withMessage('概要は文字列で入力してください')
      .isLength({ max: 2000 }).withMessage('概要は2000文字以内で入力してください'),
    body('totalExperienceYears')
      .optional()
      .isInt({ min: 0, max: 50 }).withMessage('総経験年数は0〜50の整数で入力してください'),
    body('programmingLanguages')
      .optional()
      .isArray().withMessage('プログラミング言語は配列で指定してください'),
    body('frameworks')
      .optional()
      .isArray().withMessage('フレームワークは配列で指定してください'),
    body('databases')
      .optional()
      .isArray().withMessage('データベースは配列で指定してください'),
    body('cloudServices')
      .optional()
      .isArray().withMessage('クラウドサービスは配列で指定してください'),
    body('tools')
      .optional()
      .isArray().withMessage('開発ツールは配列で指定してください'),
    body('certifications')
      .optional()
      .isArray().withMessage('資格・認定は配列で指定してください'),
    body('possibleRoles')
      .optional()
      .isArray().withMessage('対応可能ロールは配列で指定してください'),
    body('possiblePhases')
      .optional()
      .isArray().withMessage('対応可能フェーズは配列で指定してください'),
  ],

  bulkUpdateStatus: [
    body('engineerIds')
      .notEmpty().withMessage('エンジニアIDリストは必須です')
      .isArray().withMessage('エンジニアIDリストは配列で指定してください')
      .custom((value) => value.every((id: any) => Number.isInteger(id)))
      .withMessage('エンジニアIDは整数の配列で指定してください'),
    body('status')
      .notEmpty().withMessage('ステータスは必須です')
      .isIn(['waiting', 'assigned', 'upcoming', 'inactive']).withMessage('ステータスの値が不正です'),
  ],

  bulkExport: [
    body('engineerIds')
      .notEmpty().withMessage('エンジニアIDリストは必須です')
      .isArray().withMessage('エンジニアIDリストは配列で指定してください')
      .custom((value) => value.every((id: any) => Number.isInteger(id)))
      .withMessage('エンジニアIDは整数の配列で指定してください'),
    body('format')
      .optional()
      .isIn(['csv', 'excel', 'pdf']).withMessage('エクスポート形式の値が不正です'),
  ],
};
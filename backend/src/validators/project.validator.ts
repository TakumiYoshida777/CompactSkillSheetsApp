import { body, param, query } from 'express-validator';

export const projectValidation = {
  create: [
    body('name')
      .notEmpty().withMessage('プロジェクト名は必須です')
      .isString().withMessage('プロジェクト名は文字列で入力してください')
      .isLength({ max: 255 }).withMessage('プロジェクト名は255文字以内で入力してください'),
    body('clientCompany')
      .optional()
      .isString().withMessage('クライアント企業名は文字列で入力してください'),
    body('startDate')
      .notEmpty().withMessage('開始日は必須です')
      .isISO8601().withMessage('開始日は有効な日付形式で入力してください'),
    body('endDate')
      .optional()
      .isISO8601().withMessage('終了日は有効な日付形式で入力してください')
      .custom((value, { req }) => {
        if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
          throw new Error('終了日は開始日以降の日付を指定してください');
        }
        return true;
      }),
    body('plannedEndDate')
      .optional()
      .isISO8601().withMessage('終了予定日は有効な日付形式で入力してください'),
    body('projectScale')
      .optional()
      .isIn(['small', 'medium', 'large']).withMessage('プロジェクト規模の値が不正です'),
    body('industry')
      .optional()
      .isString().withMessage('業界は文字列で入力してください'),
    body('businessType')
      .optional()
      .isString().withMessage('業務種別は文字列で入力してください'),
    body('developmentMethodology')
      .optional()
      .isString().withMessage('開発手法は文字列で入力してください'),
    body('teamSize')
      .optional()
      .isInt({ min: 1, max: 1000 }).withMessage('チームサイズは1〜1000の整数で入力してください'),
    body('description')
      .optional()
      .isString().withMessage('説明は文字列で入力してください'),
  ],

  update: [
    param('id').isInt().withMessage('プロジェクトIDは整数で指定してください'),
    body('name')
      .optional()
      .isString().withMessage('プロジェクト名は文字列で入力してください')
      .isLength({ max: 255 }).withMessage('プロジェクト名は255文字以内で入力してください'),
    body('clientCompany')
      .optional()
      .isString().withMessage('クライアント企業名は文字列で入力してください'),
    body('startDate')
      .optional()
      .isISO8601().withMessage('開始日は有効な日付形式で入力してください'),
    body('endDate')
      .optional()
      .isISO8601().withMessage('終了日は有効な日付形式で入力してください')
      .custom((value, { req }) => {
        if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
          throw new Error('終了日は開始日以降の日付を指定してください');
        }
        return true;
      }),
    body('plannedEndDate')
      .optional()
      .isISO8601().withMessage('終了予定日は有効な日付形式で入力してください'),
    body('projectScale')
      .optional()
      .isIn(['small', 'medium', 'large']).withMessage('プロジェクト規模の値が不正です'),
    body('teamSize')
      .optional()
      .isInt({ min: 1, max: 1000 }).withMessage('チームサイズは1〜1000の整数で入力してください'),
  ],

  updateStatus: [
    param('id').isInt().withMessage('プロジェクトIDは整数で指定してください'),
    body('status')
      .notEmpty().withMessage('ステータスは必須です')
      .isIn(['planning', 'active', 'completed', 'cancelled']).withMessage('ステータスの値が不正です'),
  ],

  createAssignment: [
    param('id').isInt().withMessage('プロジェクトIDは整数で指定してください'),
    body('engineerId')
      .notEmpty().withMessage('エンジニアIDは必須です')
      .isInt().withMessage('エンジニアIDは整数で指定してください'),
    body('role')
      .notEmpty().withMessage('役割は必須です')
      .isString().withMessage('役割は文字列で入力してください'),
    body('startDate')
      .notEmpty().withMessage('開始日は必須です')
      .isISO8601().withMessage('開始日は有効な日付形式で入力してください'),
    body('endDate')
      .optional()
      .isISO8601().withMessage('終了日は有効な日付形式で入力してください')
      .custom((value, { req }) => {
        if (value && req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
          throw new Error('終了日は開始日以降の日付を指定してください');
        }
        return true;
      }),
    body('allocationPercentage')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('稼働率は1〜100の整数で入力してください'),
  ],

  updateAssignment: [
    param('id').isInt().withMessage('プロジェクトIDは整数で指定してください'),
    param('assignmentId').isInt().withMessage('アサインメントIDは整数で指定してください'),
    body('role')
      .optional()
      .isString().withMessage('役割は文字列で入力してください'),
    body('startDate')
      .optional()
      .isISO8601().withMessage('開始日は有効な日付形式で入力してください'),
    body('endDate')
      .optional()
      .isISO8601().withMessage('終了日は有効な日付形式で入力してください'),
    body('allocationPercentage')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('稼働率は1〜100の整数で入力してください'),
  ],
};
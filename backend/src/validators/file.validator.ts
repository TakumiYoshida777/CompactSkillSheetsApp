import { body, param, query } from 'express-validator';

export const fileValidation = {
  upload: [
    body('filename').optional().isString().withMessage('ファイル名は文字列である必要があります'),
    body('description').optional().isString().withMessage('説明は文字列である必要があります'),
    body('tags').optional().isArray().withMessage('タグは配列である必要があります'),
  ],

  uploadMultiple: [
    body('files').optional().isArray().withMessage('ファイルは配列である必要があります'),
    body('descriptions').optional().isArray().withMessage('説明は配列である必要があります'),
  ],

  update: [
    param('id').isInt().withMessage('IDは整数である必要があります'),
    body('filename').optional().isString().withMessage('ファイル名は文字列である必要があります'),
    body('description').optional().isString().withMessage('説明は文字列である必要があります'),
    body('tags').optional().isArray().withMessage('タグは配列である必要があります'),
  ],

  bulkDelete: [
    body('ids').isArray().withMessage('IDは配列である必要があります'),
    body('ids.*').isInt().withMessage('各IDは整数である必要があります'),
  ],

  resize: [
    param('id').isInt().withMessage('IDは整数である必要があります'),
    body('width').isInt({ min: 1, max: 5000 }).withMessage('幅は1〜5000の整数である必要があります'),
    body('height').isInt({ min: 1, max: 5000 }).withMessage('高さは1〜5000の整数である必要があります'),
    body('quality').optional().isInt({ min: 1, max: 100 }).withMessage('品質は1〜100の整数である必要があります'),
  ],

  addTags: [
    param('id').isInt().withMessage('IDは整数である必要があります'),
    body('tags').isArray().withMessage('タグは配列である必要があります'),
    body('tags.*').isString().withMessage('各タグは文字列である必要があります'),
  ],

  share: [
    param('id').isInt().withMessage('IDは整数である必要があります'),
    body('expiresAt').optional().isISO8601().withMessage('有効期限は有効な日時である必要があります'),
    body('maxDownloads').optional().isInt({ min: 1 }).withMessage('最大ダウンロード数は1以上の整数である必要があります'),
    body('password').optional().isString().withMessage('パスワードは文字列である必要があります'),
  ],
};
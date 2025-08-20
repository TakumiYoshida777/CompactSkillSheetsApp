import { Router } from 'express';
import { FileController } from '../../controllers/file.controller';
import { fileValidation } from '../../validators/file.validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { companyMiddleware } from '../../middleware/company.middleware';
import { uploadMiddleware } from '../../middleware/upload.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';

const router = Router();
const controller = new FileController();

// 認証とマルチテナント対応のミドルウェアを適用 
router.use(authMiddleware);
router.use(companyMiddleware);

// ファイルアップロード
router.post('/upload', uploadMiddleware.single('file'), ...fileValidation.upload, controller.uploadFile);
router.post('/upload/multiple', uploadMiddleware.array('files', 10), ...fileValidation.uploadMultiple, controller.uploadMultipleFiles);

// ファイル一覧・詳細
router.get('/', paginationMiddleware, controller.getFiles);
router.get('/:id', controller.getFileById);
router.get('/:id/download', controller.downloadFile);

// ファイル管理
router.put('/:id', ...fileValidation.update, controller.updateFile);
router.delete('/:id', controller.deleteFile);
router.post('/bulk-delete', ...fileValidation.bulkDelete, controller.bulkDeleteFiles);

// 画像処理
router.get('/:id/thumbnail', controller.getThumbnail);
router.post('/:id/resize', ...fileValidation.resize, controller.resizeImage);

// ファイルタグ管理
router.get('/:id/tags', controller.getFileTags);
router.post('/:id/tags', ...fileValidation.addTags, controller.addFileTags);
router.delete('/:id/tags/:tagId', controller.removeFileTag);

// ファイル共有
router.post('/:id/share', ...fileValidation.share, controller.createShareLink);
router.get('/shared/:token', controller.getSharedFile);
router.delete('/:id/share/:shareId', controller.deleteShareLink);

// ストレージ情報
router.get('/storage/info', controller.getStorageInfo);
router.get('/storage/usage', controller.getStorageUsage);

export default router;
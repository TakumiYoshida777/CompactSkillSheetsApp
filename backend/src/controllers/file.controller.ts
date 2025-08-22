import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.util';
import logger from '../config/logger';
import path from 'path';
import fs from 'fs';
import { deleteUploadedFile, getUploadPath, fileExists } from '../middleware/upload.middleware';

export class FileController {
  // ファイルアップロード
  uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json(ApiResponse.error('FILE_REQUIRED', 'ファイルが指定されていません'));
      }

      const fileData = {
        id: Date.now(),
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        companyId: req.companyId,
        uploadedAt: new Date(),
        description: req.body.description || null,
        tags: req.body.tags || []
      };

      res.status(201).json(ApiResponse.created(fileData, 'ファイルがアップロードされました'));
    } catch (error) {
      logger.error('ファイルアップロードエラー:', error);
      next(error);
    }
  };

  // 複数ファイルアップロード
  uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json(ApiResponse.error('FILES_REQUIRED', 'ファイルが指定されていません'));
      }

      const uploadedFiles = req.files.map((file, index) => ({
        id: Date.now() + index,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        companyId: req.companyId,
        uploadedAt: new Date(),
        description: req.body.descriptions?.[index] || null
      }));

      res.status(201).json(ApiResponse.created(uploadedFiles, `${uploadedFiles.length}個のファイルがアップロードされました`));
    } catch (error) {
      logger.error('複数ファイルアップロードエラー:', error);
      next(error);
    }
  };

  // ファイル一覧取得
  getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20 } = req.pagination || {};
      
      // ダミーデータ
      const files = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        filename: `file_${i + 1}.pdf`,
        originalName: `ドキュメント${i + 1}.pdf`,
        mimetype: 'application/pdf',
        size: Math.floor(Math.random() * 10000000),
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        description: `ファイル${i + 1}の説明`,
        tags: ['ドキュメント', 'PDF']
      }));

      res.json(ApiResponse.paginated(files, { page, limit, total: files.length }));
    } catch (error) {
      logger.error('ファイル一覧取得エラー:', error);
      next(error);
    }
  };

  // ファイル詳細取得
  getFileById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const file = {
        id: parseInt(id),
        filename: 'document.pdf',
        originalName: 'スキルシート.pdf',
        mimetype: 'application/pdf',
        size: 2048576,
        uploadedAt: new Date(),
        description: 'エンジニアスキルシート',
        tags: ['スキルシート', 'PDF'],
        downloadUrl: `/api/v1/files/${id}/download`
      };

      res.json(ApiResponse.success(file));
    } catch (error) {
      logger.error('ファイル詳細取得エラー:', error);
      next(error);
    }
  };

  // ファイルダウンロード
  downloadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // 実際の実装では、データベースからファイル情報を取得
      const filePath = getUploadPath(req.companyId || 'default', 'sample.pdf');
      
      if (!fileExists(filePath)) {
        return res.status(404).json(ApiResponse.notFound('ファイル'));
      }

      res.download(filePath);
    } catch (error) {
      logger.error('ファイルダウンロードエラー:', error);
      next(error);
    }
  };

  // ファイル更新
  updateFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { filename, description, tags } = req.body;

      const updatedFile = {
        id: parseInt(id),
        filename: filename || 'updated_file.pdf',
        description,
        tags,
        updatedAt: new Date()
      };

      res.json(ApiResponse.updated(updatedFile));
    } catch (error) {
      logger.error('ファイル更新エラー:', error);
      next(error);
    }
  };

  // ファイル削除
  deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // 実際の実装では、データベースからファイル情報を取得して削除
      res.json(ApiResponse.deleted(`ファイルID: ${id}が削除されました`));
    } catch (error) {
      logger.error('ファイル削除エラー:', error);
      next(error);
    }
  };

  // 複数ファイル削除
  bulkDeleteFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json(ApiResponse.error('IDS_REQUIRED', '削除するファイルIDを指定してください'));
      }

      res.json(ApiResponse.deleted(`${ids.length}個のファイルが削除されました`));
    } catch (error) {
      logger.error('複数ファイル削除エラー:', error);
      next(error);
    }
  };

  // サムネイル取得
  getThumbnail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      // 実際の実装では、画像のサムネイルを生成して返す
      res.json(ApiResponse.success({
        id: parseInt(id),
        thumbnailUrl: `/api/v1/files/${id}/thumbnail.jpg`,
        width: 200,
        height: 200
      }));
    } catch (error) {
      logger.error('サムネイル取得エラー:', error);
      next(error);
    }
  };

  // 画像リサイズ
  resizeImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { width, height, quality } = req.body;

      const resizedImage = {
        id: parseInt(id),
        width,
        height,
        quality: quality || 85,
        url: `/api/v1/files/${id}/resized.jpg`
      };

      res.json(ApiResponse.success(resizedImage));
    } catch (error) {
      logger.error('画像リサイズエラー:', error);
      next(error);
    }
  };

  // ファイルタグ取得
  getFileTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const tags = [
        { id: 1, name: 'ドキュメント' },
        { id: 2, name: 'スキルシート' },
        { id: 3, name: '重要' }
      ];

      res.json(ApiResponse.success(tags));
    } catch (error) {
      logger.error('ファイルタグ取得エラー:', error);
      next(error);
    }
  };

  // ファイルタグ追加
  addFileTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { tags } = req.body;

      if (!tags || !Array.isArray(tags)) {
        return res.status(400).json(ApiResponse.error('TAGS_REQUIRED', 'タグを指定してください'));
      }

      res.json(ApiResponse.created({
        fileId: parseInt(id),
        tags,
        addedAt: new Date()
      }));
    } catch (error) {
      logger.error('ファイルタグ追加エラー:', error);
      next(error);
    }
  };

  // ファイルタグ削除
  removeFileTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, tagId } = req.params;
      
      res.json(ApiResponse.deleted(`ファイルID: ${id}からタグID: ${tagId}が削除されました`));
    } catch (error) {
      logger.error('ファイルタグ削除エラー:', error);
      next(error);
    }
  };

  // 共有リンク作成
  createShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { expiresAt, maxDownloads, password } = req.body;

      const shareLink = {
        id: Date.now(),
        fileId: parseInt(id),
        token: Math.random().toString(36).substring(2, 15),
        url: `${process.env.FRONTEND_URL}/shared/${Math.random().toString(36).substring(2, 15)}`,
        expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxDownloads: maxDownloads || null,
        hasPassword: !!password,
        createdAt: new Date()
      };

      res.status(201).json(ApiResponse.created(shareLink, '共有リンクが作成されました'));
    } catch (error) {
      logger.error('共有リンク作成エラー:', error);
      next(error);
    }
  };

  // 共有ファイル取得
  getSharedFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      
      const sharedFile = {
        filename: 'shared_document.pdf',
        size: 1024576,
        downloadUrl: `/api/v1/files/shared/${token}/download`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      res.json(ApiResponse.success(sharedFile));
    } catch (error) {
      logger.error('共有ファイル取得エラー:', error);
      next(error);
    }
  };

  // 共有リンク削除
  deleteShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, shareId } = req.params;
      
      res.json(ApiResponse.deleted(`ファイルID: ${id}の共有リンクID: ${shareId}が削除されました`));
    } catch (error) {
      logger.error('共有リンク削除エラー:', error);
      next(error);
    }
  };

  // ストレージ情報取得
  getStorageInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const storageInfo = {
        totalSpace: 10737418240, // 10GB
        usedSpace: 2147483648,   // 2GB
        freeSpace: 8589934592,   // 8GB
        fileCount: 150,
        companyId: req.companyId
      };

      res.json(ApiResponse.success(storageInfo));
    } catch (error) {
      logger.error('ストレージ情報取得エラー:', error);
      next(error);
    }
  };

  // ストレージ使用状況取得
  getStorageUsage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usage = {
        byFileType: [
          { type: 'PDF', count: 50, size: 524288000 },
          { type: 'Image', count: 80, size: 1073741824 },
          { type: 'Document', count: 20, size: 209715200 }
        ],
        byMonth: [
          { month: '2024-01', count: 30, size: 314572800 },
          { month: '2024-02', count: 45, size: 471859200 },
          { month: '2024-03', count: 75, size: 786432000 }
        ],
        topFiles: [
          { id: 1, name: 'large_file.pdf', size: 52428800 },
          { id: 2, name: 'presentation.pptx', size: 31457280 },
          { id: 3, name: 'dataset.csv', size: 20971520 }
        ]
      };

      res.json(ApiResponse.success(usage));
    } catch (error) {
      logger.error('ストレージ使用状況取得エラー:', error);
      next(error);
    }
  };
}
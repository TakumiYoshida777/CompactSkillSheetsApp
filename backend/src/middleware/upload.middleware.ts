import { errorLog } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// アップロードディレクトリの設定
const uploadDir = path.join(process.cwd(), 'uploads');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ストレージ設定
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // 企業IDごとにディレクトリを分ける
    const companyId = req.companyId || 'default';
    const companyDir = path.join(uploadDir, companyId.toString());
    
    if (!fs.existsSync(companyDir)) {
      fs.mkdirSync(companyDir, { recursive: true });
    }
    
    cb(null, companyDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // ファイル名の生成（タイムスタンプ + オリジナル名）
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const safeFileName = `${timestamp}-${name}${ext}`.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    cb(null, safeFileName);
  }
});

// ファイルフィルター
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 許可するファイルタイプ
  const allowedMimeTypes = [
    // 画像
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // ドキュメント
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // テキスト
    'text/plain',
    'text/csv',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    // アーカイブ
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`サポートされていないファイルタイプです: ${file.mimetype}`));
  }
};

// ファイルサイズ制限（環境変数から取得、デフォルト10MB）
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

// Multer設定
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 10, // 最大10ファイル同時アップロード
  }
});

// エクスポート
export const uploadMiddleware = {
  single: (fieldName: string = 'file') => upload.single(fieldName),
  array: (fieldName: string = 'files', maxCount: number = 10) => upload.array(fieldName, maxCount),
  fields: (fields: multer.Field[]) => upload.fields(fields),
  none: () => upload.none(),
  any: () => upload.any(),
};

// ファイル削除ヘルパー関数
export const deleteUploadedFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    errorLog('ファイル削除エラー:', error);
    throw error;
  }
};

// ファイルパス取得ヘルパー関数
export const getUploadPath = (companyId: string | number, filename: string): string => {
  return path.join(uploadDir, companyId.toString(), filename);
};

// ファイル存在確認ヘルパー関数
export const fileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};
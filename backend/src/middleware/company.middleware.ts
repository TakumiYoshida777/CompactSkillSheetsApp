import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response.util';

/**
 * 企業IDミドルウェア
 * X-Company-IDヘッダーから企業IDを取得し、リクエストオブジェクトに設定
 */
export const companyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // X-Company-IDヘッダーから企業IDを取得
  const companyId = req.headers['x-company-id'] as string;
  
  // JWTトークンから企業IDを取得する場合（認証済みユーザー）
  const tokenCompanyId = (req as any).user?.companyId;
  
  // 企業IDの決定（ヘッダー優先、なければトークンから）
  const finalCompanyId = companyId || tokenCompanyId;
  
  if (!finalCompanyId) {
    res.status(400).json(
      ApiResponse.error('COMPANY_ID_REQUIRED', '企業IDが指定されていません')
    );
    return;
  }
  
  // リクエストオブジェクトに企業IDを設定
  req.companyId = finalCompanyId;
  next();
};

/**
 * オプショナル企業IDミドルウェア
 * 企業IDが必須でないエンドポイント用
 */
export const optionalCompanyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const companyId = req.headers['x-company-id'] as string;
  const tokenCompanyId = (req as any).user?.companyId;
  
  req.companyId = companyId || tokenCompanyId;
  next();
};

/**
 * 企業ID検証ミドルウェア
 * 企業IDが数値であることを検証
 */
export const validateCompanyId = (req: Request, res: Response, next: NextFunction): void => {
  if (req.companyId && isNaN(Number(req.companyId))) {
    res.status(400).json(
      ApiResponse.error('INVALID_COMPANY_ID', '企業IDが不正です')
    );
    return;
  }
  next();
};
/**
 * コントローラー層の型定義
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationErrorDetail } from './common.types';

/**
 * 認証済みユーザー情報
 */
export interface AuthUser {
  userId: string;
  companyId: string;
  role?: string;
  email?: string;
  name?: string;
}

/**
 * 認証済みリクエスト
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  pagination?: {
    page: number;
    limit: number;
    offset: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  filters?: Record<string, string | number | boolean | Date | undefined | null>;
}

/**
 * コントローラーのレスポンス型
 */
export type ControllerResponse = Response;

/**
 * コントローラーのNextFunction型
 */
export type ControllerNext = NextFunction;

/**
 * 非同期コントローラーハンドラー
 */
export type AsyncController = (
  req: AuthenticatedRequest,
  res: ControllerResponse,
  next: ControllerNext
) => Promise<void | Response>;

/**
 * 同期コントローラーハンドラー
 */
export type SyncController = (
  req: AuthenticatedRequest,
  res: ControllerResponse,
  next: ControllerNext
) => void | Response;

/**
 * コントローラーハンドラー
 */
export type Controller = AsyncController | SyncController;

/**
 * バリデーション結果
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationErrorDetail[];
}

/**
 * ログイン用リクエストボディ
 */
export interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * ユーザー登録用リクエストボディ
 */
export interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  companyId?: string;
}

/**
 * パスワード変更用リクエストボディ
 */
export interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

/**
 * トークンリフレッシュ用リクエストボディ
 */
export interface RefreshTokenRequestBody {
  refreshToken: string;
}

/**
 * ページネーションクエリパラメータ
 */
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 検索クエリパラメータ
 */
export interface SearchQuery extends PaginationQuery {
  search?: string;
  [key: string]: string | undefined;
}

/**
 * IDパラメータ
 */
export interface IdParams {
  id: string;
}

/**
 * 企業IDパラメータ
 */
export interface CompanyIdParams {
  companyId: string;
}

/**
 * エンジニアIDパラメータ
 */
export interface EngineerIdParams {
  engineerId: string;
}

/**
 * プロジェクトIDパラメータ
 */
export interface ProjectIdParams {
  projectId: string;
}

/**
 * オファーIDパラメータ
 */
export interface OfferIdParams {
  offerId: string;
}

/**
 * ビジネスパートナーIDパラメータ
 */
export interface PartnerIdParams {
  partnerId: string;
}

/**
 * アプローチIDパラメータ
 */
export interface ApproachIdParams {
  approachId: string;
}

/**
 * コントローラーメソッドのレスポンス型
 */
export interface ControllerMethodResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    [key: string]: unknown;
  };
}
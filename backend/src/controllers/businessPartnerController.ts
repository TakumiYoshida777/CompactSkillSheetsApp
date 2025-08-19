import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { BusinessPartnerService } from '../services/businessPartnerService';
import { ApiResponse } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();
const partnerService = new BusinessPartnerService(prisma);

export const businessPartnerController = {
  /**
   * 取引先一覧を取得
   */
  getPartners: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);
    const options = {
      pagination: req.pagination,
      sort: req.sort,
      filters: req.filters
    };

    const result = await partnerService.getPartners(companyId, options);
    
    res.json(ApiResponse.paginated(result.data, {
      page: req.pagination!.page,
      limit: req.pagination!.limit,
      total: result.total
    }));
  }),

  /**
   * 取引先詳細を取得
   */
  getPartnerById: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);

    const partner = await partnerService.getPartnerById(partnerId, companyId);
    
    res.json(ApiResponse.success(partner));
  }),

  /**
   * 取引先を作成
   */
  createPartner: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);
    const userId = (req as any).user?.id || 1; // 認証から取得

    const partner = await partnerService.createPartner(companyId, userId, req.body);
    
    res.status(201).json(ApiResponse.created(partner, '取引先が正常に作成されました'));
  }),

  /**
   * 取引先を更新
   */
  updatePartner: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);
    const userId = (req as any).user?.id || 1;

    const updatedData = {
      ...req.body,
      updatedBy: userId
    };

    const partner = await partnerService.updatePartner(partnerId, companyId, updatedData);
    
    res.json(ApiResponse.updated(partner, '取引先が正常に更新されました'));
  }),

  /**
   * アクセス権限を更新
   */
  updateAccessPermissions: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);
    const userId = (req as any).user?.id || 1;
    const { engineerIds } = req.body;

    const result = await partnerService.updateAccessPermissions(
      partnerId, 
      companyId, 
      engineerIds, 
      userId
    );
    
    res.json(ApiResponse.success(result, 'アクセス権限が更新されました'));
  }),

  /**
   * 取引先ユーザーを作成
   */
  createClientUser: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);

    const user = await partnerService.createClientUser(partnerId, companyId, req.body);
    
    res.status(201).json(ApiResponse.created(user, '取引先ユーザーが作成されました'));
  }),

  /**
   * 取引先ユーザーを更新
   */
  updateClientUser: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    const companyId = parseInt(req.companyId!);

    const user = await partnerService.updateClientUser(userId, partnerId, companyId, req.body);
    
    res.json(ApiResponse.updated(user, '取引先ユーザーが更新されました'));
  }),

  /**
   * 取引先ユーザーを削除
   */
  deleteClientUser: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    const companyId = parseInt(req.companyId!);

    const result = await partnerService.deleteClientUser(userId, partnerId, companyId);
    
    res.json(ApiResponse.deleted('取引先ユーザーが削除されました'));
  }),

  /**
   * アクセスURLを再生成
   */
  regenerateAccessUrl: asyncHandler(async (req: Request, res: Response) => {
    const partnerId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);

    const partner = await partnerService.regenerateAccessUrl(partnerId, companyId);
    
    res.json(ApiResponse.success(partner, 'アクセスURLが再生成されました'));
  }),

  /**
   * 取引先統計を取得
   */
  getPartnerStats: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);

    const stats = await partnerService.getPartnerStats(companyId);
    
    res.json(ApiResponse.success(stats));
  }),

  /**
   * URLトークンから取引先情報を取得（クライアント用）
   */
  getPartnerByUrlToken: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    const partner = await partnerService.getPartnerByUrlToken(token);
    
    res.json(ApiResponse.success(partner));
  })
};
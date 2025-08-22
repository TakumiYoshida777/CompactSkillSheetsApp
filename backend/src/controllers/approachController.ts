import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApproachService } from '../services/approachService';
import { ApiResponse } from '../utils/response.util';
import { asyncHandler } from '../middleware/error.middleware';

const prisma = new PrismaClient();
const approachService = new ApproachService(prisma);

export const approachController = {
  /**
   * 送信済みアプローチ一覧を取得
   */
  getSentApproaches: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);
    const options = {
      pagination: req.pagination,
      sort: req.sort,
      filters: req.filters
    };

    const result = await approachService.getSentApproaches(companyId, options);
    
    res.json(ApiResponse.paginated(result.data, {
      page: req.pagination!.page,
      limit: req.pagination!.limit,
      total: result.total
    }));
  }),

  /**
   * 受信済みアプローチ一覧を取得
   */
  getReceivedApproaches: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);
    const options = {
      pagination: req.pagination,
      sort: req.sort,
      filters: req.filters
    };

    const result = await approachService.getReceivedApproaches(companyId, options);
    
    res.json(ApiResponse.paginated(result.data, {
      page: req.pagination!.page,
      limit: req.pagination!.limit,
      total: result.total
    }));
  }),

  /**
   * アプローチ詳細を取得
   */
  getApproachById: asyncHandler(async (req: Request, res: Response) => {
    const approachId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);

    const approach = await approachService.getApproachById(approachId, companyId);
    
    res.json(ApiResponse.success(approach));
  }),

  /**
   * アプローチを送信
   */
  sendApproach: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);
    const userId = (req as any).user?.id || 1; // 認証から取得

    const approach = await approachService.sendApproach(companyId, userId, req.body);
    
    res.status(201).json(ApiResponse.created(approach, 'アプローチが正常に送信されました'));
  }),

  /**
   * アプローチステータスを更新
   */
  updateApproachStatus: asyncHandler(async (req: Request, res: Response) => {
    const approachId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);
    const { status } = req.body;

    const approach = await approachService.updateApproachStatus(approachId, companyId, status);
    
    res.json(ApiResponse.updated(approach, 'アプローチステータスが更新されました'));
  }),

  /**
   * アプローチを削除
   */
  deleteApproach: asyncHandler(async (req: Request, res: Response) => {
    const approachId = parseInt(req.params.id);
    const companyId = parseInt(req.companyId!);

    const result = await approachService.deleteApproach(approachId, companyId);
    
    res.json(ApiResponse.deleted('アプローチが削除されました'));
  }),

  /**
   * アプローチ統計を取得
   */
  getApproachStats: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);

    const stats = await approachService.getApproachStats(companyId);
    
    res.json(ApiResponse.success(stats));
  }),

  /**
   * メールテンプレート一覧を取得
   */
  getEmailTemplates: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);

    const templates = await approachService.getEmailTemplates(companyId);
    
    res.json(ApiResponse.success(templates));
  }),

  /**
   * メールテンプレートを作成
   */
  createEmailTemplate: asyncHandler(async (req: Request, res: Response) => {
    const companyId = parseInt(req.companyId!);

    const template = await approachService.createEmailTemplate(companyId, req.body);
    
    res.status(201).json(ApiResponse.created(template, 'メールテンプレートが作成されました'));
  }),

  /**
   * メールテンプレートを更新
   */
  updateEmailTemplate: asyncHandler(async (req: Request, res: Response) => {
    const templateId = parseInt(req.params.templateId);
    const companyId = parseInt(req.companyId!);

    const template = await approachService.updateEmailTemplate(templateId, companyId, req.body);
    
    res.json(ApiResponse.updated(template, 'メールテンプレートが更新されました'));
  }),

  /**
   * メールテンプレートを削除
   */
  deleteEmailTemplate: asyncHandler(async (req: Request, res: Response) => {
    const templateId = parseInt(req.params.templateId);
    const companyId = parseInt(req.companyId!);

    const result = await approachService.deleteEmailTemplate(templateId, companyId);
    
    res.json(ApiResponse.deleted('メールテンプレートが削除されました'));
  })
};
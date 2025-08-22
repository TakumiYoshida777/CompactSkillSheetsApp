import { Request, Response } from 'express';
import { partnerListService } from '../services/partnerListService';

export class PartnerListController {
  // 取引先一覧取得
  async getList(req: Request, res: Response) {
    try {
      const { status, industry, search, page = 1, limit = 10 } = req.query;
      
      const result = await partnerListService.getList({
        status: status as string,
        industry: industry as string,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        meta: {
          total: result.total,
          page: Number(page),
          limit: Number(limit),
        },
      });
    } catch (error) {
      console.error('取引先一覧取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '取引先一覧の取得中にエラーが発生しました',
        },
      });
    }
  }

  // 取引先詳細取得
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const partner = await partnerListService.getById(id);

      if (!partner) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '取引先が見つかりません',
          },
        });
      }

      res.json({
        success: true,
        data: partner,
      });
    } catch (error) {
      console.error('取引先詳細取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '取引先情報の取得中にエラーが発生しました',
        },
      });
    }
  }
}

export const partnerListController = new PartnerListController();
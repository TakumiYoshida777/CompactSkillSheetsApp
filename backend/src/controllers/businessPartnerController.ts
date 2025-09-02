/**
 * 取引先企業コントローラー（Feature Flag対応版）
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { businessPartnerService } from '../services/businessPartnerService';
import { logger } from '../utils/logger';

export class BusinessPartnerController {
  /**
   * 取引先企業一覧取得（Feature Flag対応）
   */
  async getBusinessPartners(req: AuthRequest, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status, 
        industry, 
        sortBy = 'createdAt', 
        order = 'desc' 
      } = req.query;
      
      const sesCompanyId = req.user?.companyId;
      
      // 新実装を使用（Feature Flag削除済み）
      const result = await businessPartnerService.getBusinessPartners({
        sesCompanyId: sesCompanyId ? BigInt(sesCompanyId) : undefined,
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        status: status as 'active' | 'inactive' | 'prospective',
        industry: industry as string,
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc'
      });
      
      res.json(result);
    } catch (error) {
      logger.error('取引先企業一覧取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業詳細取得（Feature Flag対応）
   */
  async getBusinessPartnerById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await businessPartnerService.getBusinessPartnerById(id);
      res.json(result);
    } catch (error) {
      logger.error('取引先企業詳細取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業作成（Feature Flag対応）
   */
  async createBusinessPartner(req: AuthRequest, res: Response) {
    try {
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;
      
      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }
      
      const result = await businessPartnerService.createBusinessPartner(
        req.body,
        BigInt(sesCompanyId),
        BigInt(userId)
      );
      
      res.status(201).json({
        message: '取引先企業を登録しました',
        ...result
      });
    } catch (error: any) {
      if (error.message?.includes('ValidationError')) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('取引先企業作成エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業更新（Feature Flag対応）
   */
  async updateBusinessPartner(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;
      
      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }
      
      const result = await businessPartnerService.updateBusinessPartner(
        id,
        req.body
      );
      
      res.json({
        message: '取引先企業を更新しました',
        ...result
      });
    } catch (error: any) {
      if (error.message?.includes('ValidationError')) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('取引先企業更新エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業削除（Feature Flag対応）
   */
  async deleteBusinessPartner(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;
      
      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }
      
      await businessPartnerService.deleteBusinessPartner(id);
      res.json({ message: '取引先企業を削除しました' });
    } catch (error: any) {
      if (error.message?.includes('ValidationError')) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('取引先企業削除エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * その他のメソッドは既存のBusinessPartnerControllerから継承
   */
  async updateBusinessPartnerStatus(req: AuthRequest, res: Response) {
    const controller = new (require('./businessPartnerController').BusinessPartnerController)();
    return controller.updateBusinessPartnerStatus(req, res);
  }

  async getBusinessPartnerStats(req: AuthRequest, res: Response) {
    const controller = new (require('./businessPartnerController').BusinessPartnerController)();
    return controller.getBusinessPartnerStats(req, res);
  }
}

export const businessPartnerController = new BusinessPartnerController();
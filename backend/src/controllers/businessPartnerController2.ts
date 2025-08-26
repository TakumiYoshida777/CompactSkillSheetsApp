/**
 * 取引先企業コントローラー（Feature Flag対応版）
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { businessPartnerService } from '../services/businessPartnerService';
import { businessPartnerService2 } from '../services/businessPartnerService2';
import { logger } from '../utils/logger';
import { isFeatureEnabled } from '../config/featureFlags';

export class BusinessPartnerController2 {
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
      const useNewService = isFeatureEnabled('useNewBusinessPartnerAPI');
      
      if (isFeatureEnabled('enableDetailedLogging')) {
        logger.info(`BusinessPartner API: Using ${useNewService ? 'NEW' : 'LEGACY'} service`);
      }
      
      if (useNewService) {
        // 新しいサービス（暫定実装互換）
        try {
          const result = await businessPartnerService2.getBusinessPartners({
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
          logger.error('新しいBusinessPartnerServiceでエラー:', error);
          
          // フォールバック: エラー時は旧サービスを使用
          if (sesCompanyId) {
            const fallbackResult = await businessPartnerService.getBusinessPartners({
              sesCompanyId: BigInt(sesCompanyId),
              page: Number(page),
              limit: Number(limit),
              search: search as string,
              status: status as 'active' | 'inactive',
              sortBy: sortBy as string,
              order: order as 'asc' | 'desc'
            });
            
            res.json(fallbackResult);
          } else {
            throw error;
          }
        }
      } else {
        // 既存のサービス
        if (!sesCompanyId) {
          return res.status(401).json({ error: '認証が必要です' });
        }
        
        const result = await businessPartnerService.getBusinessPartners({
          sesCompanyId: BigInt(sesCompanyId),
          page: Number(page),
          limit: Number(limit),
          search: search as string,
          status: status as 'active' | 'inactive',
          sortBy: sortBy as string,
          order: order as 'asc' | 'desc'
        });
        
        res.json(result);
      }
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
      const sesCompanyId = req.user?.companyId;
      const useNewService = isFeatureEnabled('useNewBusinessPartnerAPI');
      
      if (useNewService) {
        const result = await businessPartnerService2.getBusinessPartnerById(id);
        res.json(result);
      } else {
        if (!sesCompanyId) {
          return res.status(401).json({ error: '認証が必要です' });
        }
        
        const partner = await businessPartnerService.getBusinessPartnerById(
          BigInt(id),
          BigInt(sesCompanyId)
        );
        
        if (!partner) {
          return res.status(404).json({ error: '取引先企業が見つかりません' });
        }
        
        res.json(partner);
      }
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
      const useNewService = isFeatureEnabled('useNewBusinessPartnerAPI');
      
      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }
      
      if (useNewService) {
        const result = await businessPartnerService2.createBusinessPartner(
          req.body,
          BigInt(sesCompanyId),
          BigInt(userId)
        );
        
        res.status(201).json({
          message: '取引先企業を登録しました',
          ...result
        });
      } else {
        // 権限チェック
        const hasPermission = await businessPartnerService.checkCreatePermission(
          BigInt(userId),
          BigInt(sesCompanyId)
        );
        
        if (!hasPermission) {
          return res.status(403).json({ error: '権限がありません' });
        }
        
        const partnerData = {
          ...req.body,
          sesCompanyId: BigInt(sesCompanyId),
          createdBy: BigInt(userId)
        };
        
        const partner = await businessPartnerService.createBusinessPartner(partnerData);
        
        res.status(201).json({
          message: '取引先企業を登録しました',
          partner
        });
      }
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
      const useNewService = isFeatureEnabled('useNewBusinessPartnerAPI');
      
      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }
      
      if (useNewService) {
        const result = await businessPartnerService2.updateBusinessPartner(
          id,
          req.body
        );
        
        res.json({
          message: '取引先企業を更新しました',
          ...result
        });
      } else {
        // 権限チェック
        const hasPermission = await businessPartnerService.checkUpdatePermission(
          BigInt(userId),
          BigInt(sesCompanyId),
          BigInt(id)
        );
        
        if (!hasPermission) {
          return res.status(403).json({ error: '権限がありません' });
        }
        
        const updateData = {
          ...req.body,
          updatedBy: BigInt(userId)
        };
        
        const partner = await businessPartnerService.updateBusinessPartner(
          BigInt(id),
          updateData
        );
        
        res.json({
          message: '取引先企業を更新しました',
          partner
        });
      }
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
      const useNewService = isFeatureEnabled('useNewBusinessPartnerAPI');
      
      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }
      
      if (useNewService) {
        await businessPartnerService2.deleteBusinessPartner(id);
        res.json({ message: '取引先企業を削除しました' });
      } else {
        // 権限チェック
        const hasPermission = await businessPartnerService.checkDeletePermission(
          BigInt(userId),
          BigInt(sesCompanyId)
        );
        
        if (!hasPermission) {
          return res.status(403).json({ error: '権限がありません' });
        }
        
        await businessPartnerService.deleteBusinessPartner(
          BigInt(id),
          BigInt(sesCompanyId)
        );
        
        res.json({ message: '取引先企業を削除しました' });
      }
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

export const businessPartnerController2 = new BusinessPartnerController2();
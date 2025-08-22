import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';
import { BusinessPartnerService } from '../services/businessPartnerService';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const businessPartnerService = new BusinessPartnerService();

/**
 * 取引先企業管理コントローラー
 */
export class BusinessPartnerController {
  /**
   * 取引先企業一覧取得
   */
  async getBusinessPartners(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, search, status, sortBy = 'createdAt', order = 'desc' } = req.query;
      const sesCompanyId = req.user?.companyId;

      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const partners = await businessPartnerService.getBusinessPartners({
        sesCompanyId: BigInt(sesCompanyId),
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        status: status as 'active' | 'inactive',
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc'
      });

      res.json(partners);
    } catch (error) {
      logger.error('取引先企業一覧取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業詳細取得
   */
  async getBusinessPartnerById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const sesCompanyId = req.user?.companyId;

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
    } catch (error) {
      logger.error('取引先企業詳細取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業新規作成
   */
  async createBusinessPartner(req: AuthRequest, res: Response) {
    try {
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      // 権限チェック（管理者または営業のみ）
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
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('取引先企業作成エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業更新
   */
  async updateBusinessPartner(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

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
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('取引先企業更新エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業削除（論理削除）
   */
  async deleteBusinessPartner(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      // 権限チェック（管理者のみ）
      const hasPermission = await businessPartnerService.checkDeletePermission(
        BigInt(userId),
        BigInt(sesCompanyId)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: '削除権限がありません' });
      }

      await businessPartnerService.deleteBusinessPartner(
        BigInt(id),
        BigInt(sesCompanyId)
      );

      res.json({ message: '取引先企業を削除しました' });
    } catch (error) {
      logger.error('取引先企業削除エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業ステータス変更
   */
  async updateBusinessPartnerStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      // 権限チェック
      const hasPermission = await businessPartnerService.checkUpdatePermission(
        BigInt(userId),
        BigInt(sesCompanyId),
        BigInt(id)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: '権限がありません' });
      }

      const partner = await businessPartnerService.updateBusinessPartnerStatus(
        BigInt(id),
        isActive
      );

      res.json({
        message: `取引先企業を${isActive ? '有効化' : '無効化'}しました`,
        partner
      });
    } catch (error) {
      logger.error('取引先企業ステータス変更エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業統計情報取得
   */
  async getBusinessPartnerStats(req: AuthRequest, res: Response) {
    try {
      const sesCompanyId = req.user?.companyId;

      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const stats = await businessPartnerService.getBusinessPartnerStats(
        BigInt(sesCompanyId)
      );

      res.json(stats);
    } catch (error) {
      logger.error('取引先企業統計取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
}

export const businessPartnerController = new BusinessPartnerController();
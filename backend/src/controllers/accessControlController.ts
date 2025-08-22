import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';
import { AccessControlService } from '../services/accessControlService';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const accessControlService = new AccessControlService();

/**
 * アクセス権限管理コントローラー
 */
export class AccessControlController {
  /**
   * エンジニア表示権限取得
   */
  async getEngineerPermissions(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const sesCompanyId = req.user?.companyId;

      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const permissions = await accessControlService.getEngineerPermissions(
        BigInt(id),
        BigInt(sesCompanyId)
      );

      res.json(permissions);
    } catch (error) {
      logger.error('エンジニア表示権限取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * エンジニア表示権限設定
   */
  async setEngineerPermissions(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { engineerIds, viewType } = req.body;
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const result = await accessControlService.setEngineerPermissions({
        businessPartnerId: BigInt(id),
        sesCompanyId: BigInt(sesCompanyId),
        engineerIds: engineerIds.map((eid: number) => BigInt(eid)),
        viewType,
        updatedBy: BigInt(userId)
      });

      res.json({
        message: 'エンジニア表示権限を更新しました',
        permissions: result
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('エンジニア表示権限設定エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * NGリスト取得
   */
  async getNgList(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const sesCompanyId = req.user?.companyId;

      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const ngList = await accessControlService.getNgList(
        BigInt(id),
        BigInt(sesCompanyId)
      );

      res.json(ngList);
    } catch (error) {
      logger.error('NGリスト取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * NGリストに追加
   */
  async addToNgList(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { engineerId, reason } = req.body;
      const sesCompanyId = req.user?.companyId;
      const userId = req.user?.id;

      if (!sesCompanyId || !userId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const result = await accessControlService.addToNgList({
        businessPartnerId: BigInt(id),
        sesCompanyId: BigInt(sesCompanyId),
        engineerId: BigInt(engineerId),
        reason,
        createdBy: BigInt(userId)
      });

      res.json({
        message: 'NGリストに追加しました',
        ngEntry: result
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('NGリスト追加エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * NGリストから削除
   */
  async removeFromNgList(req: AuthRequest, res: Response) {
    try {
      const { id, engineerId } = req.params;
      const sesCompanyId = req.user?.companyId;

      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      await accessControlService.removeFromNgList(
        BigInt(id),
        BigInt(engineerId),
        BigInt(sesCompanyId)
      );

      res.json({ message: 'NGリストから削除しました' });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('NGリスト削除エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 表示可能エンジニア一覧取得
   */
  async getViewableEngineers(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, search, skills, availability } = req.query;
      const sesCompanyId = req.user?.companyId;

      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const engineers = await accessControlService.getViewableEngineers({
        businessPartnerId: BigInt(id),
        sesCompanyId: BigInt(sesCompanyId),
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        skills: skills ? (skills as string).split(',') : undefined,
        availability: availability as 'all' | 'available' | 'pending'
      });

      res.json(engineers);
    } catch (error) {
      logger.error('表示可能エンジニア一覧取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
}

export const accessControlController = new AccessControlController();
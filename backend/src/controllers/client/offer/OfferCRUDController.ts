import { errorLog } from '../../../utils/logger';
import { Request, Response } from 'express';
import { offerService } from '../../../services/offerService';
import { offerValidator } from '../../../validators/offerValidator';
import { emailService } from '../../../services/emailService';

/**
 * オファーの基本的なCRUD操作を担当するコントローラー
 */
export class OfferCRUDController {
  /**
   * オファー作成
   */
  async createOffer(req: Request, res: Response): Promise<void> {
    try {
      const { engineer_ids, project_details, send_email } = req.body;
      
      const validation = await offerValidator.validate(req.body);
      if (!validation.valid) {
        res.status(400).json({ errors: validation.errors });
        return;
      }
      
      const offer = await offerService.createOffer({
        client_company_id: req.user!.companyId,
        engineer_ids,
        project_details,
        created_by: req.user!.userId
      });
      
      if (send_email) {
        await emailService.sendOfferEmails(offer);
      }
      
      res.status(201).json(offer);
    } catch (error) {
      errorLog('Create offer error:', error);
      res.status(500).json({ error: 'オファーの作成に失敗しました' });
    }
  }

  /**
   * オファー一覧取得
   */
  async getOffers(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', status } = req.query;
      
      const offers = await offerService.getOffers({
        companyId: req.user!.companyId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      });
      
      res.json(offers);
    } catch (error) {
      errorLog('Get offers error:', error);
      res.status(500).json({ error: 'オファー一覧の取得に失敗しました' });
    }
  }

  /**
   * オファー詳細取得
   */
  async getOfferById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const offer = await offerService.getOfferById(id, req.user!.companyId);
      
      if (!offer) {
        res.status(404).json({ error: 'オファーが見つかりません' });
        return;
      }
      
      res.json(offer);
    } catch (error) {
      errorLog('Get offer by id error:', error);
      res.status(500).json({ error: 'オファー詳細の取得に失敗しました' });
    }
  }

  /**
   * オファーステータス更新
   */
  async updateOfferStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['withdrawn', 'reminder_sent'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: '無効なステータスです' });
        return;
      }
      
      const updatedOffer = await offerService.updateOfferStatus(
        id,
        status,
        req.user!.companyId
      );
      
      res.json(updatedOffer);
    } catch (error) {
      errorLog('Update offer status error:', error);
      res.status(500).json({ error: 'ステータスの更新に失敗しました' });
    }
  }
}

export const offerCRUDController = new OfferCRUDController();
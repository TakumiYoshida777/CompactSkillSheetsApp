import { Request, Response } from 'express';
import { offerService } from '../../services/offerService';
import { emailService } from '../../services/emailService';
import { offerValidator } from '../../validators/offerValidator';

export class OfferController {
  /**
   * オファー送信（複数エンジニア対応）
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
        created_by: req.user!.id
      });
      
      if (send_email) {
        await emailService.sendOfferEmails(offer);
      }
      
      res.status(201).json(offer);
    } catch (error) {
      console.error('Create offer error:', error);
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
      console.error('Get offers error:', error);
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
      console.error('Get offer by id error:', error);
      res.status(500).json({ error: 'オファー詳細の取得に失敗しました' });
    }
  }

  /**
   * オファーステータス更新（撤回等）
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
      console.error('Update offer status error:', error);
      res.status(500).json({ error: 'ステータスの更新に失敗しました' });
    }
  }

  /**
   * リマインドメール送信
   */
  async sendReminder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const offer = await offerService.getOfferById(id, req.user!.companyId);
      
      if (!offer) {
        res.status(404).json({ error: 'オファーが見つかりません' });
        return;
      }
      
      await emailService.sendReminderEmail(offer);
      
      const updatedOffer = await offerService.updateReminderInfo(id);
      
      res.json({
        message: 'リマインドメールを送信しました',
        reminderCount: updatedOffer.reminderCount
      });
    } catch (error) {
      console.error('Send reminder error:', error);
      res.status(500).json({ error: 'リマインドメールの送信に失敗しました' });
    }
  }

  /**
   * 一括操作（複数オファーへの操作）
   */
  async bulkAction(req: Request, res: Response): Promise<void> {
    try {
      const { offer_ids, action } = req.body;
      
      let result;
      switch (action) {
        case 'remind':
          result = await offerService.bulkRemind(offer_ids, req.user!.companyId);
          break;
        case 'withdraw':
          result = await offerService.bulkWithdraw(offer_ids, req.user!.companyId);
          break;
        default:
          res.status(400).json({ error: '無効なアクションです' });
          return;
      }
      
      res.json({
        message: '一括操作が完了しました',
        result
      });
    } catch (error) {
      console.error('Bulk action error:', error);
      res.status(500).json({ error: '一括操作に失敗しました' });
    }
  }

  /**
   * オファーボード情報取得
   */
  async getOfferBoard(req: Request, res: Response): Promise<void> {
    try {
      const boardData = await offerService.getOfferBoardData(req.user!.companyId);
      
      res.json(boardData);
    } catch (error) {
      console.error('Get offer board error:', error);
      res.status(500).json({ error: 'オファーボード情報の取得に失敗しました' });
    }
  }

  /**
   * オファー履歴取得
   */
  async getOfferHistory(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '20', search, status, period } = req.query;
      
      const history = await offerService.getOfferHistory({
        companyId: req.user!.companyId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as string,
        period: period as string
      });
      
      res.json(history);
    } catch (error) {
      console.error('Get offer history error:', error);
      res.status(500).json({ error: 'オファー履歴の取得に失敗しました' });
    }
  }

  /**
   * オファー統計情報取得
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await offerService.getStatistics(req.user!.companyId);
      
      res.json(statistics);
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ error: '統計情報の取得に失敗しました' });
    }
  }
}
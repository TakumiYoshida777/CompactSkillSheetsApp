import { errorLog } from '../../utils/logger';
import { Request, Response } from 'express';
import { offerService } from '../../../services/offerService';
import { emailService } from '../../../services/emailService';

/**
 * オファーのコミュニケーション（メール送信等）を担当するコントローラー
 */
export class OfferCommunicationController {
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
      errorLog('Send reminder error:', error);
      res.status(500).json({ error: 'リマインドメールの送信に失敗しました' });
    }
  }

  /**
   * オファーメール再送信
   */
  async resendOfferEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const offer = await offerService.getOfferById(id, req.user!.companyId);
      
      if (!offer) {
        res.status(404).json({ error: 'オファーが見つかりません' });
        return;
      }
      
      await emailService.sendOfferEmails(offer);
      
      res.json({
        message: 'オファーメールを再送信しました'
      });
    } catch (error) {
      errorLog('Resend offer email error:', error);
      res.status(500).json({ error: 'オファーメールの再送信に失敗しました' });
    }
  }

  /**
   * メール送信履歴取得
   */
  async getEmailHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const history = await offerService.getEmailHistory(id, req.user!.companyId);
      
      res.json(history);
    } catch (error) {
      errorLog('Get email history error:', error);
      res.status(500).json({ error: 'メール送信履歴の取得に失敗しました' });
    }
  }
}

export const offerCommunicationController = new OfferCommunicationController();
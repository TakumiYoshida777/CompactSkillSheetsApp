import { Request, Response } from 'express';
import { offerService } from '../../../services/offerService';

/**
 * オファーの一括操作を担当するコントローラー
 */
export class OfferBulkController {
  /**
   * 一括操作の実行
   */
  async bulkAction(req: Request, res: Response): Promise<void> {
    try {
      const { offer_ids, action } = req.body;
      
      const result = await this.executeBulkAction(
        action,
        offer_ids,
        req.user!.companyId
      );
      
      if (!result) {
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
   * 一括リマインド送信
   */
  async bulkRemind(req: Request, res: Response): Promise<void> {
    try {
      const { offer_ids } = req.body;
      
      const result = await offerService.bulkRemind(
        offer_ids,
        req.user!.companyId
      );
      
      res.json({
        message: '一括リマインドを送信しました',
        succeeded: result.succeeded,
        failed: result.failed
      });
    } catch (error) {
      console.error('Bulk remind error:', error);
      res.status(500).json({ error: '一括リマインドの送信に失敗しました' });
    }
  }

  /**
   * 一括撤回
   */
  async bulkWithdraw(req: Request, res: Response): Promise<void> {
    try {
      const { offer_ids } = req.body;
      
      const result = await offerService.bulkWithdraw(
        offer_ids,
        req.user!.companyId
      );
      
      res.json({
        message: 'オファーを一括撤回しました',
        succeeded: result.succeeded,
        failed: result.failed
      });
    } catch (error) {
      console.error('Bulk withdraw error:', error);
      res.status(500).json({ error: '一括撤回に失敗しました' });
    }
  }

  /**
   * 一括ステータス更新
   */
  async bulkUpdateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { offer_ids, status } = req.body;
      
      const result = await offerService.bulkUpdateStatus(
        offer_ids,
        status,
        req.user!.companyId
      );
      
      res.json({
        message: 'ステータスを一括更新しました',
        updated: result.updated,
        failed: result.failed
      });
    } catch (error) {
      console.error('Bulk update status error:', error);
      res.status(500).json({ error: 'ステータスの一括更新に失敗しました' });
    }
  }

  /**
   * アクションの実行
   */
  private async executeBulkAction(
    action: string,
    offerIds: string[],
    companyId: string
  ): Promise<any> {
    switch (action) {
      case 'remind':
        return await offerService.bulkRemind(offerIds, companyId);
      case 'withdraw':
        return await offerService.bulkWithdraw(offerIds, companyId);
      default:
        return null;
    }
  }
}

export const offerBulkController = new OfferBulkController();
import { errorLog } from '../../utils/logger';
import { Request, Response } from 'express';
import { offerService } from '../../../services/offerService';

/**
 * オファーの分析・統計情報を担当するコントローラー
 */
export class OfferAnalyticsController {
  /**
   * オファーボード情報取得
   */
  async getOfferBoard(req: Request, res: Response): Promise<void> {
    try {
      const boardData = await offerService.getOfferBoardData(req.user!.companyId);
      
      res.json(boardData);
    } catch (error) {
      errorLog('Get offer board error:', error);
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
      errorLog('Get offer history error:', error);
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
      errorLog('Get statistics error:', error);
      res.status(500).json({ error: '統計情報の取得に失敗しました' });
    }
  }

  /**
   * 月次レポート取得
   */
  async getMonthlyReport(req: Request, res: Response): Promise<void> {
    try {
      const { year, month } = req.query;
      
      const report = await offerService.getMonthlyReport(
        req.user!.companyId,
        parseInt(year as string),
        parseInt(month as string)
      );
      
      res.json(report);
    } catch (error) {
      errorLog('Get monthly report error:', error);
      res.status(500).json({ error: '月次レポートの取得に失敗しました' });
    }
  }

  /**
   * エンジニア別統計取得
   */
  async getEngineerStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { engineerId } = req.params;
      
      const statistics = await offerService.getEngineerStatistics(
        engineerId,
        req.user!.companyId
      );
      
      res.json(statistics);
    } catch (error) {
      errorLog('Get engineer statistics error:', error);
      res.status(500).json({ error: 'エンジニア統計の取得に失敗しました' });
    }
  }

  /**
   * トレンド分析データ取得
   */
  async getTrendAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30' } = req.query;
      
      const trends = await offerService.getTrendAnalysis(
        req.user!.companyId,
        parseInt(period as string)
      );
      
      res.json(trends);
    } catch (error) {
      errorLog('Get trend analysis error:', error);
      res.status(500).json({ error: 'トレンド分析データの取得に失敗しました' });
    }
  }

  /**
   * CSVエクスポート
   */
  async exportToCSV(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const csvData = await offerService.exportOffersToCSV(
        req.user!.companyId,
        startDate as string,
        endDate as string
      );
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="offers.csv"');
      res.send(csvData);
    } catch (error) {
      errorLog('Export CSV error:', error);
      res.status(500).json({ error: 'CSVエクスポートに失敗しました' });
    }
  }
}

export const offerAnalyticsController = new OfferAnalyticsController();
/**
 * オファー関連コントローラーのエクスポート
 * 責務ごとに分割された各コントローラーを統合
 */

export { offerCRUDController } from './OfferCRUDController';
export { offerCommunicationController } from './OfferCommunicationController';
export { offerBulkController } from './OfferBulkController';
export { offerAnalyticsController } from './OfferAnalyticsController';

// 後方互換性のための統合エクスポート
import { OfferCRUDController } from './OfferCRUDController';
import { OfferCommunicationController } from './OfferCommunicationController';
import { OfferBulkController } from './OfferBulkController';
import { OfferAnalyticsController } from './OfferAnalyticsController';

/**
 * 統合されたOfferControllerクラス（後方互換性用）
 * 新規実装では個別のコントローラーを直接使用することを推奨
 */
export class OfferController {
  private crudController = new OfferCRUDController();
  private communicationController = new OfferCommunicationController();
  private bulkController = new OfferBulkController();
  private analyticsController = new OfferAnalyticsController();

  // CRUD操作
  createOffer = this.crudController.createOffer.bind(this.crudController);
  getOffers = this.crudController.getOffers.bind(this.crudController);
  getOfferById = this.crudController.getOfferById.bind(this.crudController);
  updateOfferStatus = this.crudController.updateOfferStatus.bind(this.crudController);

  // コミュニケーション操作
  sendReminder = this.communicationController.sendReminder.bind(this.communicationController);
  resendOfferEmail = this.communicationController.resendOfferEmail.bind(this.communicationController);
  getEmailHistory = this.communicationController.getEmailHistory.bind(this.communicationController);

  // 一括操作
  bulkAction = this.bulkController.bulkAction.bind(this.bulkController);
  bulkRemind = this.bulkController.bulkRemind.bind(this.bulkController);
  bulkWithdraw = this.bulkController.bulkWithdraw.bind(this.bulkController);
  bulkUpdateStatus = this.bulkController.bulkUpdateStatus.bind(this.bulkController);

  // 分析・統計
  getOfferBoard = this.analyticsController.getOfferBoard.bind(this.analyticsController);
  getOfferHistory = this.analyticsController.getOfferHistory.bind(this.analyticsController);
  getStatistics = this.analyticsController.getStatistics.bind(this.analyticsController);
  getMonthlyReport = this.analyticsController.getMonthlyReport.bind(this.analyticsController);
  getEngineerStatistics = this.analyticsController.getEngineerStatistics.bind(this.analyticsController);
  getTrendAnalysis = this.analyticsController.getTrendAnalysis.bind(this.analyticsController);
  exportToCSV = this.analyticsController.exportToCSV.bind(this.analyticsController);
}

export const offerController = new OfferController();
import { Router } from 'express';
import { offerController } from '../../controllers/client/offer';
import { authenticateClientUser } from '../../middleware/clientAuth';

const router = Router();

// 全てのルートで取引先企業ユーザーの認証が必要
router.use(authenticateClientUser);

// オファー管理
router.post('/offers', (req, res) => offerController.createOffer(req, res));
router.get('/offers', (req, res) => offerController.getOffers(req, res));
router.get('/offers/statistics', (req, res) => offerController.getStatistics(req, res));
router.get('/offers/:id', (req, res) => offerController.getOfferById(req, res));
router.put('/offers/:id/status', (req, res) => offerController.updateOfferStatus(req, res));
router.post('/offers/:id/reminder', (req, res) => offerController.sendReminder(req, res));
router.post('/offers/bulk-action', (req, res) => offerController.bulkAction(req, res));

// オファーボード
router.get('/offer-board', (req, res) => offerController.getOfferBoard(req, res));

// オファー履歴
router.get('/offer-history', (req, res) => offerController.getOfferHistory(req, res));

export default router;
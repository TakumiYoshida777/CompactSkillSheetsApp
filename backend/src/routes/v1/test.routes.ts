import { Router } from 'express';
import { businessPartnerService2 } from '../../services/businessPartnerService2';
import { partnerListService } from '../../services/partnerListService';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * 開発環境用テストエンドポイント（認証不要）
 * 本番環境では無効化すること
 */

// Feature Flag動作確認
router.get('/feature-flag', async (req, res) => {
  const useNewAPI = process.env.USE_NEW_BP_API === 'true';
  res.json({
    success: true,
    data: {
      USE_NEW_BP_API: useNewAPI,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

// 暫定実装経由でのデータ取得（Feature Flag対応）
router.get('/partner-list-test', async (req, res) => {
  try {
    logger.info('テストエンドポイント: /partner-list-test アクセス');
    
    const result = await partnerListService.getList({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    logger.error('partner-list-test エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// 新実装の直接テスト
router.get('/new-api-test', async (req, res) => {
  try {
    logger.info('テストエンドポイント: /new-api-test アクセス');
    
    const result = await businessPartnerService2.getBusinessPartners({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 5
    });
    
    res.json({
      success: true,
      data: result,
      total: result.length
    });
  } catch (error: any) {
    logger.error('new-api-test エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// データベース確認
router.get('/db-check', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const [companies, businessPartners, details] = await Promise.all([
      prisma.company.count({ where: { companyType: 'CLIENT' } }),
      prisma.businessPartner.count(),
      prisma.businessPartnerDetail.count()
    ]);
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: {
        clientCompanies: companies,
        businessPartners,
        businessPartnerDetails: details
      }
    });
  } catch (error: any) {
    logger.error('db-check エラー:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
});

export default router;
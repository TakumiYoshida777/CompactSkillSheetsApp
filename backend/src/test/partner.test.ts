import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Partner API', () => {
  const testCompanyId = '1';
  const authToken = 'test-token';
  
  beforeAll(async () => {
    // テストデータのセットアップ
    await prisma.$executeRawUnsafe(`
      INSERT INTO companies (id, name, email) 
      VALUES (1, 'テスト企業', 'test@example.com')
      ON CONFLICT (id) DO NOTHING
    `);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/v1/business-partners', () => {
    it('取引先一覧を取得できる', async () => {
      const response = await request(app)
        .get('/api/v1/business-partners')
        .set('X-Company-ID', testCompanyId)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('企業IDなしではエラーになる', async () => {
      const response = await request(app)
        .get('/api/v1/business-partners')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('COMPANY_ID_REQUIRED');
    });
  });

  describe('POST /api/v1/business-partners', () => {
    it('取引先企業を作成できる', async () => {
      const partnerData = {
        name: 'テスト取引先企業',
        email: 'partner@test.com',
        contractStartDate: '2024-01-01',
        contractEndDate: '2024-12-31',
        maxViewableEngineers: 50
      };
      
      const response = await request(app)
        .post('/api/v1/business-partners')
        .set('X-Company-ID', testCompanyId)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partnerData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(partnerData.name);
    });

    it('必須フィールドがない場合はエラーになる', async () => {
      const invalidData = {
        email: 'partner@test.com'
      };
      
      const response = await request(app)
        .post('/api/v1/business-partners')
        .set('X-Company-ID', testCompanyId)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(422);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/business-partners/:id/access-urls', () => {
    it('アクセスURLを生成できる', async () => {
      const response = await request(app)
        .post('/api/v1/business-partners/1/access-urls')
        .set('X-Company-ID', testCompanyId)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ expiresIn: 30, maxUses: 10 })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.full_url).toMatch(/\/partner\/access\//);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('PUT /api/v1/business-partners/:id/permissions', () => {
    it('権限設定を更新できる', async () => {
      const permissions = {
        canViewEngineers: true,
        canSendOffers: false,
        maxViewableEngineers: 100,
        autoPublishWaiting: true
      };
      
      const response = await request(app)
        .put('/api/v1/business-partners/1/permissions')
        .set('X-Company-ID', testCompanyId)
        .set('Authorization', `Bearer ${authToken}`)
        .send(permissions)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.canSendOffers).toBe(false);
    });
  });

  describe('GET /api/v1/business-partners/:id/statistics', () => {
    it('統計情報を取得できる', async () => {
      const response = await request(app)
        .get('/api/v1/business-partners/1/statistics')
        .set('X-Company-ID', testCompanyId)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalOffers');
      expect(response.body.data).toHaveProperty('totalViews');
      expect(response.body.data).toHaveProperty('visibleEngineers');
    });
  });
});
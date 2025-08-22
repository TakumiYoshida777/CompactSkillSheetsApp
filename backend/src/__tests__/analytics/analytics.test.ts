import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import analyticsRoutes from '../../routes/analytics.routes';
import { authenticateToken } from '../../middleware/auth.middleware';

// Prismaモック
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    engineer: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    approach: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
    },
    company: {
      findMany: jest.fn(),
    },
    skillMaster: {
      findMany: jest.fn(),
    },
    engineerSkill: {
      groupBy: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    systemAnnouncement: {
      findMany: jest.fn(),
    },
  })),
}));

// 認証ミドルウェアのモック
jest.mock('../../middleware/auth.middleware', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      companyId: 'test-company-id',
      role: 'SES_COMPANY_ADMIN',
    };
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/v1/analytics', analyticsRoutes);

const prisma = new PrismaClient();

describe('Analytics API', () => {
  describe('GET /api/v1/analytics/dashboard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('ダッシュボードデータを正常に取得できる', async () => {
      // モックデータの設定
      (prisma.engineer.count as jest.Mock).mockResolvedValueOnce(45); // total
      (prisma.engineer.count as jest.Mock).mockResolvedValueOnce(32); // active
      (prisma.approach.count as jest.Mock).mockResolvedValueOnce(15); // current month
      (prisma.approach.count as jest.Mock).mockResolvedValueOnce(12); // last month
      (prisma.approach.count as jest.Mock).mockResolvedValueOnce(100); // total
      (prisma.approach.count as jest.Mock).mockResolvedValueOnce(65); // accepted
      (prisma.approach.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.project.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('kpi');
      expect(response.body.data.kpi).toHaveProperty('totalEngineers');
      expect(response.body.data.kpi).toHaveProperty('activeEngineers');
      expect(response.body.data.kpi).toHaveProperty('waitingEngineers');
    });

    test('認証なしでアクセスするとエラーになる', async () => {
      (authenticateToken as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ success: false, message: '認証トークンが必要です' });
      });

      const response = await request(app)
        .get('/api/v1/analytics/dashboard');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/analytics/engineers/statistics', () => {
    test('エンジニア統計を正常に取得できる', async () => {
      // モックデータの設定
      (prisma.engineer.groupBy as jest.Mock).mockResolvedValue([
        { status: 'ACTIVE', _count: 32 },
        { status: 'WAITING', _count: 13 },
      ]);
      (prisma.engineer.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.engineerSkill.groupBy as jest.Mock).mockResolvedValue([
        { skillId: 'skill-1', _count: 28 },
        { skillId: 'skill-2', _count: 25 },
      ]);
      (prisma.skillMaster.findMany as jest.Mock).mockResolvedValue([
        { id: 'skill-1', name: 'JavaScript' },
        { id: 'skill-2', name: 'TypeScript' },
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/engineers/statistics')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('statusDistribution');
      expect(response.body.data).toHaveProperty('skillDistribution');
    });
  });

  describe('GET /api/v1/analytics/approaches/statistics', () => {
    test('アプローチ統計を正常に取得できる', async () => {
      // モックデータの設定
      (prisma.approach.groupBy as jest.Mock).mockResolvedValueOnce([
        { status: 'PENDING', _count: 12 },
        { status: 'ACCEPTED', _count: 8 },
      ]);
      (prisma.approach.findMany as jest.Mock).mockResolvedValue([
        {
          createdAt: new Date('2025-08-15'),
          status: 'PENDING',
        },
        {
          createdAt: new Date('2025-08-15'),
          status: 'ACCEPTED',
        },
      ]);
      (prisma.approach.groupBy as jest.Mock).mockResolvedValueOnce([
        { clientCompanyId: 'client-1', _count: 15 },
      ]);
      (prisma.company.findMany as jest.Mock).mockResolvedValue([
        { id: 'client-1', name: '株式会社ABC' },
      ]);

      const response = await request(app)
        .get('/api/v1/analytics/approaches/statistics')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('statusDistribution');
      expect(response.body.data).toHaveProperty('dailyTrend');
      expect(response.body.data).toHaveProperty('topClients');
    });
  });
});

describe('Notifications API', () => {
  describe('GET /api/v1/notifications', () => {
    test('通知一覧を正常に取得できる', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'notif-1',
          type: 'approach',
          title: 'New Approach',
          content: 'You have a new approach',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      (prisma.notification.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('notifications');
      expect(response.body.data).toHaveProperty('pagination');
    });
  });

  describe('POST /api/v1/notifications/mark-read', () => {
    test('通知を既読にできる', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      const response = await request(app)
        .post('/api/v1/notifications/mark-read')
        .set('Authorization', 'Bearer test-token')
        .send({
          notificationIds: ['notif-1', 'notif-2'],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('通知を既読にしました');
    });
  });
});
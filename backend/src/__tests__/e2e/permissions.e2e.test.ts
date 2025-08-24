import request from 'supertest';
import app from '../../index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Permission System E2E Tests', () => {
  let adminToken: string;
  let salesToken: string;
  let clientToken: string;
  
  // テスト用ユーザーのセットアップ
  beforeAll(async () => {
    // データベースのクリーンアップ
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    
    // テスト用パスワードハッシュ
    const passwordHash = await bcrypt.hash('Test123!', 10);
    
    // テスト用ユーザー作成
    const adminUser = await prisma.user.create({
      data: {
        email: 'test-admin@example.com',
        name: 'Test Admin',
        passwordHash,
        companyId: 1n,
      }
    });
    
    const salesUser = await prisma.user.create({
      data: {
        email: 'test-sales@example.com',
        name: 'Test Sales',
        passwordHash,
        companyId: 1n,
      }
    });
    
    const clientUser = await prisma.user.create({
      data: {
        email: 'test-client@example.com',
        name: 'Test Client',
        passwordHash,
        companyId: 2n,
      }
    });
    
    // ロール割り当て
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const salesRole = await prisma.role.findUnique({ where: { name: 'sales' } });
    const clientRole = await prisma.role.findUnique({ where: { name: 'client_admin' } });
    
    if (adminRole) {
      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
        }
      });
    }
    
    if (salesRole) {
      await prisma.userRole.create({
        data: {
          userId: salesUser.id,
          roleId: salesRole.id,
        }
      });
    }
    
    if (clientRole) {
      await prisma.userRole.create({
        data: {
          userId: clientUser.id,
          roleId: clientRole.id,
        }
      });
    }
    
    // ログインしてトークン取得
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-admin@example.com', password: 'Test123!' });
    adminToken = adminLogin.body.data.accessToken;
    
    const salesLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-sales@example.com', password: 'Test123!' });
    salesToken = salesLogin.body.data.accessToken;
    
    const clientLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test-client@example.com', password: 'Test123!' });
    clientToken = clientLogin.body.data.accessToken;
  });
  
  // テスト後のクリーンアップ
  afterAll(async () => {
    await prisma.userRole.deleteMany({
      where: {
        user: {
          email: {
            in: ['test-admin@example.com', 'test-sales@example.com', 'test-client@example.com']
          }
        }
      }
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-admin@example.com', 'test-sales@example.com', 'test-client@example.com']
        }
      }
    });
    
    await prisma.$disconnect();
  });
  
  describe('GET /api/auth/permissions', () => {
    it('should return permissions for admin user', async () => {
      const response = await request(app)
        .get('/api/auth/permissions')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(40); // 管理者は多くの権限を持つ
    });
    
    it('should return permissions for sales user', async () => {
      const response = await request(app)
        .get('/api/auth/permissions')
        .set('Authorization', `Bearer ${salesToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(10);
      expect(response.body.data.length).toBeLessThan(30); // 営業は中程度の権限
    });
    
    it('should return permissions for client user', async () => {
      const response = await request(app)
        .get('/api/auth/permissions')
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThan(10); // クライアントは限定的な権限
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/permissions');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/auth/check-permission', () => {
    it('admin should have engineer:delete permission', async () => {
      const response = await request(app)
        .post('/api/auth/check-permission')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resource: 'engineer',
          action: 'delete'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hasPermission).toBe(true);
    });
    
    it('sales should have engineer:create permission', async () => {
      const response = await request(app)
        .post('/api/auth/check-permission')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          resource: 'engineer',
          action: 'create'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hasPermission).toBe(true);
    });
    
    it('sales should NOT have engineer:delete permission', async () => {
      const response = await request(app)
        .post('/api/auth/check-permission')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          resource: 'engineer',
          action: 'delete'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hasPermission).toBe(false);
    });
    
    it('client should NOT have engineer:create permission', async () => {
      const response = await request(app)
        .post('/api/auth/check-permission')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          resource: 'engineer',
          action: 'create'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hasPermission).toBe(false);
    });
    
    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .post('/api/auth/check-permission')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resource: 'engineer'
          // action is missing
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/auth/user-roles', () => {
    it('should return roles for admin user', async () => {
      const response = await request(app)
        .get('/api/auth/user-roles')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContain('admin');
    });
    
    it('should return roles for sales user', async () => {
      const response = await request(app)
        .get('/api/auth/user-roles')
        .set('Authorization', `Bearer ${salesToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContain('sales');
    });
    
    it('should return roles for client user', async () => {
      const response = await request(app)
        .get('/api/auth/user-roles')
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContain('client_admin');
    });
  });
  
  describe('Performance Tests', () => {
    it('should respond to permission check within 100ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/auth/check-permission')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resource: 'engineer',
          action: 'view',
          scope: 'company'
        });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(100);
    });
    
    it('should handle concurrent permission checks', async () => {
      const promises = [];
      
      // 10個の同時リクエスト
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/check-permission')
            .set('Authorization', `Bearer ${salesToken}`)
            .send({
              resource: 'skillsheet',
              action: 'view',
              scope: 'company'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // 全てのリクエストが成功することを確認
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
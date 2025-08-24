/**
 * セキュリティテスト
 * 本番環境リリース前の必須テスト
 */

import request from 'supertest';
import app from '../../index';
import { securityConfig } from '../../config/security';

describe('Security Tests', () => {
  describe('JWT Security', () => {
    it('should not accept weak JWT secrets in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'your-secret-key';
      
      expect(() => {
        // SecurityConfigのインスタンスを再作成して検証
        const SecurityConfig = require('../../config/security').SecurityConfig;
        new SecurityConfig();
      }).toThrow('JWT_SECRET contains weak or default value');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should require minimum length for JWT secrets in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'short';
      
      expect(() => {
        const SecurityConfig = require('../../config/security').SecurityConfig;
        new SecurityConfig();
      }).toThrow('JWT_SECRET must be at least 32 characters in production');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not allow same secret for JWT and refresh token', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const sameSecret = 'this-is-a-very-long-secret-that-is-more-than-32-characters';
      process.env.JWT_SECRET = sameSecret;
      process.env.JWT_REFRESH_SECRET = sameSecret;
      
      expect(() => {
        const SecurityConfig = require('../../config/security').SecurityConfig;
        new SecurityConfig();
      }).toThrow('JWT_SECRET and JWT_REFRESH_SECRET must be different');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginAttempts = [];
      
      // 6回ログイン試行（制限は5回）
      for (let i = 0; i < 6; i++) {
        loginAttempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }
      
      const responses = await Promise.all(loginAttempts);
      const lastResponse = responses[responses.length - 1];
      
      // 6回目は429（Too Many Requests）が返るはず
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error).toContain('ログイン試行回数が多すぎます');
    });

    it('should apply general rate limiting', async () => {
      const requests = [];
      
      // 短時間で大量のリクエスト
      for (let i = 0; i < 101; i++) {
        requests.push(
          request(app).get('/health')
        );
      }
      
      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      // 100回を超えるリクエストは拒否されるはず
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/auth/permissions')
        .expect(401);
      
      expect(response.body.message || response.body.error).toContain('認証トークンが必要です');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/auth/permissions')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(response.body.message || response.body.error).toContain('無効なトークン');
    });

    it('should reject expired tokens', async () => {
      // 過去の日付で署名されたトークン
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: '1', email: 'test@example.com' },
        securityConfig.getJwtSecret(),
        { expiresIn: '-1h' } // 1時間前に期限切れ
      );
      
      const response = await request(app)
        .get('/api/auth/permissions')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);
      
      expect(response.body.message || response.body.error).toContain('期限切れ');
    });
  });

  describe('Input Validation', () => {
    it('should reject SQL injection attempts in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "admin' OR '1'='1",
          password: "' OR '1'='1"
        })
        .expect(401);
      
      expect(response.body).not.toContain('SQL');
      expect(response.body).not.toContain('error in your SQL syntax');
    });

    it('should reject XSS attempts in user input', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: xssPayload,
          password: 'password'
        });
      
      // レスポンスにスクリプトタグが含まれていないことを確認
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });
  });

  describe('Headers Security', () => {
    it('should set security headers', async () => {
      const response = await request(app).get('/health');
      
      // Helmetによるセキュリティヘッダーの確認
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['x-xss-protection']).toBe('0'); // Modern browsers disable this
    });

    it('should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });
      
      // エラーメッセージにスタックトレースやDBの詳細が含まれていないことを確認
      expect(JSON.stringify(response.body)).not.toContain('at ');
      expect(JSON.stringify(response.body)).not.toContain('prisma');
      expect(JSON.stringify(response.body)).not.toContain('postgres');
    });
  });

  describe('Password Security', () => {
    it('should not return password hash in any response', async () => {
      // この部分は実際のユーザー作成後にテスト
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@demo-ses.example.com',
          password: 'password123'
        });
      
      if (response.status === 200) {
        expect(JSON.stringify(response.body)).not.toContain('passwordHash');
        expect(JSON.stringify(response.body)).not.toContain('password123');
      }
    });
  });
});

describe('Production Configuration', () => {
  it('should have production environment variables', () => {
    if (process.env.NODE_ENV === 'production') {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
      expect(process.env.JWT_SECRET).not.toContain('your-secret');
      expect(process.env.JWT_SECRET).not.toContain('dev-');
      expect(process.env.JWT_SECRET?.length).toBeGreaterThanOrEqual(32);
    }
  });
});
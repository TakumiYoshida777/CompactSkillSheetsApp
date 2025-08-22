import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { AuthCheckService } from '../authCheckService';

vi.mock('axios');

describe('AuthCheckService', () => {
  const mockAxios = axios as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateToken', () => {
    it('有効なトークンを受け入れる', () => {
      const context = {
        token: 'valid-token-123',
        tokenExpiry: new Date(Date.now() + 3600000).toISOString()
      };

      const isValid = AuthCheckService.validateToken(context);
      expect(isValid).toBe(true);
    });

    it('期限切れトークンを拒否する', () => {
      const context = {
        token: 'expired-token',
        tokenExpiry: new Date(Date.now() - 3600000).toISOString()
      };

      const isValid = AuthCheckService.validateToken(context);
      expect(isValid).toBe(false);
    });

    it('トークンなしを拒否する', () => {
      const context = {
        token: null,
        tokenExpiry: new Date(Date.now() + 3600000).toISOString()
      };

      const isValid = AuthCheckService.validateToken(context);
      expect(isValid).toBe(false);
    });
  });

  describe('determineEndpoint', () => {
    it('エンジニアユーザーのエンドポイントを返す', () => {
      const endpoint = AuthCheckService.determineEndpoint('token', {
        role: 'engineer',
        engineerId: '123'
      });

      expect(endpoint).toBe('engineer/profile');
    });

    it('クライアントユーザーのエンドポイントを返す', () => {
      const endpoint = AuthCheckService.determineEndpoint('token', {
        role: 'client'
      });

      expect(endpoint).toBe('client/profile');
    });

    it('管理者ユーザーのエンドポイントを返す', () => {
      const endpoint = AuthCheckService.determineEndpoint('token', {
        role: 'admin'
      });

      expect(endpoint).toBe('admin/profile');
    });

    it('デフォルトエンドポイントを返す', () => {
      const endpoint = AuthCheckService.determineEndpoint('token', {});
      expect(endpoint).toBe('auth/me');
    });
  });

  describe('fetchUserData', () => {
    it('ユーザーデータを取得する', async () => {
      const mockUserData = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'client'
      };

      mockAxios.get = vi.fn().mockResolvedValue({
        data: mockUserData
      });

      const result = await AuthCheckService.fetchUserData('token', {
        role: 'client'
      });

      expect(result).toEqual({
        isAuthenticated: true,
        user: mockUserData,
        error: null
      });

      expect(mockAxios.get).toHaveBeenCalledWith(
        'client/profile',
        {
          headers: {
            Authorization: 'Bearer token'
          }
        }
      );
    });

    it('401エラーで認証失敗を返す', async () => {
      mockAxios.get = vi.fn().mockRejectedValue({
        response: {
          status: 401
        }
      });

      const result = await AuthCheckService.fetchUserData('token', {});

      expect(result).toEqual({
        isAuthenticated: false,
        user: null,
        error: 'Token expired or invalid'
      });
    });

    it('その他のエラーで適切なエラーメッセージを返す', async () => {
      mockAxios.get = vi.fn().mockRejectedValue(new Error('Network Error'));

      const result = await AuthCheckService.fetchUserData('token', {});

      expect(result).toEqual({
        isAuthenticated: false,
        user: null,
        error: 'Network Error'
      });
    });
  });

  describe('performAuthCheck', () => {
    it('有効なトークンで認証成功', async () => {
      const context = {
        token: 'valid-token',
        tokenExpiry: new Date(Date.now() + 3600000).toISOString(),
        user: { role: 'client' }
      };

      const mockUserData = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'client'
      };

      mockAxios.get = vi.fn().mockResolvedValue({
        data: mockUserData
      });

      const result = await AuthCheckService.performAuthCheck(context);

      expect(result).toEqual({
        isAuthenticated: true,
        user: mockUserData,
        error: null
      });
    });

    it('無効なトークンで認証失敗', async () => {
      const context = {
        token: null,
        tokenExpiry: null,
        user: null
      };

      const result = await AuthCheckService.performAuthCheck(context);

      expect(result).toEqual({
        isAuthenticated: false,
        user: null,
        error: 'No valid token found'
      });
    });
  });
});
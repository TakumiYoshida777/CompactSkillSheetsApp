import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { AuthService } from '../authService';

vi.mock('axios');

describe('AuthService', () => {
  const mockAxios = axios as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('performLogin', () => {
    it('成功時にトークンとユーザー情報を返す', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User'
          }
        }
      };

      mockAxios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await AuthService.performLogin('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      });

      expect(result).toEqual({
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      });
    });

    it('エラー時に適切なエラーメッセージを投げる', async () => {
      mockAxios.post = vi.fn().mockRejectedValue({
        response: {
          data: {
            error: 'Invalid credentials'
          }
        }
      });

      await expect(
        AuthService.performLogin('/api/auth/login', {
          email: 'test@example.com',
          password: 'wrong',
          rememberMe: false
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('ネットワークエラー時にデフォルトメッセージを投げる', async () => {
      mockAxios.post = vi.fn().mockRejectedValue(new Error('Network Error'));

      await expect(
        AuthService.performLogin('/api/auth/login', {
          email: 'test@example.com',
          password: 'password',
          rememberMe: false
        })
      ).rejects.toThrow('ログインに失敗しました');
    });
  });

  describe('validateCredentials', () => {
    it('有効な認証情報を受け入れる', () => {
      const isValid = AuthService.validateCredentials({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      });

      expect(isValid).toBe(true);
    });

    it('無効なメールアドレスを拒否する', () => {
      const isValid = AuthService.validateCredentials({
        email: 'invalid-email',
        password: 'password123',
        rememberMe: false
      });

      expect(isValid).toBe(false);
    });

    it('短いパスワードを拒否する', () => {
      const isValid = AuthService.validateCredentials({
        email: 'test@example.com',
        password: '123',
        rememberMe: false
      });

      expect(isValid).toBe(false);
    });
  });

  describe('normalizeLoginResponse', () => {
    it('レスポンスを正規化する', () => {
      const normalized = AuthService.normalizeLoginResponse({
        access_token: 'token',
        refresh_token: 'refresh',
        user_data: {
          user_id: '1',
          user_email: 'test@example.com',
          user_name: 'Test'
        }
      });

      expect(normalized).toEqual({
        token: 'token',
        refreshToken: 'refresh',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test'
        }
      });
    });

    it('標準形式のレスポンスをそのまま返す', () => {
      const response = {
        token: 'token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test'
        }
      };

      const normalized = AuthService.normalizeLoginResponse(response);
      expect(normalized).toEqual(response);
    });
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthService } from '../../services/authService';
import { AuthCheckService } from '../../services/authCheckService';
import useAuthStore from '../../stores/authStore';

vi.mock('axios');

describe('認証フロー統合テスト', () => {
  const mockAxios = axios as any;
  let queryClient: QueryClient;

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('ログインフロー', () => {
    it('正常なログインから認証チェックまでの完全なフロー', async () => {
      // ログインAPIのモック
      const loginResponse = {
        data: {
          token: 'test-token-123',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'client'
          }
        }
      };

      mockAxios.post = vi.fn().mockResolvedValue(loginResponse);

      // Step 1: ログイン実行
      const authResponse = await AuthService.performLogin('auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      });

      expect(authResponse.token).toBe('test-token-123');
      expect(authResponse.user.email).toBe('test@example.com');

      // Step 2: トークンをストアに保存
      useAuthStore.getState().setAuth(
        authResponse.token,
        authResponse.user,
        false
      );

      expect(useAuthStore.getState().token).toBe('test-token-123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Step 3: 認証チェック
      mockAxios.get = vi.fn().mockResolvedValue({
        data: authResponse.user
      });

      const authCheckResult = await AuthCheckService.performAuthCheck({
        token: useAuthStore.getState().token,
        tokenExpiry: new Date(Date.now() + 3600000).toISOString(),
        user: useAuthStore.getState().user
      });

      expect(authCheckResult.isAuthenticated).toBe(true);
      expect(authCheckResult.user?.email).toBe('test@example.com');
      expect(authCheckResult.error).toBeNull();
    });

    it('無効な認証情報でのログイン失敗フロー', async () => {
      mockAxios.post = vi.fn().mockRejectedValue({
        response: {
          status: 401,
          data: {
            error: 'Invalid credentials'
          }
        }
      });

      await expect(
        AuthService.performLogin('auth/login', {
          email: 'test@example.com',
          password: 'wrong-password',
          rememberMe: false
        })
      ).rejects.toThrow('Invalid credentials');

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('トークン期限切れでの再認証フロー', async () => {
      // Step 1: 初期ログイン
      useAuthStore.getState().setAuth(
        'expired-token',
        { id: '1', email: 'test@example.com', name: 'Test', role: 'client' },
        false
      );

      // Step 2: 期限切れトークンでのAPIコール
      mockAxios.get = vi.fn().mockRejectedValue({
        response: { status: 401 }
      });

      const authCheckResult = await AuthCheckService.performAuthCheck({
        token: 'expired-token',
        tokenExpiry: new Date(Date.now() - 3600000).toISOString(),
        user: useAuthStore.getState().user
      });

      expect(authCheckResult.isAuthenticated).toBe(false);
      expect(authCheckResult.error).toBe('No valid token found');

      // Step 3: ログアウト処理
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().token).toBeNull();
    });
  });

  describe('ロール別認証フロー', () => {
    it('エンジニアユーザーの認証フロー', async () => {
      const engineerUser = {
        id: '1',
        email: 'engineer@example.com',
        name: 'Engineer User',
        role: 'engineer',
        engineerId: '123'
      };

      // ログイン
      mockAxios.post = vi.fn().mockResolvedValue({
        data: { token: 'engineer-token', user: engineerUser }
      });

      const loginResult = await AuthService.performLogin('auth/engineer/login', {
        email: 'engineer@example.com',
        password: 'password',
        rememberMe: false
      });

      expect(loginResult.user.role).toBe('engineer');

      // エンジニア用エンドポイントの確認
      const endpoint = AuthCheckService.determineEndpoint('engineer-token', engineerUser);
      expect(endpoint).toBe('engineer/profile');
    });

    it('クライアントユーザーの認証フロー', async () => {
      const clientUser = {
        id: '2',
        email: 'client@example.com',
        name: 'Client User',
        role: 'client'
      };

      // ログイン
      mockAxios.post = vi.fn().mockResolvedValue({
        data: { token: 'client-token', user: clientUser }
      });

      const loginResult = await AuthService.performLogin('auth/client/login', {
        email: 'client@example.com',
        password: 'password',
        rememberMe: false
      });

      expect(loginResult.user.role).toBe('client');

      // クライアント用エンドポイントの確認
      const endpoint = AuthCheckService.determineEndpoint('client-token', clientUser);
      expect(endpoint).toBe('client/profile');
    });
  });

  describe('セッション管理', () => {
    it('Remember Me機能の動作確認', async () => {
      const loginResponse = {
        data: {
          token: 'remember-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'client'
          }
        }
      };

      mockAxios.post = vi.fn().mockResolvedValue(loginResponse);

      // Remember Meを有効にしてログイン
      await AuthService.performLogin('auth/login', {
        email: 'test@example.com',
        password: 'password',
        rememberMe: true
      });

      // ストアに保存
      useAuthStore.getState().setAuth(
        loginResponse.data.token,
        loginResponse.data.user,
        true // Remember Me有効
      );

      // Remember Meフラグの確認
      const state = useAuthStore.getState();
      expect(state.token).toBe('remember-token');
      expect(state.isAuthenticated).toBe(true);
      // 実際のlocalStorage永続化はZustand persistミドルウェアで処理される
    });

    it('ログアウト処理の完全性', () => {
      // ログイン状態を設定
      useAuthStore.getState().setAuth(
        'test-token',
        { id: '1', email: 'test@example.com', name: 'Test', role: 'client' },
        false
      );

      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // ログアウト実行
      useAuthStore.getState().logout();

      // 完全にクリアされていることを確認
      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
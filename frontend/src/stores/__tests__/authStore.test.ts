import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useAuthStore } from '../authStore';

// axios をモック
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authStore', () => {
  beforeEach(() => {
    // 各テストの前にストアをリセット
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    
    // axios のモックをリセット
    vi.clearAllMocks();
    mockedAxios.defaults = { headers: { common: {} } };
  });

  describe('login', () => {
    it('ログインに成功する場合', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      const { login } = useAuthStore.getState();
      await login('test@example.com', 'password', true);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe('test-access-token');
      expect(state.refreshToken).toBe('test-refresh-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(mockedAxios.defaults.headers.common['Authorization']).toBe('Bearer test-access-token');
    });

    it('ログインに失敗する場合', async () => {
      const errorMessage = 'メールアドレスまたはパスワードが正しくありません';
      mockedAxios.post.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      const { login } = useAuthStore.getState();
      
      await expect(login('test@example.com', 'wrong-password')).rejects.toThrow();
      
      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('logout', () => {
    it('ログアウトが正常に動作する', () => {
      // 初期状態を設定
      useAuthStore.setState({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        isAuthenticated: true,
      });
      
      mockedAxios.defaults.headers.common['Authorization'] = 'Bearer test-token';
      
      const { logout } = useAuthStore.getState();
      logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.refreshToken).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('register', () => {
    it('登録に成功する場合', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, email: 'new@example.com', name: 'New User' },
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      const { register } = useAuthStore.getState();
      await register({
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
      });
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockResponse.data.user);
      expect(state.token).toBe('new-access-token');
      expect(state.refreshToken).toBe('new-refresh-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('登録に失敗する場合', async () => {
      const errorMessage = 'このメールアドレスは既に使用されています';
      mockedAxios.post.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      const { register } = useAuthStore.getState();
      
      await expect(register({
        email: 'existing@example.com',
        password: 'password',
        name: 'Test User',
      })).rejects.toThrow();
      
      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('refreshAccessToken', () => {
    it('トークンのリフレッシュに成功する場合', async () => {
      useAuthStore.setState({
        refreshToken: 'old-refresh-token',
      });
      
      const mockResponse = {
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);
      
      const { refreshAccessToken } = useAuthStore.getState();
      await refreshAccessToken();
      
      const state = useAuthStore.getState();
      expect(state.token).toBe('new-access-token');
      expect(state.refreshToken).toBe('new-refresh-token');
      expect(mockedAxios.defaults.headers.common['Authorization']).toBe('Bearer new-access-token');
    });

    it('リフレッシュトークンがない場合はエラーになる', async () => {
      useAuthStore.setState({
        refreshToken: null,
      });
      
      const { refreshAccessToken } = useAuthStore.getState();
      
      await expect(refreshAccessToken()).rejects.toThrow('No refresh token available');
    });

    it('トークンのリフレッシュに失敗した場合はログアウトする', async () => {
      useAuthStore.setState({
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        token: 'old-token',
        refreshToken: 'invalid-refresh-token',
        isAuthenticated: true,
      });
      
      mockedAxios.post.mockRejectedValue(new Error('Invalid refresh token'));
      
      const { refreshAccessToken } = useAuthStore.getState();
      
      await expect(refreshAccessToken()).rejects.toThrow();
      
      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.refreshToken).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('プロフィール更新に成功する場合', async () => {
      const updatedUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Updated User',
      };
      
      mockedAxios.put.mockResolvedValue({ data: updatedUser });
      
      const { updateProfile } = useAuthStore.getState();
      await updateProfile({ name: 'Updated User' });
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(updatedUser);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('プロフィール更新に失敗する場合', async () => {
      const errorMessage = 'プロフィールの更新に失敗しました';
      mockedAxios.put.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });
      
      const { updateProfile } = useAuthStore.getState();
      
      await expect(updateProfile({ name: 'Updated User' })).rejects.toThrow();
      
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('checkAuth', () => {
    it('認証チェックに成功する場合', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      
      useAuthStore.setState({
        token: 'valid-token',
      });
      
      mockedAxios.get.mockResolvedValue({ data: mockUser });
      
      const { checkAuth } = useAuthStore.getState();
      await checkAuth();
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('トークンがない場合は認証されない', async () => {
      useAuthStore.setState({
        token: null,
      });
      
      const { checkAuth } = useAuthStore.getState();
      await checkAuth();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('トークンが無効でリフレッシュも失敗する場合はログアウトする', async () => {
      useAuthStore.setState({
        token: 'invalid-token',
        refreshToken: 'invalid-refresh-token',
      });
      
      mockedAxios.get.mockRejectedValue(new Error('Invalid token'));
      mockedAxios.post.mockRejectedValue(new Error('Invalid refresh token'));
      
      const { checkAuth } = useAuthStore.getState();
      await checkAuth();
      
      const state = useAuthStore.getState();
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('エラーをクリアできる', () => {
      useAuthStore.setState({
        error: 'Test error',
      });
      
      const { clearError } = useAuthStore.getState();
      clearError();
      
      const state = useAuthStore.getState();
      expect(state.error).toBe(null);
    });
  });
});
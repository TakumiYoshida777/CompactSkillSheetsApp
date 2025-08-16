import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuthStore } from '../../../stores/authStore';
import { message } from 'antd';

// モック設定
vi.mock('../../../stores/authStore');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Ant Design messageモック
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  };
});

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // useAuthStore のモック
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
    });
    
    // getState のモック
    (useAuthStore as any).getState = vi.fn().mockReturnValue({
      user: null,
    });
  });

  it('ログインフォームが正しくレンダリングされる', () => {
    renderLogin();
    
    expect(screen.getByText('スキルシート管理システム')).toBeInTheDocument();
    expect(screen.getByText('アカウントにログインしてください')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /ログイン/i })[0]).toBeInTheDocument();
  });

  it('必須フィールドの検証エラーが表示される', async () => {
    renderLogin();
    
    const loginButton = screen.getAllByRole('button', { name: /ログイン/i })[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
    });
  });

  it('メールアドレスの形式検証が動作する', async () => {
    renderLogin();
    const user = userEvent.setup();
    
    const emailInput = screen.getByPlaceholderText('メールアドレス');
    await user.type(emailInput, 'invalid-email');
    
    const loginButton = screen.getAllByRole('button', { name: /ログイン/i })[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  it('パスワードの最小文字数検証が動作する', async () => {
    renderLogin();
    const user = userEvent.setup();
    
    const passwordInput = screen.getByPlaceholderText('パスワード');
    await user.type(passwordInput, 'short');
    
    const loginButton = screen.getAllByRole('button', { name: /ログイン/i })[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('パスワードは8文字以上である必要があります')).toBeInTheDocument();
    });
  });

  it('正しい認証情報でログインが成功する', async () => {
    mockLogin.mockResolvedValue(undefined);
    (useAuthStore as any).getState.mockReturnValue({
      user: { id: 1, email: 'test@example.com', roles: ['engineer'] },
    });
    
    renderLogin();
    const user = userEvent.setup();
    
    const emailInput = screen.getByPlaceholderText('メールアドレス');
    const passwordInput = screen.getByPlaceholderText('パスワード');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const loginButton = screen.getAllByRole('button', { name: /ログイン/i })[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', false);
      expect(message.success).toHaveBeenCalledWith('ログインに成功しました');
    });
  });

  it('ログインエラーが適切に処理される', async () => {
    const errorMessage = 'メールアドレスまたはパスワードが正しくありません';
    mockLogin.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });
    
    renderLogin();
    const user = userEvent.setup();
    
    const emailInput = screen.getByPlaceholderText('メールアドレス');
    const passwordInput = screen.getByPlaceholderText('パスワード');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    
    const loginButton = screen.getAllByRole('button', { name: /ログイン/i })[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('「ログイン情報を記憶する」チェックボックスが動作する', async () => {
    mockLogin.mockResolvedValue(undefined);
    
    renderLogin();
    const user = userEvent.setup();
    
    const rememberCheckbox = screen.getByRole('checkbox', { name: /ログイン情報を記憶する/i });
    await user.click(rememberCheckbox);
    
    const emailInput = screen.getByPlaceholderText('メールアドレス');
    const passwordInput = screen.getByPlaceholderText('パスワード');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const loginButton = screen.getAllByRole('button', { name: /ログイン/i })[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', true);
    });
  });

  it('ソーシャルログインボタンがクリック可能', () => {
    renderLogin();
    
    const googleButton = screen.getByRole('button', { name: /Googleでログイン/i });
    const githubButton = screen.getByRole('button', { name: /GitHubでログイン/i });
    
    fireEvent.click(googleButton);
    expect(message.info).toHaveBeenCalledWith('Googleログインは現在開発中です');
    
    fireEvent.click(githubButton);
    expect(message.info).toHaveBeenCalledWith('GitHubログインは現在開発中です');
  });

  it('新規登録とパスワードリセットのリンクが存在する', () => {
    renderLogin();
    
    expect(screen.getByText('新規登録')).toBeInTheDocument();
    expect(screen.getByText('パスワードを忘れた方')).toBeInTheDocument();
  });

  it('開発環境でデモアカウント情報が表示される', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    renderLogin();
    
    expect(screen.getByText('開発用デモアカウント:')).toBeInTheDocument();
    expect(screen.getByText('エンジニア: engineer@example.com / password123')).toBeInTheDocument();
    expect(screen.getByText('管理者: admin@example.com / password123')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });
});
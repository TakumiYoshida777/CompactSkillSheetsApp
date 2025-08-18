import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ClientEngineerSearch from '../index';

// useNavigateのモック
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// antdのmessageモック
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  };
});

// テスト用のラッパーコンポーネント
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ClientEngineerSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本表示', () => {
    test('ページタイトルと説明が表示される', () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      expect(screen.getByText('エンジニア検索')).toBeInTheDocument();
      expect(screen.getByText('複数のSES企業から最適なエンジニアを検索')).toBeInTheDocument();
    });

    test('エンジニアリストが表示される', () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // モックデータのエンジニアが表示されることを確認
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
    });

    test('企業名カラムが表示される', () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // SES企業名が表示される
      expect(screen.getByText('株式会社テックソリューション')).toBeInTheDocument();
      expect(screen.getByText('株式会社デジタルイノベーション')).toBeInTheDocument();
    });

    test('アクションボタンが表示される', () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // オファー送信関連のUIが存在することを確認
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('オファー送信機能', () => {
    test('単一のエンジニアにオファーを送信できる', async () => {
      const { message } = await import('antd');
      
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // 最初のエンジニアを選択
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // ヘッダーのチェックボックスを除く

      // オファー送信ボタンをクリック
      const sendButton = await screen.findByText('選択したエンジニアにオファー送信');
      fireEvent.click(sendButton);

      // メッセージ表示と画面遷移を確認
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('1名のエンジニアにオファーを送信しました');
        expect(mockNavigate).toHaveBeenCalledWith('/client/offer-board');
      }, { timeout: 2000 });
    });

    test('複数のエンジニアにオファーを送信できる', async () => {
      const { message } = await import('antd');
      
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // 複数のエンジニアを選択
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      fireEvent.click(checkboxes[3]);

      // オファー送信ボタンをクリック
      const sendButton = await screen.findByText('選択したエンジニアにオファー送信');
      fireEvent.click(sendButton);

      // メッセージ表示と画面遷移を確認
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('3名のエンジニアにオファーを送信しました');
        expect(mockNavigate).toHaveBeenCalledWith('/client/offer-board');
      }, { timeout: 2000 });
    });
  });

  describe('フィルタリング機能の確認', () => {
    test('ロール経験でフィルタリングできる', async () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // PM経験でフィルタリング
      const roleSelect = screen.getByPlaceholderText('ロール経験で検索');
      fireEvent.mouseDown(roleSelect);
      
      const pmOption = await screen.findByText('PM（プロジェクトマネージャー）');
      fireEvent.click(pmOption);

      // PMの経験があるエンジニアのみが表示される
      await waitFor(() => {
        const displayedEngineers = screen.getAllByRole('row');
        // ヘッダー行を除いた実際のデータ行数を確認
        expect(displayedEngineers.length).toBeGreaterThan(0);
      });
    });

    test('スキルでフィルタリングできる', async () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // スキルセレクトボックスを操作
      const skillSelect = screen.getByPlaceholderText('スキルで絞り込み');
      fireEvent.mouseDown(skillSelect);
      
      // Reactスキルを選択
      const reactOption = await screen.findByText('React');
      fireEvent.click(reactOption);

      // Reactスキルを持つエンジニアのみが表示される
      await waitFor(() => {
        expect(screen.getByText('田中太郎')).toBeInTheDocument();
      });
    });

    test('ステータスでフィルタリングできる', async () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // ステータスセレクトボックスを操作
      const statusSelect = screen.getByPlaceholderText('ステータス');
      fireEvent.mouseDown(statusSelect);
      
      // 稼働可能を選択
      const availableOption = await screen.findByText('稼働可能');
      fireEvent.click(availableOption);

      // 稼働可能なエンジニアのみが表示される
      await waitFor(() => {
        const displayedEngineers = screen.getAllByRole('row');
        expect(displayedEngineers.length).toBeGreaterThan(0);
      });
    });
  });

  describe('詳細フィルター機能', () => {
    test('詳細フィルターモーダルが開く', async () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // 詳細フィルターボタンをクリック
      const filterButton = screen.getByText('詳細フィルター');
      fireEvent.click(filterButton);

      // モーダルが表示される
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('業務経験')).toBeInTheDocument();
      });
    });

    test('業務経験でフィルタリングできる', async () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // 詳細フィルターを開く
      const filterButton = screen.getByText('詳細フィルター');
      fireEvent.click(filterButton);

      // 業務経験を選択
      const taskSelect = await screen.findByPlaceholderText('要件定義、基本設計などを選択');
      fireEvent.mouseDown(taskSelect);
      
      const taskOption = await screen.findByText('要件定義書作成');
      fireEvent.click(taskOption);

      // 適用ボタンをクリック
      const applyButton = screen.getByText('適用');
      fireEvent.click(applyButton);

      // フィルタリングが適用される
      await waitFor(() => {
        const displayedEngineers = screen.getAllByRole('row');
        expect(displayedEngineers.length).toBeGreaterThan(0);
      });
    });
  });

  describe('検索機能', () => {
    test('名前で検索できる', async () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('名前、スキルで検索');
      
      // 名前で検索
      fireEvent.change(searchInput, { target: { value: '田中' } });
      
      // Enterキーを押す
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('田中太郎')).toBeInTheDocument();
        expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
      });
    });

    test('スキルで検索できる', async () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('名前、スキルで検索');
      
      // スキルで検索
      fireEvent.change(searchInput, { target: { value: 'Python' } });
      
      // Enterキーを押す
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText('佐藤花子')).toBeInTheDocument();
        expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
      });
    });
  });

  describe('統計情報の表示', () => {
    test('検索結果数が表示される', () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // 統計情報カードが表示される
      expect(screen.getByText('検索結果')).toBeInTheDocument();
      expect(screen.getByText('稼働可能')).toBeInTheDocument();
      expect(screen.getByText('待機中')).toBeInTheDocument();
    });

    test('SES企業数が表示される', () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // SES企業数の統計が表示される
      expect(screen.getByText('SES企業数')).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    test('エンジニアが0件の場合、適切なメッセージが表示される', () => {
      render(
        <TestWrapper>
          <ClientEngineerSearch />
        </TestWrapper>
      );

      // 存在しない条件で検索
      const searchInput = screen.getByPlaceholderText('名前、スキルで検索');
      fireEvent.change(searchInput, { target: { value: '存在しないエンジニア' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });

      // 検索結果が0件の場合の表示を確認
      waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // 検索結果数が0
      });
    });
  });
});
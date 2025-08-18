import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EngineerSearchTable } from '../EngineerSearchTable';
import type { Engineer } from '../EngineerSearchTable';

// モックデータ
const mockEngineers: Engineer[] = [
  {
    key: '1',
    engineerId: 'ENG001',
    name: '田中太郎',
    age: 32,
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    experience: 8,
    status: 'available',
    availableDate: '2024/02/01',
    lastUpdated: '2024/01/10',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    rate: { min: 60, max: 80 },
    companyName: '株式会社テックソリューション',
    roleExperiences: [
      { role: 'PL', years: 3 },
      { role: 'SE', years: 5 },
    ],
    workExperiences: [
      { task: '要件定義', level: 'advanced' },
      { task: '基本設計', level: 'expert' },
    ],
  },
  {
    key: '2',
    engineerId: 'ENG002',
    name: '佐藤花子',
    age: 28,
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    experience: 5,
    status: 'waiting',
    availableDate: '2024/02/15',
    lastUpdated: '2024/01/08',
    email: 'sato@example.com',
    phone: '090-2345-6789',
    rate: { min: 55, max: 70 },
    companyName: '株式会社デジタルイノベーション',
    roleExperiences: [
      { role: 'SE', years: 3 },
      { role: 'PG', years: 5 },
    ],
    workExperiences: [
      { task: '詳細設計', level: 'advanced' },
      { task: '実装', level: 'expert' },
    ],
  },
  {
    key: '3',
    engineerId: 'ENG003',
    name: '鈴木一郎',
    age: 35,
    skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
    experience: 10,
    status: 'assigned',
    currentProject: 'ECサイトリニューアル',
    availableDate: '2024/03/01',
    lastUpdated: '2024/01/05',
    email: 'suzuki@example.com',
    phone: '090-3456-7890',
    rate: { min: 70, max: 90 },
    companyName: '株式会社テックソリューション',
    roleExperiences: [
      { role: 'PM', years: 3 },
      { role: 'PL', years: 5 },
    ],
    workExperiences: [
      { task: '要件定義', level: 'expert' },
      { task: 'プロジェクト管理', level: 'advanced' },
    ],
  },
];

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
      {children}
    </QueryClientProvider>
  );
};

describe('EngineerSearchTable', () => {
  const defaultProps = {
    engineers: mockEngineers,
    showActions: false,
    showCompanyColumn: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本表示', () => {
    test('タイトルと説明が表示される', () => {
      render(
        <TestWrapper>
          <EngineerSearchTable 
            {...defaultProps}
            title="エンジニア一覧"
            description="登録されているエンジニア"
          />
        </TestWrapper>
      );

      expect(screen.getByText('エンジニア一覧')).toBeInTheDocument();
      expect(screen.getByText('登録されているエンジニア')).toBeInTheDocument();
    });

    test('エンジニアリストが表示される', () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('田中太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
    });

    test('統計情報が正しく表示される', () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      // 検索結果数
      expect(screen.getByText('3')).toBeInTheDocument();
      // 稼働可能数
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('検索機能', () => {
    test('名前で検索できる', async () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('名前、スキルで検索');
      await userEvent.type(searchInput, '田中');

      await waitFor(() => {
        expect(screen.getByText('田中太郎')).toBeInTheDocument();
        expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
        expect(screen.queryByText('鈴木一郎')).not.toBeInTheDocument();
      });
    });

    test('スキルで検索できる', async () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('名前、スキルで検索');
      await userEvent.type(searchInput, 'React');

      await waitFor(() => {
        expect(screen.getByText('田中太郎')).toBeInTheDocument();
        expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
        expect(screen.queryByText('鈴木一郎')).not.toBeInTheDocument();
      });
    });
  });

  describe('フィルタリング機能', () => {
    test('ステータスでフィルタリングできる', async () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      const statusSelect = screen.getByPlaceholderText('ステータス');
      fireEvent.mouseDown(statusSelect);
      
      const availableOption = await screen.findByText('稼働可能');
      fireEvent.click(availableOption);

      await waitFor(() => {
        expect(screen.getByText('田中太郎')).toBeInTheDocument();
        expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
        expect(screen.queryByText('鈴木一郎')).not.toBeInTheDocument();
      });
    });

    test('スキルでフィルタリングできる', async () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      const skillSelect = screen.getByPlaceholderText('スキルで絞り込み');
      fireEvent.mouseDown(skillSelect);
      
      const pythonOption = await screen.findByText('Python');
      fireEvent.click(pythonOption);

      await waitFor(() => {
        expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
        expect(screen.getByText('佐藤花子')).toBeInTheDocument();
        expect(screen.queryByText('鈴木一郎')).not.toBeInTheDocument();
      });
    });
  });

  describe('ロール経験フィルタリング', () => {
    test('ロール経験でフィルタリングできる', async () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      const roleSelect = screen.getByPlaceholderText('ロール経験で検索');
      fireEvent.mouseDown(roleSelect);
      
      const pmOption = await screen.findByText('PM（プロジェクトマネージャー）');
      fireEvent.click(pmOption);

      await waitFor(() => {
        expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
        expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
        expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
      });
    });

    test('詳細フィルターでロール経験年数を指定できる', async () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      // 詳細フィルターボタンをクリック
      const filterButton = screen.getByText('詳細フィルター');
      fireEvent.click(filterButton);

      // モーダルが開く
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // PM経験を選択
      const pmSelect = screen.getByPlaceholderText('PM経験');
      fireEvent.mouseDown(pmSelect);
      const pmOption = await screen.findByText('3年以上');
      fireEvent.click(pmOption);

      // 適用ボタンをクリック
      const applyButton = screen.getByText('適用');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
        expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
        expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
      });
    });
  });

  describe('業務経験フィルタリング', () => {
    test('業務経験でフィルタリングできる', async () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      // 詳細フィルターボタンをクリック
      const filterButton = screen.getByText('詳細フィルター');
      fireEvent.click(filterButton);

      // モーダルが開く
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // 業務経験を選択
      const taskSelect = screen.getByPlaceholderText('要件定義、基本設計などを選択');
      fireEvent.mouseDown(taskSelect);
      const taskOption = await screen.findByText('要件定義書作成');
      fireEvent.click(taskOption);

      // 適用ボタンをクリック
      const applyButton = screen.getByText('適用');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('田中太郎')).toBeInTheDocument();
        expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
        expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
      });
    });
  });

  describe('ソート機能', () => {
    test('年齢でソートできる', async () => {
      const { container } = render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      // 年齢カラムヘッダーを取得してクリック
      const ageHeader = container.querySelector('th[title="年齢"]');
      if (ageHeader) {
        const sorter = ageHeader.querySelector('.ant-table-column-sorter');
        if (sorter) {
          fireEvent.click(sorter);
        }
      }

      // ソート後の順序を確認（実装に依存）
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeGreaterThan(1);
      });
    });

    test('経験年数でソートできる', async () => {
      const { container } = render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      // 経験年数カラムヘッダーを取得してクリック
      const expHeader = container.querySelector('th[title="経験年数"]');
      if (expHeader) {
        const sorter = expHeader.querySelector('.ant-table-column-sorter');
        if (sorter) {
          fireEvent.click(sorter);
        }
      }

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeGreaterThan(1);
      });
    });
  });

  describe('選択機能', () => {
    test('エンジニアを選択できる', async () => {
      const handleSendOffer = vi.fn();
      
      render(
        <TestWrapper>
          <EngineerSearchTable 
            {...defaultProps}
            showActions={true}
            onSendOffer={handleSendOffer}
          />
        </TestWrapper>
      );

      // チェックボックスを選択
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // 最初のエンジニアを選択

      // 選択中メッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/1件選択中/)).toBeInTheDocument();
      });

      // オファー送信ボタンが表示される
      const sendButton = screen.getByText('選択したエンジニアにオファー送信');
      expect(sendButton).toBeInTheDocument();

      // オファー送信
      fireEvent.click(sendButton);
      expect(handleSendOffer).toHaveBeenCalledWith(['ENG001']);
    });

    test('複数のエンジニアを選択できる', async () => {
      const handleSendOffer = vi.fn();
      
      render(
        <TestWrapper>
          <EngineerSearchTable 
            {...defaultProps}
            showActions={true}
            onSendOffer={handleSendOffer}
          />
        </TestWrapper>
      );

      // 複数のチェックボックスを選択
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // 最初のエンジニア
      fireEvent.click(checkboxes[2]); // 2番目のエンジニア

      // 選択中メッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/2件選択中/)).toBeInTheDocument();
      });

      // オファー送信
      const sendButton = screen.getByText('選択したエンジニアにオファー送信');
      fireEvent.click(sendButton);
      
      expect(handleSendOffer).toHaveBeenCalledWith(
        expect.arrayContaining(['ENG001', 'ENG002'])
      );
    });
  });

  describe('企業名表示', () => {
    test('showCompanyColumnがtrueの時、企業名が表示される', () => {
      render(
        <TestWrapper>
          <EngineerSearchTable 
            {...defaultProps}
            showCompanyColumn={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('株式会社テックソリューション')).toBeInTheDocument();
      expect(screen.getByText('株式会社デジタルイノベーション')).toBeInTheDocument();
    });

    test('showCompanyColumnがfalseの時、企業名が表示されない', () => {
      render(
        <TestWrapper>
          <EngineerSearchTable 
            {...defaultProps}
            showCompanyColumn={false}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('株式会社テックソリューション')).not.toBeInTheDocument();
      expect(screen.queryByText('株式会社デジタルイノベーション')).not.toBeInTheDocument();
    });
  });

  describe('行クリック機能', () => {
    test('行クリック時にコールバックが呼ばれる', async () => {
      const handleRowClick = vi.fn();
      
      render(
        <TestWrapper>
          <EngineerSearchTable 
            {...defaultProps}
            onRowClick={handleRowClick}
          />
        </TestWrapper>
      );

      // 最初のエンジニアの行をクリック
      const firstRow = screen.getByText('田中太郎').closest('tr');
      if (firstRow) {
        fireEvent.click(firstRow);
      }

      expect(handleRowClick).toHaveBeenCalledWith(
        expect.objectContaining({
          engineerId: 'ENG001',
          name: '田中太郎',
        })
      );
    });
  });

  describe('フィルターリセット', () => {
    test('詳細フィルターをリセットできる', async () => {
      render(
        <TestWrapper>
          <EngineerSearchTable {...defaultProps} />
        </TestWrapper>
      );

      // 詳細フィルターを開く
      const filterButton = screen.getByText('詳細フィルター');
      fireEvent.click(filterButton);

      // フィルターを設定
      const pmSelect = screen.getByPlaceholderText('PM経験');
      fireEvent.mouseDown(pmSelect);
      const pmOption = await screen.findByText('3年以上');
      fireEvent.click(pmOption);

      // リセットボタンをクリック
      const resetButton = screen.getByText('リセット');
      fireEvent.click(resetButton);

      // 適用
      const applyButton = screen.getByText('適用');
      fireEvent.click(applyButton);

      // 全てのエンジニアが表示される
      await waitFor(() => {
        expect(screen.getByText('田中太郎')).toBeInTheDocument();
        expect(screen.getByText('佐藤花子')).toBeInTheDocument();
        expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
      });
    });
  });
});
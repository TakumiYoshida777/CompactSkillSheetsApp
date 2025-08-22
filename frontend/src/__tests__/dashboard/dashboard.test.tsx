import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard/Dashboard';
import { dashboardAPI } from '../../api/ses/dashboardApi';
import { notificationAPI } from '../../api/common/notificationApi';

// モック設定
jest.mock('../../api/ses/dashboardApi');
jest.mock('../../api/common/notificationApi');

const mockDashboardAPI = dashboardAPI as jest.Mocked<typeof dashboardAPI>;
const mockNotificationAPI = notificationAPI as jest.Mocked<typeof notificationAPI>;

// テスト用のQueryClient作成
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
});

// テスト用のラッパーコンポーネント
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    // モックデータのセットアップ
    mockDashboardAPI.getDashboardData.mockResolvedValue({
      kpi: {
        totalEngineers: 45,
        activeEngineers: 32,
        waitingEngineers: 13,
        monthlyRevenue: 19200000,
        acceptanceRate: 65
      },
      approaches: {
        current: 15,
        previous: 12,
        growth: 25
      },
      recentActivities: [
        {
          type: 'approach',
          title: '田中太郎へのアプローチ',
          status: 'pending',
          createdAt: new Date()
        }
      ]
    });

    mockDashboardAPI.getEngineerStatistics.mockResolvedValue({
      statusDistribution: [
        { status: 'ACTIVE', count: 32 },
        { status: 'WAITING', count: 13 }
      ],
      upcomingEngineers: [],
      skillDistribution: [
        { skillName: 'JavaScript', count: 28 },
        { skillName: 'TypeScript', count: 25 }
      ]
    });

    mockDashboardAPI.getApproachStatistics.mockResolvedValue({
      statusDistribution: [
        { status: 'PENDING', count: 12 }
      ],
      dailyTrend: [],
      topClients: [
        { clientName: '株式会社ABC', count: 15 }
      ]
    });

    mockNotificationAPI.getUnreadCount.mockResolvedValue(5);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('ダッシュボードが正常にレンダリングされる', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // ローディング状態の確認
    expect(screen.getByText('データを読み込み中...')).toBeInTheDocument();

    // データロード後の表示確認
    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });

    // KPI表示の確認
    await waitFor(() => {
      expect(screen.getByText('エンジニア総数')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('稼働中')).toBeInTheDocument();
      expect(screen.getByText('32')).toBeInTheDocument();
      expect(screen.getByText('待機中')).toBeInTheDocument();
      expect(screen.getByText('13')).toBeInTheDocument();
    });
  });

  test('エラー時にエラーメッセージが表示される', async () => {
    mockDashboardAPI.getDashboardData.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('エラー')).toBeInTheDocument();
      expect(screen.getByText('データの取得に失敗しました。ページを更新してください。')).toBeInTheDocument();
    });
  });

  test('アプローチ統計が正しく表示される', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('今月のアプローチ活動')).toBeInTheDocument();
      expect(screen.getByText('アプローチ数')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  test('最近のアクティビティが表示される', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('最近のアクティビティ')).toBeInTheDocument();
      expect(screen.getByText('田中太郎へのアプローチ')).toBeInTheDocument();
    });
  });

  test('クイックアクションボタンが表示される', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('クイックアクション')).toBeInTheDocument();
      expect(screen.getByText('エンジニア登録')).toBeInTheDocument();
      expect(screen.getByText('アプローチ作成')).toBeInTheDocument();
      expect(screen.getByText('エンジニア一覧')).toBeInTheDocument();
      expect(screen.getByText('データ更新')).toBeInTheDocument();
    });
  });
});
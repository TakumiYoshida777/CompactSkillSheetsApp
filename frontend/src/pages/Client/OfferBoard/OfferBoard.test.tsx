import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { OfferBoard } from './index';
import * as offerBoardHooks from '@/hooks/useOfferBoard';
import * as offerStore from '@/stores/offerStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('OfferBoard', () => {
  const mockBoardData = {
    summary: {
      totalOffers: 45,
      monthlyOffers: 12,
      weeklyOffers: 5,
      todayOffers: 2,
      pendingResponses: 8,
      acceptanceRate: 35,
    },
    engineers: [
      {
        id: '1',
        name: '山田太郎',
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: 5,
        availability: '即日',
        hourlyRate: 5000,
        lastOfferDate: null,
        offerStatus: 'none',
      },
      {
        id: '2',
        name: '鈴木花子',
        skills: ['Vue.js', 'Python', 'AWS'],
        experience: 3,
        availability: '2週間後',
        hourlyRate: 4500,
        lastOfferDate: '2025-01-10',
        offerStatus: 'pending',
      },
      {
        id: '3',
        name: '佐藤次郎',
        skills: ['Java', 'Spring Boot', 'PostgreSQL'],
        experience: 7,
        availability: '1ヶ月後',
        hourlyRate: 6000,
        lastOfferDate: '2025-01-05',
        offerStatus: 'declined',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期表示', () => {
    it('オファーサマリーカードが表示される', async () => {
      vi.spyOn(offerBoardHooks, 'useOfferBoard').mockReturnValue({
        data: mockBoardData,
        isLoading: false,
        error: null,
      });

      render(<OfferBoard />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('オファー統計')).toBeInTheDocument();
        expect(screen.getByText('45件')).toBeInTheDocument();
        expect(screen.getByText('今月: 12件')).toBeInTheDocument();
        expect(screen.getByText('承諾率: 35%')).toBeInTheDocument();
      });
    });

    it('エンジニア一覧テーブルが表示される', async () => {
      vi.spyOn(offerBoardHooks, 'useOfferBoard').mockReturnValue({
        data: mockBoardData,
        isLoading: false,
        error: null,
      });

      render(<OfferBoard />, { wrapper });

      await waitFor(() => {
        expect(screen.getByText('オファー可能エンジニア一覧')).toBeInTheDocument();
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.getByText('鈴木花子')).toBeInTheDocument();
        expect(screen.getByText('佐藤次郎')).toBeInTheDocument();
      });
    });

    it('ローディング状態が表示される', () => {
      vi.spyOn(offerBoardHooks, 'useOfferBoard').mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<OfferBoard />, { wrapper });

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('エラー状態が表示される', () => {
      vi.spyOn(offerBoardHooks, 'useOfferBoard').mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('データの取得に失敗しました'),
      });

      render(<OfferBoard />, { wrapper });

      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  describe('エンジニア選択機能', () => {
    const mockToggleEngineer = vi.fn();
    const mockSelectAllEngineers = vi.fn();
    const mockClearSelection = vi.fn();

    beforeEach(() => {
      vi.spyOn(offerBoardHooks, 'useOfferBoard').mockReturnValue({
        data: mockBoardData,
        isLoading: false,
        error: null,
      });

      vi.spyOn(offerStore, 'useOfferStore').mockReturnValue({
        selectedEngineers: [],
        toggleEngineer: mockToggleEngineer,
        selectAllEngineers: mockSelectAllEngineers,
        clearSelection: mockClearSelection,
      });
    });

    it('チェックボックスをクリックするとエンジニアが選択される', async () => {
      render(<OfferBoard />, { wrapper });

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // 最初のエンジニアを選択

      expect(mockToggleEngineer).toHaveBeenCalledWith('1');
    });

    it('全選択ボタンで全エンジニアが選択される', async () => {
      render(<OfferBoard />, { wrapper });

      const selectAllButton = screen.getByText('全て選択');
      fireEvent.click(selectAllButton);

      expect(mockSelectAllEngineers).toHaveBeenCalledWith(['1', '2', '3']);
    });

    it('選択をクリアボタンで選択が解除される', async () => {
      vi.spyOn(offerStore, 'useOfferStore').mockReturnValue({
        selectedEngineers: ['1', '2'],
        toggleEngineer: mockToggleEngineer,
        selectAllEngineers: mockSelectAllEngineers,
        clearSelection: mockClearSelection,
      });

      render(<OfferBoard />, { wrapper });

      const clearButton = screen.getByText('選択をクリア');
      fireEvent.click(clearButton);

      expect(mockClearSelection).toHaveBeenCalled();
    });

    it('選択したエンジニア数が表示される', () => {
      vi.spyOn(offerStore, 'useOfferStore').mockReturnValue({
        selectedEngineers: ['1', '2'],
        toggleEngineer: mockToggleEngineer,
        selectAllEngineers: mockSelectAllEngineers,
        clearSelection: mockClearSelection,
      });

      render(<OfferBoard />, { wrapper });

      expect(screen.getByText('2名選択中')).toBeInTheDocument();
    });
  });

  describe('オファー送信機能', () => {
    beforeEach(() => {
      vi.spyOn(offerBoardHooks, 'useOfferBoard').mockReturnValue({
        data: mockBoardData,
        isLoading: false,
        error: null,
      });

      vi.spyOn(offerStore, 'useOfferStore').mockReturnValue({
        selectedEngineers: ['1', '2'],
        toggleEngineer: vi.fn(),
        selectAllEngineers: vi.fn(),
        clearSelection: vi.fn(),
      });
    });

    it('エンジニアが選択されていない場合、オファー送信ボタンが無効になる', () => {
      vi.spyOn(offerStore, 'useOfferStore').mockReturnValue({
        selectedEngineers: [],
        toggleEngineer: vi.fn(),
        selectAllEngineers: vi.fn(),
        clearSelection: vi.fn(),
      });

      render(<OfferBoard />, { wrapper });

      const sendButton = screen.getByRole('button', { name: /オファー送信/ });
      expect(sendButton).toBeDisabled();
    });

    it('エンジニアが選択されている場合、オファー送信ボタンが有効になる', () => {
      render(<OfferBoard />, { wrapper });

      const sendButton = screen.getByRole('button', { name: /オファー送信/ });
      expect(sendButton).not.toBeDisabled();
    });

    it('オファー送信ボタンをクリックするとダイアログが表示される', () => {
      render(<OfferBoard />, { wrapper });

      const sendButton = screen.getByRole('button', { name: /オファー送信/ });
      fireEvent.click(sendButton);

      expect(screen.getByTestId('offer-dialog')).toBeInTheDocument();
      expect(screen.getByText('オファー送信')).toBeInTheDocument();
      expect(screen.getByText('選択したエンジニア: 2名')).toBeInTheDocument();
    });
  });

  describe('フィルター機能', () => {
    beforeEach(() => {
      vi.spyOn(offerBoardHooks, 'useOfferBoard').mockReturnValue({
        data: mockBoardData,
        isLoading: false,
        error: null,
      });
    });

    it('オファーステータスでフィルターできる', async () => {
      render(<OfferBoard />, { wrapper });

      const filterSelect = screen.getByTestId('status-filter');
      fireEvent.change(filterSelect, { target: { value: 'none' } });

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.queryByText('鈴木花子')).not.toBeInTheDocument();
        expect(screen.queryByText('佐藤次郎')).not.toBeInTheDocument();
      });
    });

    it('スキルでフィルターできる', async () => {
      render(<OfferBoard />, { wrapper });

      const skillFilter = screen.getByPlaceholderText('スキルで検索');
      fireEvent.change(skillFilter, { target: { value: 'React' } });

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.queryByText('鈴木花子')).not.toBeInTheDocument();
        expect(screen.queryByText('佐藤次郎')).not.toBeInTheDocument();
      });
    });

    it('稼働可能時期でフィルターできる', async () => {
      render(<OfferBoard />, { wrapper });

      const availabilityFilter = screen.getByTestId('availability-filter');
      fireEvent.change(availabilityFilter, { target: { value: 'immediate' } });

      await waitFor(() => {
        expect(screen.getByText('山田太郎')).toBeInTheDocument();
        expect(screen.queryByText('鈴木花子')).not.toBeInTheDocument();
        expect(screen.queryByText('佐藤次郎')).not.toBeInTheDocument();
      });
    });
  });

  describe('ソート機能', () => {
    beforeEach(() => {
      vi.spyOn(offerBoardHooks, 'useOfferBoard').mockReturnValue({
        data: mockBoardData,
        isLoading: false,
        error: null,
      });
    });

    it('名前でソートできる', () => {
      render(<OfferBoard />, { wrapper });

      const nameHeader = screen.getByText('エンジニア名');
      fireEvent.click(nameHeader);

      const names = screen.getAllByTestId('engineer-name');
      expect(names[0]).toHaveTextContent('佐藤次郎');
      expect(names[1]).toHaveTextContent('鈴木花子');
      expect(names[2]).toHaveTextContent('山田太郎');
    });

    it('経験年数でソートできる', () => {
      render(<OfferBoard />, { wrapper });

      const experienceHeader = screen.getByText('経験年数');
      fireEvent.click(experienceHeader);

      const experiences = screen.getAllByTestId('engineer-experience');
      expect(experiences[0]).toHaveTextContent('7年');
      expect(experiences[1]).toHaveTextContent('5年');
      expect(experiences[2]).toHaveTextContent('3年');
    });

    it('単価でソートできる', () => {
      render(<OfferBoard />, { wrapper });

      const rateHeader = screen.getByText('単価');
      fireEvent.click(rateHeader);

      const rates = screen.getAllByTestId('engineer-rate');
      expect(rates[0]).toHaveTextContent('¥6,000');
      expect(rates[1]).toHaveTextContent('¥5,000');
      expect(rates[2]).toHaveTextContent('¥4,500');
    });
  });

  describe('レスポンシブ対応', () => {
    it('モバイルビューでカード形式で表示される', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<OfferBoard />, { wrapper });

      expect(screen.getByTestId('mobile-view')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-view')).not.toBeInTheDocument();
    });

    it('タブレットビューで簡略テーブルが表示される', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<OfferBoard />, { wrapper });

      expect(screen.getByTestId('tablet-view')).toBeInTheDocument();
    });

    it('デスクトップビューで完全なテーブルが表示される', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<OfferBoard />, { wrapper });

      expect(screen.getByTestId('desktop-view')).toBeInTheDocument();
    });
  });
});
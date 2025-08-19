import { renderHook, act, waitFor } from '@testing-library/react';
import { useBusinessPartnerStore } from '../useBusinessPartnerStore';
import { BusinessPartnerService } from '../../services/businessPartnerService';
import type {
  BusinessPartner,
  BusinessPartnerListResponse,
  BusinessPartnerDetailResponse,
  ClientUser,
  NGListEntry,
  AccessPermission,
} from '../../services/businessPartnerService';

// BusinessPartnerServiceをモック化
jest.mock('../../services/businessPartnerService');

describe('useBusinessPartnerStore', () => {
  let mockService: jest.Mocked<BusinessPartnerService>;

  beforeEach(() => {
    // ストアの状態をリセット
    const { result } = renderHook(() => useBusinessPartnerStore());
    act(() => {
      result.current.clearError();
      useBusinessPartnerStore.setState({
        partners: [],
        currentPartner: null,
        clientUsers: [],
        ngList: [],
        accessPermission: null,
        totalCount: 0,
        currentPage: 1,
        pageSize: 10,
        isLoading: false,
        error: null,
      });
    });

    // モックをリセット
    mockService = new BusinessPartnerService() as jest.Mocked<BusinessPartnerService>;
    (BusinessPartnerService as jest.Mock).mockImplementation(() => mockService);
  });

  describe('fetchBusinessPartners', () => {
    it('取引先一覧を取得してストアに保存できること', async () => {
      const mockResponse: BusinessPartnerListResponse = {
        partners: [
          {
            id: '1',
            companyName: 'テスト企業',
            companyNameKana: 'テストキギョウ',
            industry: 'IT',
            postalCode: '100-0001',
            prefecture: '東京都',
            address: '千代田区',
            phoneNumber: '03-1234-5678',
            faxNumber: null,
            email: 'test@example.com',
            website: null,
            representativeName: '山田太郎',
            representativeNameKana: 'ヤマダタロウ',
            representativePosition: null,
            establishedDate: null,
            capital: null,
            employeeCount: null,
            fiscalMonth: null,
            contractType: 'SES',
            paymentTerms: null,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10,
      };

      mockService.getBusinessPartners = jest.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.fetchBusinessPartners();
      });

      expect(result.current.partners).toEqual(mockResponse.partners);
      expect(result.current.totalCount).toBe(1);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('エラー時にエラー状態を設定すること', async () => {
      const errorMessage = 'Network error';
      mockService.getBusinessPartners = jest.fn().mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.fetchBusinessPartners();
      });

      expect(result.current.partners).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('fetchBusinessPartner', () => {
    it('特定の取引先詳細を取得できること', async () => {
      const mockPartner: BusinessPartner = {
        id: '1',
        companyName: 'テスト企業',
        companyNameKana: 'テストキギョウ',
        industry: 'IT',
        postalCode: '100-0001',
        prefecture: '東京都',
        address: '千代田区',
        phoneNumber: '03-1234-5678',
        faxNumber: null,
        email: 'test@example.com',
        website: null,
        representativeName: '山田太郎',
        representativeNameKana: 'ヤマダタロウ',
        representativePosition: null,
        establishedDate: null,
        capital: null,
        employeeCount: null,
        fiscalMonth: null,
        contractType: 'SES',
        paymentTerms: null,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse: BusinessPartnerDetailResponse = {
        partner: mockPartner,
        clientUsersCount: 5,
        activeProjectsCount: 3,
        totalTransactionAmount: 10000000,
        lastTransactionDate: '2024-01-01',
      };

      mockService.getBusinessPartner = jest.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.fetchBusinessPartner('1');
      });

      expect(result.current.currentPartner).toEqual(mockResponse);
      expect(mockService.getBusinessPartner).toHaveBeenCalledWith('1');
    });
  });

  describe('createBusinessPartner', () => {
    it('新規取引先を作成できること', async () => {
      const createDto = {
        companyName: '新規企業',
        companyNameKana: 'シンキキギョウ',
        industry: 'IT',
        postalCode: '100-0001',
        prefecture: '東京都',
        address: '千代田区',
        phoneNumber: '03-1234-5678',
        email: 'new@example.com',
        representativeName: '鈴木一郎',
        representativeNameKana: 'スズキイチロウ',
        contractType: 'SES' as const,
      };

      const mockCreated: BusinessPartner = {
        id: '2',
        ...createDto,
        faxNumber: null,
        website: null,
        representativePosition: null,
        establishedDate: null,
        capital: null,
        employeeCount: null,
        fiscalMonth: null,
        paymentTerms: null,
        status: 'active',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockService.createBusinessPartner = jest.fn().mockResolvedValue(mockCreated);

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.createBusinessPartner(createDto);
      });

      expect(mockService.createBusinessPartner).toHaveBeenCalledWith(createDto);
      // 作成後は再フェッチされることを想定
    });
  });

  describe('updateBusinessPartner', () => {
    it('取引先情報を更新できること', async () => {
      const partnerId = '1';
      const updateDto = {
        companyName: '更新企業',
        email: 'updated@example.com',
      };

      const mockUpdated: BusinessPartner = {
        id: partnerId,
        companyName: '更新企業',
        companyNameKana: 'コウシンキギョウ',
        industry: 'IT',
        postalCode: '100-0001',
        prefecture: '東京都',
        address: '千代田区',
        phoneNumber: '03-1234-5678',
        faxNumber: null,
        email: 'updated@example.com',
        website: null,
        representativeName: '山田太郎',
        representativeNameKana: 'ヤマダタロウ',
        representativePosition: null,
        establishedDate: null,
        capital: null,
        employeeCount: null,
        fiscalMonth: null,
        contractType: 'SES',
        paymentTerms: null,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockService.updateBusinessPartner = jest.fn().mockResolvedValue(mockUpdated);

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.updateBusinessPartner(partnerId, updateDto);
      });

      expect(mockService.updateBusinessPartner).toHaveBeenCalledWith(partnerId, updateDto);
    });
  });

  describe('fetchClientUsers', () => {
    it('取引先ユーザー一覧を取得できること', async () => {
      const partnerId = '1';
      const mockUsers: ClientUser[] = [
        {
          id: 'user1',
          businessPartnerId: partnerId,
          name: 'ユーザー1',
          nameKana: 'ユーザー1',
          email: 'user1@example.com',
          phoneNumber: '090-1234-5678',
          department: '営業部',
          position: '課長',
          role: 'admin',
          isActive: true,
          lastLoginAt: '2024-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockService.getClientUsers = jest.fn().mockResolvedValue(mockUsers);

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.fetchClientUsers(partnerId);
      });

      expect(result.current.clientUsers).toEqual(mockUsers);
      expect(mockService.getClientUsers).toHaveBeenCalledWith(partnerId);
    });
  });

  describe('fetchNGList', () => {
    it('NGリストを取得できること', async () => {
      const partnerId = '1';
      const mockNGList: NGListEntry[] = [
        {
          id: 'ng1',
          businessPartnerId: partnerId,
          engineerId: 'eng1',
          engineerName: 'エンジニア1',
          reason: 'performance_issue',
          reasonDetail: 'パフォーマンスに問題あり',
          blockedDate: '2024-01-01',
          blockedBy: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockService.getNGList = jest.fn().mockResolvedValue(mockNGList);

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.fetchNGList(partnerId);
      });

      expect(result.current.ngList).toEqual(mockNGList);
      expect(mockService.getNGList).toHaveBeenCalledWith(partnerId);
    });
  });

  describe('addToNGList', () => {
    it('NGリストにエンジニアを追加できること', async () => {
      const partnerId = '1';
      const createDto = {
        engineerId: 'eng2',
        engineerName: 'エンジニア2',
        reason: 'skill_mismatch',
        reasonDetail: 'スキル不一致',
      };

      const mockResponse: NGListEntry = {
        id: 'ng2',
        businessPartnerId: partnerId,
        ...createDto,
        blockedDate: '2024-01-02',
        blockedBy: 'admin',
        createdAt: '2024-01-02T00:00:00Z',
      };

      mockService.addToNGList = jest.fn().mockResolvedValue(mockResponse);
      mockService.getNGList = jest.fn().mockResolvedValue([mockResponse]);

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.addToNGList(partnerId, createDto);
      });

      expect(mockService.addToNGList).toHaveBeenCalledWith(partnerId, createDto);
      expect(mockService.getNGList).toHaveBeenCalledWith(partnerId);
    });
  });

  describe('fetchAccessPermissions', () => {
    it('アクセス権限を取得できること', async () => {
      const partnerId = '1';
      const mockPermissions: AccessPermission = {
        id: 'perm1',
        businessPartnerId: partnerId,
        canViewAllEngineers: true,
        canViewWaitingEngineers: true,
        canViewAvailableEngineers: true,
        engineerDisplayMode: 'all',
        allowedEngineerIds: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockService.getAccessPermissions = jest.fn().mockResolvedValue(mockPermissions);

      const { result } = renderHook(() => useBusinessPartnerStore());

      await act(async () => {
        await result.current.fetchAccessPermissions(partnerId);
      });

      expect(result.current.accessPermission).toEqual(mockPermissions);
      expect(mockService.getAccessPermissions).toHaveBeenCalledWith(partnerId);
    });
  });

  describe('clearError', () => {
    it('エラー状態をクリアできること', () => {
      const { result } = renderHook(() => useBusinessPartnerStore());

      // エラー状態を設定
      act(() => {
        useBusinessPartnerStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');

      // エラーをクリア
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
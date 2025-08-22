import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import BusinessPartnerService from '../businessPartnerService';
import type {
  BusinessPartner,
  BusinessPartnerListResponse,
  CreateBusinessPartnerDto,
  UpdateBusinessPartnerDto,
  ClientUser,
  NGListEntry,
  AccessPermission,
} from '../businessPartnerService';

describe('BusinessPartnerService', () => {
  let mock: MockAdapter;
  let service: BusinessPartnerService;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    service = new BusinessPartnerService();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getBusinessPartners', () => {
    it('取引先一覧を取得できること', async () => {
      const mockResponse: BusinessPartnerListResponse = {
        partners: [
          {
            id: '1',
            companyName: 'テスト企業1',
            companyNameKana: 'テストキギョウ1',
            industry: 'IT',
            postalCode: '100-0001',
            prefecture: '東京都',
            address: '千代田区千代田1-1',
            phoneNumber: '03-1234-5678',
            faxNumber: '03-1234-5679',
            email: 'test1@example.com',
            website: 'https://test1.example.com',
            representativeName: '山田太郎',
            representativeNameKana: 'ヤマダタロウ',
            representativePosition: '代表取締役',
            establishedDate: '2000-01-01',
            capital: 10000000,
            employeeCount: 100,
            fiscalMonth: 3,
            contractType: 'SES',
            paymentTerms: '月末締め翌月末払い',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10,
      };

      mock.onGet('/api/v1/business-partners').reply(200, mockResponse);

      const result = await service.getBusinessPartners();
      expect(result).toEqual(mockResponse);
    });

    it('検索パラメータ付きで取引先一覧を取得できること', async () => {
      const mockResponse: BusinessPartnerListResponse = {
        partners: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
      };

      const params = {
        keyword: 'テスト',
        status: 'active' as const,
        page: 2,
        pageSize: 20,
      };

      mock.onGet('/api/v1/business-partners', { params }).reply(200, mockResponse);

      const result = await service.getBusinessPartners(params);
      expect(result).toEqual(mockResponse);
    });

    it('エラー時に例外をスローすること', async () => {
      mock.onGet('/api/v1/business-partners').reply(500);

      await expect(service.getBusinessPartners()).rejects.toThrow();
    });
  });

  describe('createBusinessPartner', () => {
    it('取引先を作成できること', async () => {
      const createDto: CreateBusinessPartnerDto = {
        companyName: '新規企業',
        companyNameKana: 'シンキキギョウ',
        industry: 'IT',
        postalCode: '100-0001',
        prefecture: '東京都',
        address: '千代田区千代田1-1',
        phoneNumber: '03-1234-5678',
        email: 'new@example.com',
        representativeName: '鈴木一郎',
        representativeNameKana: 'スズキイチロウ',
        contractType: 'SES',
      };

      const mockResponse: BusinessPartner = {
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

      mock.onPost('/api/v1/business-partners', createDto).reply(201, mockResponse);

      const result = await service.createBusinessPartner(createDto);
      expect(result).toEqual(mockResponse);
    });

    it('バリデーションエラー時に例外をスローすること', async () => {
      const invalidDto = {} as CreateBusinessPartnerDto;
      
      mock.onPost('/api/v1/business-partners', invalidDto).reply(400, {
        message: 'Validation error',
        errors: ['companyName is required'],
      });

      await expect(service.createBusinessPartner(invalidDto)).rejects.toThrow();
    });
  });

  describe('updateBusinessPartner', () => {
    it('取引先情報を更新できること', async () => {
      const partnerId = '1';
      const updateDto: UpdateBusinessPartnerDto = {
        companyName: '更新企業',
        email: 'updated@example.com',
      };

      const mockResponse: BusinessPartner = {
        id: partnerId,
        companyName: '更新企業',
        companyNameKana: 'コウシンキギョウ',
        industry: 'IT',
        postalCode: '100-0001',
        prefecture: '東京都',
        address: '千代田区千代田1-1',
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

      mock.onPut(`/api/v1/business-partners/${partnerId}`, updateDto).reply(200, mockResponse);

      const result = await service.updateBusinessPartner(partnerId, updateDto);
      expect(result).toEqual(mockResponse);
    });

    it('存在しない取引先の更新時に404エラーをスローすること', async () => {
      const partnerId = 'non-existent';
      const updateDto: UpdateBusinessPartnerDto = {
        companyName: '更新企業',
      };

      mock.onPut(`/api/v1/business-partners/${partnerId}`, updateDto).reply(404);

      await expect(service.updateBusinessPartner(partnerId, updateDto)).rejects.toThrow();
    });
  });

  describe('deleteBusinessPartner', () => {
    it('取引先を削除できること', async () => {
      const partnerId = '1';
      mock.onDelete(`/api/v1/business-partners/${partnerId}`).reply(204);

      await expect(service.deleteBusinessPartner(partnerId)).resolves.toBeUndefined();
    });

    it('削除権限がない場合に403エラーをスローすること', async () => {
      const partnerId = '1';
      mock.onDelete(`/api/v1/business-partners/${partnerId}`).reply(403);

      await expect(service.deleteBusinessPartner(partnerId)).rejects.toThrow();
    });
  });

  describe('getClientUsers', () => {
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

      mock.onGet(`/api/v1/business-partners/${partnerId}/users`).reply(200, mockUsers);

      const result = await service.getClientUsers(partnerId);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('createClientUser', () => {
    it('取引先ユーザーを作成できること', async () => {
      const partnerId = '1';
      const createDto = {
        name: '新規ユーザー',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user' as const,
      };

      const mockResponse: ClientUser = {
        id: 'user2',
        businessPartnerId: partnerId,
        name: '新規ユーザー',
        nameKana: null,
        email: 'newuser@example.com',
        phoneNumber: null,
        department: null,
        position: null,
        role: 'user',
        isActive: true,
        lastLoginAt: null,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mock.onPost(`/api/v1/business-partners/${partnerId}/users`, {
        ...createDto,
        businessPartnerId: partnerId,
      }).reply(201, mockResponse);

      const result = await service.createClientUser(partnerId, createDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getNGList', () => {
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

      mock.onGet(`/api/v1/business-partners/${partnerId}/ng-list`).reply(200, mockNGList);

      const result = await service.getNGList(partnerId);
      expect(result).toEqual(mockNGList);
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

      mock.onPost(`/api/v1/business-partners/${partnerId}/ng-list`, createDto).reply(201, mockResponse);

      const result = await service.addToNGList(partnerId, createDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeFromNGList', () => {
    it('NGリストからエンジニアを削除できること', async () => {
      const partnerId = '1';
      const entryId = 'ng1';

      mock.onDelete(`/api/v1/business-partners/${partnerId}/ng-list/${entryId}`).reply(204);

      await expect(service.removeFromNGList(partnerId, entryId)).resolves.toBeUndefined();
    });
  });

  describe('getAccessPermissions', () => {
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

      mock.onGet(`/api/v1/business-partners/${partnerId}/permissions`).reply(200, mockPermissions);

      const result = await service.getAccessPermissions(partnerId);
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('updateAccessPermissions', () => {
    it('アクセス権限を更新できること', async () => {
      const partnerId = '1';
      const updateDto = {
        canViewAllEngineers: false,
        engineerDisplayMode: 'custom' as const,
      };

      const mockResponse: AccessPermission = {
        id: 'perm1',
        businessPartnerId: partnerId,
        canViewAllEngineers: false,
        canViewWaitingEngineers: true,
        canViewAvailableEngineers: true,
        engineerDisplayMode: 'custom',
        allowedEngineerIds: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mock.onPut(`/api/v1/business-partners/${partnerId}/permissions`, updateDto).reply(200, mockResponse);

      const result = await service.updateAccessPermissions(partnerId, updateDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
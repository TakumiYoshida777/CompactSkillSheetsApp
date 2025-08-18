import { Request, Response } from 'express';
import { ClientAuthController } from '../clientAuthController';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// モックの設定
jest.mock('@prisma/client');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('ClientAuthController', () => {
  let controller: ClientAuthController;
  let mockPrisma: any;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new ClientAuthController();
    mockPrisma = {
      clientUser: {
        findUnique: jest.fn(),
        update: jest.fn()
      }
    };
    (PrismaClient as any).mockImplementation(() => mockPrisma);

    mockReq = {
      body: {},
      headers: {},
      user: {}
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('正しい認証情報でログインできること', async () => {
      const mockClientUser = {
        id: BigInt(1),
        email: 'client@example.com',
        passwordHash: 'hashedPassword',
        name: 'テストユーザー',
        department: '営業部',
        position: '課長',
        isActive: true,
        failedLoginCount: 0,
        accountLockedUntil: null,
        businessPartner: {
          id: BigInt(1),
          isActive: true,
          clientCompany: {
            id: BigInt(10),
            name: '取引先企業A'
          },
          sesCompany: {
            id: BigInt(20),
            name: 'SES企業B'
          }
        },
        clientUserRoles: [
          {
            role: {
              name: 'client',
              rolePermissions: [
                { permission: { name: 'engineer.read.allowed' } }
              ]
            }
          }
        ]
      };

      mockPrisma.clientUser.findUnique.mockResolvedValue(mockClientUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockAccessToken');

      mockReq.body = {
        email: 'client@example.com',
        password: 'password123'
      };

      await controller.login(mockReq as Request, mockRes as Response);

      expect(mockPrisma.clientUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'client@example.com' },
        include: expect.any(Object)
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');

      expect(mockPrisma.clientUser.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          lastLoginAt: expect.any(Date),
          failedLoginCount: 0,
          accountLockedUntil: null
        }
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'ログインに成功しました',
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({
          email: 'client@example.com',
          name: 'テストユーザー',
          userType: 'client'
        })
      });
    });

    it('間違ったパスワードでログイン失敗すること', async () => {
      const mockClientUser = {
        id: BigInt(1),
        email: 'client@example.com',
        passwordHash: 'hashedPassword',
        failedLoginCount: 5,
        accountLockedUntil: null,
        isActive: true,
        businessPartner: {
          isActive: true
        }
      };

      mockPrisma.clientUser.findUnique.mockResolvedValue(mockClientUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      mockReq.body = {
        email: 'client@example.com',
        password: 'wrongPassword'
      };

      await controller.login(mockReq as Request, mockRes as Response);

      expect(mockPrisma.clientUser.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: {
          failedLoginCount: 6,
          accountLockedUntil: null
        }
      });

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'メールアドレスまたはパスワードが正しくありません',
        remainingAttempts: 4
      });
    });

    it('アカウントがロックされている場合はログインできないこと', async () => {
      const mockClientUser = {
        id: BigInt(1),
        email: 'client@example.com',
        accountLockedUntil: new Date(Date.now() + 60000), // 1分後まで
        isActive: true,
        businessPartner: {
          isActive: true
        }
      };

      mockPrisma.clientUser.findUnique.mockResolvedValue(mockClientUser);

      mockReq.body = {
        email: 'client@example.com',
        password: 'password123'
      };

      await controller.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(423);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'アカウントがロックされています',
        lockedUntil: mockClientUser.accountLockedUntil
      });
    });
  });

  describe('refresh', () => {
    it('有効なリフレッシュトークンで新しいアクセストークンを取得できること', async () => {
      const mockClientUser = {
        id: BigInt(1),
        email: 'client@example.com',
        name: 'テストユーザー',
        isActive: true,
        businessPartner: {
          clientCompany: {
            id: BigInt(10),
            name: '取引先企業A'
          },
          sesCompany: {
            id: BigInt(20),
            name: 'SES企業B'
          }
        },
        clientUserRoles: []
      };

      const mockDecodedToken = {
        sub: '1',
        userType: 'client',
        tokenType: 'refresh'
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      mockPrisma.clientUser.findUnique.mockResolvedValue(mockClientUser);
      (jwt.sign as jest.Mock).mockReturnValue('newAccessToken');

      mockReq.body = {
        refreshToken: 'validRefreshToken'
      };

      await controller.refresh(mockReq as Request, mockRes as Response);

      expect(jwt.verify).toHaveBeenCalledWith(
        'validRefreshToken',
        expect.any(String)
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        accessToken: 'newAccessToken',
        refreshToken: 'validRefreshToken'
      });
    });

    it('無効なリフレッシュトークンでエラーになること', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      mockReq.body = {
        refreshToken: 'invalidRefreshToken'
      };

      await controller.refresh(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'トークンの更新に失敗しました'
      });
    });
  });

  describe('me', () => {
    it('認証済みユーザーの情報を取得できること', async () => {
      const mockClientUser = {
        id: BigInt(1),
        email: 'client@example.com',
        name: 'テストユーザー',
        department: '営業部',
        position: '課長',
        businessPartner: {
          clientCompany: {
            id: BigInt(10),
            name: '取引先企業A'
          },
          sesCompany: {
            id: BigInt(20),
            name: 'SES企業B'
          },
          accessPermissions: [
            {
              permissionType: 'SELECTED_ONLY',
              engineer: {
                id: BigInt(100),
                name: 'エンジニアA'
              }
            }
          ]
        },
        clientUserRoles: [
          {
            role: {
              name: 'client',
              displayName: '取引先ユーザー'
            }
          }
        ]
      };

      mockReq.user = { id: '1' };
      mockPrisma.clientUser.findUnique.mockResolvedValue(mockClientUser);

      await controller.me(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        id: '1',
        email: 'client@example.com',
        name: 'テストユーザー',
        department: '営業部',
        position: '課長',
        clientCompany: {
          id: '10',
          name: '取引先企業A'
        },
        sesCompany: {
          id: '20',
          name: 'SES企業B'
        },
        roles: [
          {
            name: 'client',
            displayName: '取引先ユーザー'
          }
        ],
        accessControl: {
          permissionType: 'SELECTED_ONLY',
          allowedEngineers: [
            {
              id: '100',
              name: 'エンジニアA'
            }
          ]
        }
      });
    });
  });
});
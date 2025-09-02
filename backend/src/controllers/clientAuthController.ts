import { Request, Response } from 'express';
import { errorLog } from '../utils/logger';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/security';

const prisma = new PrismaClient();

/**
 * 取引先企業認証コントローラー
 */
export class ClientAuthController {
  /**
   * 取引先企業ユーザーログイン
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // ユーザー検索
      const clientUser = await prisma.clientUser.findUnique({
        where: { email },
        include: {
          businessPartner: {
            include: {
              clientCompany: {
                select: {
                  id: true,
                  name: true
                }
              },
              sesCompany: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          clientUserRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!clientUser) {
        return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
      }

      // アカウントロックチェック
      if (clientUser.accountLockedUntil && clientUser.accountLockedUntil > new Date()) {
        return res.status(423).json({ 
          error: 'アカウントがロックされています',
          lockedUntil: clientUser.accountLockedUntil
        });
      }

      // アカウント無効チェック
      if (!clientUser.isActive) {
        return res.status(403).json({ error: 'アカウントが無効になっています' });
      }

      // ビジネスパートナー関係チェック
      if (!clientUser.businessPartner.isActive) {
        return res.status(403).json({ error: '取引先企業との契約が無効になっています' });
      }

      // パスワード検証
      const isPasswordValid = await bcrypt.compare(password, clientUser.passwordHash);

      if (!isPasswordValid) {
        // ログイン失敗カウント増加
        const failedCount = clientUser.failedLoginCount + 1;
        let lockedUntil = null;

        // 10回失敗で30分ロック
        if (failedCount >= 10 && failedCount < 20) {
          lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        }
        // 20回失敗で2時間ロック
        else if (failedCount >= 20 && failedCount < 30) {
          lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
        }
        // 30回以上で管理者解除必要
        else if (failedCount >= 30) {
          lockedUntil = new Date('2099-12-31');
        }

        await prisma.clientUser.update({
          where: { id: clientUser.id },
          data: {
            failedLoginCount: failedCount,
            accountLockedUntil: lockedUntil
          }
        });

        return res.status(401).json({ 
          error: 'メールアドレスまたはパスワードが正しくありません',
          remainingAttempts: Math.max(0, 10 - failedCount)
        });
      }

      // ログイン成功時の処理
      await prisma.clientUser.update({
        where: { id: clientUser.id },
        data: {
          lastLoginAt: new Date(),
          failedLoginCount: 0,
          accountLockedUntil: null
        }
      });

      // ロールと権限の整理
      const roles = clientUser.clientUserRoles.map(ur => ur.role.name);
      const permissions = [...new Set(
        clientUser.clientUserRoles.flatMap(ur => 
          ur.role.rolePermissions.map(rp => rp.permission.name)
        )
      )];

      // JWTトークン生成
      const accessToken = jwt.sign(
        {
          sub: clientUser.id.toString(),
          email: clientUser.email,
          name: clientUser.name,
          userType: 'client',
          clientCompanyId: clientUser.businessPartner.clientCompany.id.toString(),
          clientCompanyName: clientUser.businessPartner.clientCompany.name,
          sesCompanyId: clientUser.businessPartner.sesCompany.id.toString(),
          sesCompanyName: clientUser.businessPartner.sesCompany.name,
          businessPartnerId: clientUser.businessPartner.id.toString(),
          roles,
          permissions
        },
        securityConfig.getJwtSecret(),
        { expiresIn: '8h' }
      );

      // リフレッシュトークン生成
      const refreshToken = jwt.sign(
        {
          sub: clientUser.id.toString(),
          userType: 'client',
          tokenType: 'refresh'
        },
        securityConfig.getJwtRefreshSecret(),
        { expiresIn: '30d' }
      );

      res.json({
        message: 'ログインに成功しました',
        accessToken,
        refreshToken,
        user: {
          id: clientUser.id.toString(),
          email: clientUser.email,
          name: clientUser.name,
          department: clientUser.department,
          position: clientUser.position,
          userType: 'client',
          clientCompany: {
            id: clientUser.businessPartner.clientCompany.id.toString(),
            name: clientUser.businessPartner.clientCompany.name
          },
          sesCompany: {
            id: clientUser.businessPartner.sesCompany.id.toString(),
            name: clientUser.businessPartner.sesCompany.name
          },
          roles,
          permissions
        }
      });
    } catch (error) {
      errorLog('取引先企業ログインエラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * トークン更新
   */
  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'リフレッシュトークンが必要です' });
      }

      // リフレッシュトークン検証
      const decoded = jwt.verify(
        refreshToken,
        securityConfig.getJwtRefreshSecret()
      ) as any;

      if (decoded.userType !== 'client' || decoded.tokenType !== 'refresh') {
        return res.status(401).json({ error: '無効なトークンです' });
      }

      // ユーザー情報取得
      const clientUser = await prisma.clientUser.findUnique({
        where: { id: BigInt(decoded.sub) },
        include: {
          businessPartner: {
            include: {
              clientCompany: {
                select: {
                  id: true,
                  name: true
                }
              },
              sesCompany: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          clientUserRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!clientUser || !clientUser.isActive) {
        return res.status(401).json({ error: 'ユーザーが見つかりません' });
      }

      // ロールと権限の整理
      const roles = clientUser.clientUserRoles.map(ur => ur.role.name);
      const permissions = [...new Set(
        clientUser.clientUserRoles.flatMap(ur => 
          ur.role.rolePermissions.map(rp => rp.permission.name)
        )
      )];

      // 新しいアクセストークン生成
      const newAccessToken = jwt.sign(
        {
          sub: clientUser.id.toString(),
          email: clientUser.email,
          name: clientUser.name,
          userType: 'client',
          clientCompanyId: clientUser.businessPartner.clientCompany.id.toString(),
          clientCompanyName: clientUser.businessPartner.clientCompany.name,
          sesCompanyId: clientUser.businessPartner.sesCompany.id.toString(),
          sesCompanyName: clientUser.businessPartner.sesCompany.name,
          businessPartnerId: clientUser.businessPartner.id.toString(),
          roles,
          permissions
        },
        securityConfig.getJwtSecret(),
        { expiresIn: '8h' }
      );

      res.json({
        accessToken: newAccessToken,
        refreshToken // 既存のリフレッシュトークンを返す
      });
    } catch (error) {
      errorLog('トークン更新エラー:', error);
      res.status(401).json({ error: 'トークンの更新に失敗しました' });
    }
  }

  /**
   * ログアウト
   */
  async logout(req: Request, res: Response) {
    try {
      // クライアント側でトークンを削除する必要があるため、
      // サーバー側では成功レスポンスを返すのみ
      res.json({ message: 'ログアウトしました' });
    } catch (error) {
      errorLog('ログアウトエラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 現在のユーザー情報取得
   */
  async me(req: Request, res: Response) {
    try {
      
      const clientUserId = (req as any).clientUser?.id;

      if (!clientUserId) {
        return res.status(401).json({ error: '認証が必要です' });
      }
      

      const clientUser = await prisma.clientUser.findUnique({
        where: { id: BigInt(clientUserId) },
        include: {
          businessPartner: {
            include: {
              clientCompany: {
                select: {
                  id: true,
                  name: true
                }
              },
              sesCompany: {
                select: {
                  id: true,
                  name: true
                }
              },
              accessPermissions: {
                where: { isActive: true },
                include: {
                  engineer: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          },
          clientUserRoles: {
            include: {
              role: {
                select: {
                  name: true,
                  displayName: true
                }
              }
            }
          }
        }
      });

      if (!clientUser) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }

      // アクセス権限の整理
      const permissions = clientUser.businessPartner.accessPermissions;
      let permissionType = 'FULL_ACCESS';
      let allowedEngineers: any[] = [];

      if (permissions.length > 0) {
        permissionType = permissions[0].permissionType;
        if (permissionType === 'SELECTED_ONLY') {
          allowedEngineers = permissions
            .filter(p => p.engineer)
            .map(p => ({
              id: p.engineer!.id.toString(),
              name: p.engineer!.name
            }));
        }
      }

      res.json({
        id: clientUser.id.toString(),
        email: clientUser.email,
        name: clientUser.name,
        department: clientUser.department,
        position: clientUser.position,
        clientCompany: {
          id: clientUser.businessPartner.clientCompany.id.toString(),
          name: clientUser.businessPartner.clientCompany.name
        },
        sesCompany: {
          id: clientUser.businessPartner.sesCompany.id.toString(),
          name: clientUser.businessPartner.sesCompany.name
        },
        roles: clientUser.clientUserRoles.map(ur => ({
          name: ur.role.name,
          displayName: ur.role.displayName
        })),
        accessControl: {
          permissionType,
          allowedEngineers
        }
      });
    } catch (error) {
      errorLog('ユーザー情報取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
}

export const clientAuthController = new ClientAuthController();
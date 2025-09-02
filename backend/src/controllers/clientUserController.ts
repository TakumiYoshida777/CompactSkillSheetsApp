import { errorLog } from '../utils/logger';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * 取引先企業ユーザー管理コントローラー
 */
export class ClientUserController {
  /**
   * 取引先企業アカウント作成
   * SES企業が取引先企業用のアカウントを作成
   */
  async createClientUser(req: Request, res: Response) {
    try {
      const { 
        clientCompanyId,
        email,
        password,
        name,
        phone,
        department,
        position
      } = req.body;

      // リクエストユーザーの企業IDを取得
      const sesCompanyId = req.user?.companyId;
      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      // 権限チェック（管理者または営業のみ）
      const userRoles = req.user?.roles || [];
      if (!userRoles.includes('admin') && !userRoles.includes('sales')) {
        return res.status(403).json({ error: '権限が不足しています' });
      }

      // 取引先企業関係の確認
      const businessPartner = await prisma.businessPartner.findFirst({
        where: {
          sesCompanyId: BigInt(sesCompanyId),
          clientCompanyId: BigInt(clientCompanyId),
          isActive: true
        }
      });

      if (!businessPartner) {
        return res.status(404).json({ error: '取引先企業が見つかりません' });
      }

      // メールアドレスの重複チェック
      const existingUser = await prisma.clientUser.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'このメールアドレスは既に使用されています' });
      }

      // パスワードハッシュ化
      const passwordHash = await bcrypt.hash(password, 10);

      // 取引先企業ユーザー作成
      const clientUser = await prisma.clientUser.create({
        data: {
          businessPartnerId: businessPartner.id,
          email,
          passwordHash,
          name,
          phone,
          department,
          position,
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          department: true,
          position: true,
          isActive: true,
          createdAt: true
        }
      });

      // デフォルトロール（client）を付与
      const clientRole = await prisma.role.findFirst({
        where: { name: 'client' }
      });

      if (clientRole) {
        await prisma.clientUserRole.create({
          data: {
            clientUserId: clientUser.id,
            roleId: clientRole.id,
            grantedBy: BigInt(req.user?.id || 0)
          }
        });
      }

      res.status(201).json({
        message: '取引先企業ユーザーを作成しました',
        clientUser
      });
    } catch (error) {
      errorLog('取引先企業ユーザー作成エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業ユーザー一覧取得
   */
  async getClientUsers(req: Request, res: Response) {
    try {
      const sesCompanyId = req.user?.companyId;
      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      const { clientCompanyId } = req.query;

      // 取引先企業関係の確認
      const businessPartners = await prisma.businessPartner.findMany({
        where: {
          sesCompanyId: BigInt(sesCompanyId),
          ...(clientCompanyId ? { clientCompanyId: BigInt(clientCompanyId as string) } : {}),
          isActive: true
        },
        include: {
          clientUsers: {
            where: { isActive: true },
            select: {
              id: true,
              email: true,
              name: true,
              department: true,
              position: true,
              lastLoginAt: true,
              isActive: true,
              createdAt: true,
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
          },
          clientCompany: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const clientUsers = businessPartners.flatMap(bp => 
        bp.clientUsers.map(user => ({
          ...user,
          companyName: bp.clientCompany.name,
          roles: user.clientUserRoles.map(ur => ur.role)
        }))
      );

      res.json({ clientUsers });
    } catch (error) {
      errorLog('取引先企業ユーザー一覧取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業ユーザー更新
   */
  async updateClientUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        name,
        phone,
        department,
        position,
        isActive,
        password
      } = req.body;

      const sesCompanyId = req.user?.companyId;
      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      // 取引先企業ユーザーの存在確認と権限チェック
      const clientUser = await prisma.clientUser.findFirst({
        where: {
          id: BigInt(id),
          businessPartner: {
            sesCompanyId: BigInt(sesCompanyId)
          }
        }
      });

      if (!clientUser) {
        return res.status(404).json({ error: '取引先企業ユーザーが見つかりません' });
      }

      // 更新データの準備
      const updateData: any = {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive })
      };

      // パスワード更新がある場合
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      // ユーザー更新
      const updatedUser = await prisma.clientUser.update({
        where: { id: BigInt(id) },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          department: true,
          position: true,
          isActive: true,
          updatedAt: true
        }
      });

      res.json({
        message: '取引先企業ユーザーを更新しました',
        clientUser: updatedUser
      });
    } catch (error) {
      errorLog('取引先企業ユーザー更新エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 取引先企業ユーザー削除（無効化）
   */
  async deleteClientUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sesCompanyId = req.user?.companyId;

      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      // 取引先企業ユーザーの存在確認と権限チェック
      const clientUser = await prisma.clientUser.findFirst({
        where: {
          id: BigInt(id),
          businessPartner: {
            sesCompanyId: BigInt(sesCompanyId)
          }
        }
      });

      if (!clientUser) {
        return res.status(404).json({ error: '取引先企業ユーザーが見つかりません' });
      }

      // ユーザー無効化
      await prisma.clientUser.update({
        where: { id: BigInt(id) },
        data: { isActive: false }
      });

      res.json({ message: '取引先企業ユーザーを無効化しました' });
    } catch (error) {
      errorLog('取引先企業ユーザー削除エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * アクセス権限設定
   */
  async setAccessPermissions(req: Request, res: Response) {
    try {
      const { clientCompanyId } = req.params;
      const { permissionType, engineerIds } = req.body;

      const sesCompanyId = req.user?.companyId;
      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      // 取引先企業関係の確認
      const businessPartner = await prisma.businessPartner.findFirst({
        where: {
          sesCompanyId: BigInt(sesCompanyId),
          clientCompanyId: BigInt(clientCompanyId),
          isActive: true
        }
      });

      if (!businessPartner) {
        return res.status(404).json({ error: '取引先企業が見つかりません' });
      }

      // 既存の権限設定を無効化
      await prisma.clientAccessPermission.updateMany({
        where: {
          businessPartnerId: businessPartner.id
        },
        data: { isActive: false }
      });

      // 新しい権限設定を作成
      if (permissionType === 'SELECTED_ONLY' && engineerIds?.length > 0) {
        // 選択されたエンジニアのみ閲覧可能
        const permissions = engineerIds.map((engineerId: string) => ({
          businessPartnerId: businessPartner.id,
          engineerId: BigInt(engineerId),
          permissionType: 'SELECTED_ONLY' as any,
          isActive: true,
          createdBy: BigInt(req.user?.id || 0)
        }));

        await prisma.clientAccessPermission.createMany({
          data: permissions
        });
      } else {
        // 全エンジニアまたは待機中エンジニアのみ閲覧可能
        await prisma.clientAccessPermission.create({
          data: {
            businessPartnerId: businessPartner.id,
            permissionType: permissionType as any,
            isActive: true,
            createdBy: BigInt(req.user?.id || 0)
          }
        });
      }

      res.json({ message: 'アクセス権限を設定しました' });
    } catch (error) {
      errorLog('アクセス権限設定エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * アクセス権限取得
   */
  async getAccessPermissions(req: Request, res: Response) {
    try {
      const { clientCompanyId } = req.params;
      const sesCompanyId = req.user?.companyId;

      if (!sesCompanyId) {
        return res.status(401).json({ error: '認証が必要です' });
      }

      // 取引先企業関係の確認
      const businessPartner = await prisma.businessPartner.findFirst({
        where: {
          sesCompanyId: BigInt(sesCompanyId),
          clientCompanyId: BigInt(clientCompanyId),
          isActive: true
        },
        include: {
          accessPermissions: {
            where: { isActive: true },
            include: {
              engineer: {
                select: {
                  id: true,
                  name: true,
                  currentStatus: true
                }
              }
            }
          }
        }
      });

      if (!businessPartner) {
        return res.status(404).json({ error: '取引先企業が見つかりません' });
      }

      // 権限タイプの判定
      const permissions = businessPartner.accessPermissions;
      let permissionType = 'FULL_ACCESS';
      let allowedEngineers: any[] = [];

      if (permissions.length > 0) {
        permissionType = permissions[0].permissionType;
        if (permissionType === 'SELECTED_ONLY') {
          allowedEngineers = permissions
            .filter(p => p.engineer)
            .map(p => p.engineer);
        }
      }

      res.json({
        permissionType,
        allowedEngineers
      });
    } catch (error) {
      errorLog('アクセス権限取得エラー:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
  }
}

export const clientUserController = new ClientUserController();
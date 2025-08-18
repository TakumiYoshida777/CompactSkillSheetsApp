import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Requestインターフェースを拡張
declare global {
  namespace Express {
    interface Request {
      clientUser?: {
        id: string;
        email: string;
        name: string;
        userType: string;
        clientCompanyId: string;
        sesCompanyId: string;
        businessPartnerId: string;
        roles: string[];
        permissions: string[];
      };
    }
  }
}

/**
 * 取引先企業ユーザー認証ミドルウェア
 */
export const authenticateClientUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '認証トークンが必要です' });
    }

    const token = authHeader.substring(7);

    // トークン検証
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as any;

    // 取引先企業ユーザーかチェック
    if (decoded.userType !== 'client') {
      return res.status(403).json({ error: '権限が不足しています' });
    }

    // ユーザー情報をリクエストに追加
    req.clientUser = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      userType: decoded.userType,
      clientCompanyId: decoded.clientCompanyId,
      sesCompanyId: decoded.sesCompanyId,
      businessPartnerId: decoded.businessPartnerId,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };

    // データベースでユーザーのアクティブ状態を確認
    const clientUser = await prisma.clientUser.findUnique({
      where: { id: BigInt(decoded.sub) },
      select: { isActive: true }
    });

    if (!clientUser || !clientUser.isActive) {
      return res.status(403).json({ error: 'アカウントが無効になっています' });
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'トークンの有効期限が切れています' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: '無効なトークンです' });
    }
    console.error('認証エラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

/**
 * アクセス権限チェックミドルウェア
 * 取引先企業ユーザーが特定のエンジニア情報にアクセスできるかチェック
 */
export const checkClientAccessPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.clientUser) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    const { engineerId } = req.params;
    const businessPartnerId = req.clientUser.businessPartnerId;

    // ビジネスパートナーのアクセス権限を取得
    const permissions = await prisma.clientAccessPermission.findMany({
      where: {
        businessPartnerId: BigInt(businessPartnerId),
        isActive: true
      }
    });

    if (permissions.length === 0) {
      // 権限設定がない場合はデフォルトで全アクセス可能
      return next();
    }

    const permissionType = permissions[0].permissionType;

    // 権限タイプに応じたチェック
    switch (permissionType) {
      case 'FULL_ACCESS':
        // 全エンジニア閲覧可能
        return next();

      case 'WAITING_ONLY':
        // 待機中エンジニアのみ閲覧可能
        if (engineerId) {
          const engineer = await prisma.engineer.findUnique({
            where: { id: BigInt(engineerId) },
            select: { currentStatus: true }
          });

          if (!engineer || (engineer.currentStatus !== 'WAITING' && engineer.currentStatus !== 'WAITING_SOON')) {
            return res.status(403).json({ error: 'このエンジニア情報へのアクセス権限がありません' });
          }
        }
        return next();

      case 'SELECTED_ONLY':
        // 選択されたエンジニアのみ閲覧可能
        if (engineerId) {
          const hasPermission = permissions.some(
            p => p.engineerId && p.engineerId.toString() === engineerId
          );

          if (!hasPermission) {
            return res.status(403).json({ error: 'このエンジニア情報へのアクセス権限がありません' });
          }
        }
        return next();

      default:
        return res.status(403).json({ error: 'アクセス権限が設定されていません' });
    }
  } catch (error) {
    console.error('アクセス権限チェックエラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

/**
 * 閲覧ログ記録ミドルウェア
 */
export const logClientView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.clientUser) {
      return next();
    }

    const { engineerId } = req.params;
    const action = req.method + ' ' + req.path;

    // 閲覧ログを記録
    await prisma.clientViewLog.create({
      data: {
        clientUserId: BigInt(req.clientUser.id),
        engineerId: engineerId ? BigInt(engineerId) : null,
        action: action.substring(0, 50),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });

    next();
  } catch (error) {
    console.error('閲覧ログ記録エラー:', error);
    // ログ記録に失敗してもリクエストは続行
    next();
  }
};
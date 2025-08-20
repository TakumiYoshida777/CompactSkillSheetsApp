import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../utils/response.util';
import { config } from '../config/environment';
import logger from '../config/logger';

const prisma = new PrismaClient();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // ユーザー検索
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          company: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json(ApiResponse.error('AUTH_ERROR', 'メールアドレスまたはパスワードが正しくありません'));
      }

      // パスワード検証
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        // ログイン失敗回数を増やす
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: { increment: 1 } }
        });
        return res.status(401).json(ApiResponse.error('AUTH_ERROR', 'メールアドレスまたはパスワードが正しくありません'));
      }

      // アカウントロック確認
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        return res.status(403).json(ApiResponse.error('ACCOUNT_LOCKED', 'アカウントがロックされています'));
      }

      // アクティブ確認
      if (!user.isActive) {
        return res.status(403).json(ApiResponse.error('ACCOUNT_DISABLED', 'アカウントが無効化されています'));
      }

      // JWTトークン生成
      const tokenPayload: any = {
        userId: user.id.toString(),
        email: user.email
      };
      if (user.companyId) {
        tokenPayload.companyId = user.companyId.toString();
      }
      
      const token = jwt.sign(
        tokenPayload,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // リフレッシュトークン生成
      const refreshToken = jwt.sign(
        { userId: user.id.toString() },
        config.jwt.refreshSecret,
        { expiresIn: '30d' }
      );

      // ログイン成功時の処理
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          failedLoginCount: 0
        }
      });

      logger.info(`ユーザーログイン成功: ${user.email}`);

      // ロール情報を抽出
      const roles = user.userRoles.map(ur => ur.role.name);
      const userType = user.company?.companyType === 'ses' ? 'ses' : 'client';

      return res.json(ApiResponse.success({
        token,
        refreshToken,
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          companyId: user.companyId?.toString(),
          companyName: user.company?.name,
          roles: roles,
          userType: userType
        }
      }));
    } catch (error) {
      logger.error('ログインエラー:', error);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // クライアント側でトークンを削除するため、サーバー側では特に処理なし
      return res.json(ApiResponse.success({ message: 'ログアウトしました' }));
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json(ApiResponse.error('UNAUTHORIZED', '認証が必要です'));
      }

      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        include: {
          company: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json(ApiResponse.error('USER_NOT_FOUND', 'ユーザーが見つかりません'));
      }

      // ロール情報を抽出
      const roles = user.userRoles.map(ur => ur.role.name);
      const userType = user.company?.companyType === 'ses' ? 'ses' : 'client';

      return res.json(ApiResponse.success({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        companyId: user.companyId?.toString(),
        companyName: user.company?.name,
        roles: roles,
        userType: userType
      }));
    } catch (error) {
      logger.error('ユーザー情報取得エラー:', error);
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json(ApiResponse.error('REFRESH_TOKEN_REQUIRED', 'リフレッシュトークンが必要です'));
      }

      // リフレッシュトークン検証
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as any;

      // ユーザー情報取得
      const user = await prisma.user.findUnique({
        where: { id: BigInt(decoded.userId) },
        include: { 
          company: true,
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      if (!user || !user.isActive) {
        return res.status(401).json(ApiResponse.error('INVALID_REFRESH_TOKEN', '無効なリフレッシュトークンです'));
      }

      // 新しいアクセストークン生成
      const newTokenPayload: any = {
        userId: user.id.toString(),
        email: user.email
      };
      if (user.companyId) {
        newTokenPayload.companyId = user.companyId.toString();
      }
      
      const newToken = jwt.sign(
        newTokenPayload,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return res.json(ApiResponse.success({ token: newToken }));
    } catch (error) {
      logger.error('トークンリフレッシュエラー:', error);
      return res.status(401).json(ApiResponse.error('INVALID_REFRESH_TOKEN', '無効なリフレッシュトークンです'));
    }
  }
}
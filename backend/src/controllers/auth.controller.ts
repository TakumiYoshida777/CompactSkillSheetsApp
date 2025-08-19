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
          company: true
        }
      });

      if (!user) {
        return ApiResponse.error(res, 'メールアドレスまたはパスワードが正しくありません', 401);
      }

      // パスワード検証
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        // ログイン失敗回数を増やす
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: { increment: 1 } }
        });
        return ApiResponse.error(res, 'メールアドレスまたはパスワードが正しくありません', 401);
      }

      // アカウントロック確認
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        return ApiResponse.error(res, 'アカウントがロックされています', 403);
      }

      // アクティブ確認
      if (!user.isActive) {
        return ApiResponse.error(res, 'アカウントが無効化されています', 403);
      }

      // JWTトークン生成
      const token = jwt.sign(
        {
          userId: user.id.toString(),
          email: user.email,
          companyId: user.companyId?.toString()
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // リフレッシュトークン生成
      const refreshToken = jwt.sign(
        { userId: user.id.toString() },
        config.jwt.refreshSecret || config.jwt.secret,
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

      return ApiResponse.success(res, {
        token,
        refreshToken,
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          companyId: user.companyId?.toString(),
          companyName: user.company?.name
        }
      });
    } catch (error) {
      logger.error('ログインエラー:', error);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // クライアント側でトークンを削除するため、サーバー側では特に処理なし
      return ApiResponse.success(res, { message: 'ログアウトしました' });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ApiResponse.error(res, 'リフレッシュトークンが必要です', 401);
      }

      // リフレッシュトークン検証
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret || config.jwt.secret
      ) as any;

      // ユーザー情報取得
      const user = await prisma.user.findUnique({
        where: { id: BigInt(decoded.userId) },
        include: { company: true }
      });

      if (!user || !user.isActive) {
        return ApiResponse.error(res, '無効なリフレッシュトークンです', 401);
      }

      // 新しいアクセストークン生成
      const newToken = jwt.sign(
        {
          userId: user.id.toString(),
          email: user.email,
          companyId: user.companyId?.toString()
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return ApiResponse.success(res, { token: newToken });
    } catch (error) {
      logger.error('トークンリフレッシュエラー:', error);
      return ApiResponse.error(res, '無効なリフレッシュトークンです', 401);
    }
  }
}
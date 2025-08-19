import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../types/auth';

/**
 * ロール認証ミドルウェア
 * 指定されたロールを持つユーザーのみアクセスを許可
 */
export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('認証が必要です');
      }

      const userRoles = req.user.roles || [];
      const hasRole = userRoles.some(role => roles.includes(role));
      
      if (!hasRole) {
        throw new ForbiddenError(`この操作を実行するには次のロールが必要です: ${roles.join(', ')}`);
      }

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: error.message
          }
        });
      }
      
      if (error instanceof ForbiddenError) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error.message,
            requiredRoles: roles
          }
        });
      }
      
      console.error('ロールチェックエラー:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'サーバーエラーが発生しました'
        }
      });
    }
  };
};
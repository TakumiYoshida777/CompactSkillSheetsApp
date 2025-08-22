import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        throw new AuthorizationError('認証が必要です', 401);
      }

      const userRole = user.role || user.userRole;
      
      if (!userRole) {
        throw new AuthorizationError('ユーザーロールが設定されていません', 403);
      }

      if (!allowedRoles.includes(userRole)) {
        throw new AuthorizationError('この操作を実行する権限がありません', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        throw new AuthorizationError('認証が必要です', 401);
      }

      const userPermissions = user.permissions || [];
      
      if (!userPermissions.includes(permission)) {
        throw new AuthorizationError('この操作を実行する権限がありません', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
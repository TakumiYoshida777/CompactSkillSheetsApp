import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/authService';
import { logger } from '../config/logger';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    companyId?: string;
  };
}

/**
 * 特定の権限を要求するミドルウェア
 * @param resource リソース名（例: 'user', 'engineer', 'skillsheet'）
 * @param action アクション名（例: 'view', 'create', 'update', 'delete'）
 * @param scope スコープ（例: 'all', 'company', 'own', 'allowed'）
 */
export const requirePermission = (resource: string, action: string, scope?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn('Permission check failed: No user in request');
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      const { userId } = req.user;
      
      // リクエストからターゲットIDを取得（パラメータまたはボディから）
      let targetId: string | undefined;
      if (scope === 'own') {
        targetId = req.params.id || req.params.userId || req.body?.userId;
      } else if (scope === 'company') {
        targetId = req.params.id || req.params.userId || req.body?.userId;
      }
      
      // 権限チェック
      const hasPermission = await AuthService.hasPermission(userId, resource, action, scope, targetId);
      
      if (!hasPermission) {
        const permString = scope ? `${resource}:${action}:${scope}` : `${resource}:${action}`;
        logger.warn(`Permission denied for user ${userId}: ${permString}`);
        return res.status(403).json({
          success: false,
          message: 'この操作を実行する権限がありません'
        });
      }

      const permString = scope ? `${resource}:${action}:${scope}` : `${resource}:${action}`;
      logger.debug(`Permission granted for user ${userId}: ${permString}`);
      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: '権限チェック中にエラーが発生しました'
      });
    }
  };
};

/**
 * 特定のロールを要求するミドルウェア
 * @param roles 必要なロールの配列（いずれか1つ以上を持っていればOK）
 */
export const requireRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn('Role check failed: No user in request');
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      const { userId } = req.user;
      
      // ロールチェック（いずれか1つでも持っていればOK）
      let hasRequiredRole = false;
      for (const role of roles) {
        if (await AuthService.hasRole(userId, role)) {
          hasRequiredRole = true;
          break;
        }
      }
      
      if (!hasRequiredRole) {
        logger.warn(`Role denied for user ${userId}: Required roles: ${roles.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: 'この操作を実行する権限がありません'
        });
      }

      logger.debug(`Role granted for user ${userId}: Required roles: ${roles.join(', ')}`);
      next();
    } catch (error) {
      logger.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'ロールチェック中にエラーが発生しました'
      });
    }
  };
};

/**
 * 管理者権限を要求するミドルウェア
 */
export const requireAdmin = requireRole(['admin']);

/**
 * マネージャー以上の権限を要求するミドルウェア
 */
export const requireManager = requireRole(['admin', 'manager']);

/**
 * 営業以上の権限を要求するミドルウェア
 */
export const requireSales = requireRole(['admin', 'manager', 'sales']);

/**
 * 複数の権限条件を組み合わせるミドルウェア
 * @param conditions 権限条件の配列（OR条件）
 */
export const requireAnyPermission = (conditions: Array<{ resource: string; action: string }>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn('Permission check failed: No user in request');
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      const { userId } = req.user;
      
      // いずれかの権限を持っているかチェック
      let hasAnyPermission = false;
      for (const condition of conditions) {
        if (await AuthService.hasPermission(userId, condition.resource, condition.action)) {
          hasAnyPermission = true;
          break;
        }
      }
      
      if (!hasAnyPermission) {
        const permissionStrings = conditions.map(c => `${c.resource}:${c.action}`);
        logger.warn(`Permission denied for user ${userId}: Required any of: ${permissionStrings.join(', ')}`);
        return res.status(403).json({
          success: false,
          message: 'この操作を実行する権限がありません'
        });
      }

      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: '権限チェック中にエラーが発生しました'
      });
    }
  };
};

/**
 * 自身のリソースまたは特定の権限を要求するミドルウェア
 * @param resourceIdParam リクエストパラメータ中のリソースIDのキー
 * @param permissionResource 権限リソース名
 * @param permissionAction 権限アクション名
 */
export const requireOwnerOrPermission = (
  resourceIdParam: string,
  permissionResource: string,
  permissionAction: string
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn('Permission check failed: No user in request');
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      const { userId } = req.user;
      const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];
      
      // 自身のリソースかチェック
      if (resourceId === userId) {
        logger.debug(`Owner access granted for user ${userId}`);
        return next();
      }
      
      // 権限チェック
      const hasPermission = await AuthService.hasPermission(
        userId,
        permissionResource,
        permissionAction
      );
      
      if (!hasPermission) {
        logger.warn(`Permission denied for user ${userId}: Not owner and missing ${permissionResource}:${permissionAction}`);
        return res.status(403).json({
          success: false,
          message: 'この操作を実行する権限がありません'
        });
      }

      logger.debug(`Permission granted for user ${userId}: ${permissionResource}:${permissionAction}`);
      next();
    } catch (error) {
      logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        message: '権限チェック中にエラーが発生しました'
      });
    }
  };
};

export default {
  requirePermission,
  requireRole,
  requireAdmin,
  requireManager,
  requireSales,
  requireAnyPermission,
  requireOwnerOrPermission
};
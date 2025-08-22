import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('[RBAC Middleware] req.user:', req.user);
    console.log('[RBAC Middleware] allowedRoles:', allowedRoles);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    // roleがundefinedの場合はスキップ（開発用）
    if (!req.user.role) {
      console.log('[RBAC Middleware] User role is undefined, skipping role check');
      return next();
    }

    // 大文字小文字を区別しないロール比較
    const userRole = req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      console.log('[RBAC Middleware] Access denied - user role:', req.user.role, 'allowed:', allowedRoles);
      return res.status(403).json({
        success: false,
        message: 'この操作を実行する権限がありません'
      });
    }

    next();
  };
};
import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { JWTPayload, UnauthorizedError, ForbiddenError } from '../types/auth';

// Expressのリクエスト型を拡張
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      token?: string;
    }
  }
}

/**
 * JWT認証ミドルウェア
 * リクエストヘッダーからトークンを取得し、検証する
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      throw new UnauthorizedError('認証トークンが必要です');
    }

    // トークンを検証
    const decoded = await authService.verifyToken(token);
    
    // リクエストオブジェクトにユーザー情報を追加
    req.user = decoded;
    req.token = token;
    
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
    
    // 予期しないエラー
    console.error('認証エラー:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました'
      }
    });
  }
};

/**
 * オプショナル認証ミドルウェア
 * トークンがある場合のみ検証し、なくてもエラーにしない
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      const decoded = await authService.verifyToken(token);
      req.user = decoded;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // トークンが無効でも続行（ゲストとして扱う）
    next();
  }
};

/**
 * 権限チェックミドルウェア
 * 指定されたリソースとアクションに対する権限をチェック
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('認証が必要です');
      }

      // ユーザー情報を取得
      const user = await authService.getUserById(req.user.userId);
      if (!user) {
        throw new UnauthorizedError('ユーザーが見つかりません');
      }

      // 権限チェック
      const hasPermission = authService.hasPermission(user, resource, action);
      
      if (!hasPermission) {
        throw new ForbiddenError(`この操作を実行する権限がありません（${resource}:${action}）`);
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
            required: { resource, action }
          }
        });
      }
      
      console.error('権限チェックエラー:', error);
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

/**
 * ロールチェックミドルウェア
 * 指定されたロールを持っているかチェック
 */
export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('認証が必要です');
      }

      const hasRole = req.user.roles.some(role => roles.includes(role));
      
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

/**
 * 管理者権限チェックミドルウェア
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('認証が必要です');
    }

    const user = await authService.getUserById(req.user.userId);
    if (!user) {
      throw new UnauthorizedError('ユーザーが見つかりません');
    }

    if (!authService.isAdmin(user)) {
      throw new ForbiddenError('管理者権限が必要です');
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
          message: error.message
        }
      });
    }
    
    console.error('管理者権限チェックエラー:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました'
      }
    });
  }
};

/**
 * 企業IDチェックミドルウェア
 * ユーザーが指定された企業に所属しているかチェック
 */
export const requireCompany = (paramName: string = 'companyId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('認証が必要です');
      }

      const companyId = req.params[paramName] || req.body.companyId;
      
      if (!companyId) {
        throw new Error('企業IDが指定されていません');
      }

      if (req.user.companyId !== companyId) {
        throw new ForbiddenError('この企業のデータにアクセスする権限がありません');
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
            message: error.message
          }
        });
      }
      
      console.error('企業IDチェックエラー:', error);
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
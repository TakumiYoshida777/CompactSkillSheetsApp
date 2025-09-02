import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/security';

// Requestの型を拡張
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId?: string;
        email: string;
        companyId: string;
        username?: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // トークン検証プロセス

  if (!token) {
    // トークンが存在しない場合
    return res.status(401).json({
      success: false,
      message: '認証トークンが必要です'
    });
  }

  const secret = securityConfig.getJwtSecret();

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      // JWT検証失敗（セキュリティ上、詳細エラー情報はログ出力しない）
      return res.status(403).json({
        success: false,
        message: 'トークンが無効です'
      });
    }
    
    // JWT検証成功

    // JWTペイロードからreq.userを構築
    const decodedToken = decoded as jwt.JwtPayload & {
      userId?: string;
      id?: string;
      email: string;
      companyId: string;
      username?: string;
      role: string;
    };
    req.user = {
      id: decodedToken.userId || decodedToken.id || '',
      userId: decodedToken.userId || decodedToken.id,
      email: decodedToken.email,
      companyId: decodedToken.companyId,
      username: decodedToken.username,
      role: decodedToken.role
    };

    next();
  });
};

// エイリアスをエクスポート
export const authMiddleware = authenticateToken;
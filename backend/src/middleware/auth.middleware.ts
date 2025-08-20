import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Requestの型を拡張
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        companyId: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[Auth Middleware] Authorization header:', authHeader);
  console.log('[Auth Middleware] Extracted token:', token ? 'Token exists' : 'No token');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '認証トークンが必要です'
    });
  }

  const secret = process.env.JWT_SECRET || 'your-secret-key';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'トークンが無効です'
      });
    }

    req.user = decoded as {
      id: string;
      email: string;
      companyId: string;
      role: string;
    };

    next();
  });
};

// エイリアスをエクスポート
export const authMiddleware = authenticateToken;
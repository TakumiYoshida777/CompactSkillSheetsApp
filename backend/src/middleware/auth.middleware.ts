import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/security';

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
  console.log('[Auth Middleware] All headers:', JSON.stringify(req.headers, null, 2));
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[Auth Middleware] Authorization header:', authHeader);
  console.log('[Auth Middleware] Extracted token:', token ? `Token exists (length: ${token.length})` : 'No token');

  if (!token) {
    console.log('[Auth Middleware] No token found - returning 401');
    return res.status(401).json({
      success: false,
      message: '認証トークンが必要です'
    });
  }

  const secret = securityConfig.getJwtSecret();

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.log('[Auth Middleware] JWT verification failed:', err.message);
      console.log('[Auth Middleware] JWT_SECRET length:', secret.length);
      return res.status(403).json({
        success: false,
        message: 'トークンが無効です'
      });
    }
    
    console.log('[Auth Middleware] JWT verification successful, user:', decoded);

    // JWTペイロードからreq.userを構築
    const decodedToken = decoded as any;
    req.user = {
      id: decodedToken.userId || decodedToken.id,
      userId: decodedToken.userId || decodedToken.id,
      email: decodedToken.email,
      companyId: decodedToken.companyId,
      username: decodedToken.username,
      role: decodedToken.role
    } as any;

    next();
  });
};

// エイリアスをエクスポート
export const authMiddleware = authenticateToken;
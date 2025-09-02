import { errorLog } from '../utils/logger';

/**
 * JWTトークンをデコードしてペイロードを取得
 */
export function decodeJWT(token: string): any {
  try {
    // JWTは3つの部分（header.payload.signature）で構成される
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // ペイロード部分（2番目）をデコード
    const payload = parts[1];
    
    // Base64URLデコード
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    errorLog('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * JWTトークンからuserTypeを取得
 */
export function getUserTypeFromToken(token: string): string | null {
  const decoded = decodeJWT(token);
  return decoded?.userType || null;
}

/**
 * JWTトークンの有効期限をチェック
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  // exp は秒単位のUnixタイムスタンプ
  const expirationTime = decoded.exp * 1000;
  return Date.now() >= expirationTime;
}
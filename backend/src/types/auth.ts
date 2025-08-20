// 認証関連の型定義

export interface JWTPayload {
  id: string;  // userIdと同じ値（互換性のため）
  userId: string;
  companyId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  roles: Role[];
  permissions: Permission[];
  engineerId?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Company {
  id: string;
  name: string;
  companyType: 'ses' | 'client';
  emailDomain?: string;
  address?: string;
  phone?: string;
  websiteUrl?: string;
  contactEmail?: string;
  maxEngineers: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

// エラー定義
export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = '認証が必要です') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = '権限が不足しています') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// 定数
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  ENGINEER: 'engineer',
  CLIENT: 'client',
} as const;

export const PERMISSIONS = {
  // ユーザー管理
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // エンジニア管理
  ENGINEER_VIEW: 'engineer:view',
  ENGINEER_CREATE: 'engineer:create',
  ENGINEER_UPDATE: 'engineer:update',
  ENGINEER_DELETE: 'engineer:delete',
  
  // プロジェクト管理
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  
  // 企業管理
  COMPANY_VIEW: 'company:view',
  COMPANY_CREATE: 'company:create',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  
  // オファー管理
  OFFER_VIEW: 'offer:view',
  OFFER_CREATE: 'offer:create',
  OFFER_UPDATE: 'offer:update',
  OFFER_DELETE: 'offer:delete',
  
  // システム管理
  SYSTEM_ADMIN: 'system:admin',
} as const;
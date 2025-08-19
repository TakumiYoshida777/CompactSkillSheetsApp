/**
 * 認証ストアの型定義 - 責務ごとに分割
 */

// =====================================
// 基本データ型
// =====================================

export interface Company {
  id: string;
  name: string;
  companyType: 'ses' | 'client';
  emailDomain?: string;
  maxEngineers: number;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  company?: Company;
  roles: string[];
  permissions: string[];
  engineerId?: string;
  avatarUrl?: string;
  userType?: 'ses' | 'client' | 'engineer';
  clientCompany?: Company;
  sesCompany?: Company;
  department?: string;
  position?: string;
}

// =====================================
// 状態管理インターフェース
// =====================================

/**
 * 認証状態
 */
export interface AuthenticationState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * 認証アクション
 */
export interface AuthenticationActions {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  clientLogin: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

/**
 * トークン管理アクション
 */
export interface TokenManagementActions {
  setAuthTokens: (user: User, accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<void>;
}

/**
 * ユーザー管理アクション
 */
export interface UserManagementActions {
  updateProfile: (data: any) => Promise<void>;
}

/**
 * 権限チェックアクション
 */
export interface PermissionActions {
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isClientUser: () => boolean;
}

// =====================================
// 統合インターフェース
// =====================================

/**
 * 認証ストアの完全な型定義
 */
export interface AuthState extends 
  AuthenticationState,
  AuthenticationActions,
  TokenManagementActions,
  UserManagementActions,
  PermissionActions {}

// =====================================
// ユーティリティ型
// =====================================

/**
 * ログイン認証情報
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * プロフィール更新データ
 */
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  avatarUrl?: string;
  department?: string;
  position?: string;
}

/**
 * 認証レスポンス
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

/**
 * トークンペイロード
 */
export interface TokenPayload {
  userId: string;
  email: string;
  userType?: 'ses' | 'client' | 'engineer';
  exp: number;
  iat: number;
}
/**
 * 認証関連の型定義
 */

/**
 * ユーザーロール
 */
export interface UserRole {
  id: string
  name: string
  permissions?: string[]
  createdAt?: string
  updatedAt?: string
}

/**
 * ユーザー情報
 */
export interface User {
  id: string
  email: string
  name: string
  roles: UserRole[]
  avatar?: string
  phone?: string
  department?: string
  position?: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * ログインリクエスト
 */
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * ログインレスポンス
 */
export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

/**
 * 登録リクエスト
 */
export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone?: string
  company?: string
  position?: string
  agreeToTerms: boolean
}

/**
 * 登録レスポンス
 */
export interface RegisterResponse {
  user: User
  message: string
}

/**
 * パスワードリセットリクエスト
 */
export interface PasswordResetRequest {
  email: string
}

/**
 * パスワードリセット確認リクエスト
 */
export interface PasswordResetConfirmRequest {
  token: string
  password: string
  confirmPassword: string
}

/**
 * プロフィール更新リクエスト
 */
export interface ProfileUpdateRequest {
  name?: string
  email?: string
  phone?: string
  department?: string
  position?: string
  avatar?: string
}

/**
 * パスワード変更リクエスト
 */
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * トークンリフレッシュレスポンス
 */
export interface TokenRefreshResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

/**
 * 認証状態
 */
export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
}

/**
 * 認証コンテキスト
 */
export interface AuthContextValue extends AuthState {
  login: (request: LoginRequest) => Promise<void>
  logout: () => void
  register: (request: RegisterRequest) => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (request: ProfileUpdateRequest) => Promise<void>
  changePassword: (request: PasswordChangeRequest) => Promise<void>
  resetPassword: (request: PasswordResetRequest) => Promise<void>
  confirmPasswordReset: (request: PasswordResetConfirmRequest) => Promise<void>
  checkAuth: () => Promise<void>
  hasRole: (role: string | string[]) => boolean
  hasPermission: (permission: string | string[]) => boolean
}
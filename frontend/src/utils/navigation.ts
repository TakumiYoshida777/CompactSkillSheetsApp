/**
 * ナビゲーション関連のユーティリティ関数
 */

/**
 * パスパーツを結合して正規化されたパスを生成する
 * @param parts - パスの各部分
 * @returns 正規化されたパス文字列
 * @example
 * buildPath('business-partners', partnerId, 'edit') // => '/business-partners/123/edit'
 * buildPath('/engineers/', engineerId) // => '/engineers/456'
 */
export const buildPath = (...parts: (string | number | undefined)[]): string => {
  return '/' + parts
    .filter(part => part !== undefined && part !== null && part !== '')
    .map(part => String(part).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
};

/**
 * 現在のパスに基づいて適切なログインページのパスを返す
 * @param currentPath - 現在のパス
 * @returns ログインページのパス
 */
export const getLoginPath = (currentPath: string): string => {
  if (currentPath.includes('/client')) {
    return '/client/login';
  } else if (currentPath.includes('/engineer')) {
    return '/engineer/login';
  }
  return '/login';
};

/**
 * パスが絶対パスかどうかを判定する
 * @param path - チェックするパス
 * @returns 絶対パスの場合true
 */
export const isAbsolutePath = (path: string): boolean => {
  return path.startsWith('/');
};

/**
 * パスを正規化する（重複するスラッシュを削除）
 * @param path - 正規化するパス
 * @returns 正規化されたパス
 */
export const normalizePath = (path: string): string => {
  // 複数の連続するスラッシュを1つに置換
  const normalized = path.replace(/\/+/g, '/');
  // 末尾のスラッシュを削除（ルートパスを除く）
  return normalized === '/' ? normalized : normalized.replace(/\/$/, '');
};

/**
 * クエリパラメータを含むパスを構築する
 * @param path - ベースパス
 * @param params - クエリパラメータのオブジェクト
 * @returns クエリパラメータを含むパス
 */
export const buildPathWithQuery = (path: string, params: Record<string, any>): string => {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  return queryString ? `${path}?${queryString}` : path;
};

/**
 * 認証エラー時のリダイレクト先を取得する
 * @param userType - ユーザータイプ
 * @returns リダイレクト先のパス
 */
export const getAuthRedirectPath = (userType?: string): string => {
  switch (userType) {
    case 'client':
      return '/client/login';
    case 'engineer':
      return '/engineer/login';
    default:
      return '/login';
  }
};

/**
 * ホームページのパスを取得する
 * @param userType - ユーザータイプ
 * @returns ホームページのパス
 */
export const getHomePath = (userType?: string): string => {
  switch (userType) {
    case 'client':
      return '/client/offer-board';
    case 'engineer':
      return '/engineer/dashboard';
    default:
      return '/dashboard';
  }
};
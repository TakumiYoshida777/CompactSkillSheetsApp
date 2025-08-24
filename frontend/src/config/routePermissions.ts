/**
 * ルートごとの必要権限設定
 * 各ルートに必要な権限を定義
 */

export interface RoutePermission {
  resource: string;
  action: string;
  scope?: string;
}

export const ROUTE_PERMISSIONS: Record<string, RoutePermission[]> = {
  // ダッシュボード
  '/dashboard': [],  // 認証のみ必要

  // エンジニア管理
  '/engineers/list': [
    { resource: 'engineer', action: 'view', scope: 'company' }
  ],
  '/engineers/register': [
    { resource: 'engineer', action: 'create' }
  ],
  '/engineers/:id': [
    { resource: 'engineer', action: 'view', scope: 'company' }
  ],
  '/engineers/edit/:id': [
    { resource: 'engineer', action: 'update', scope: 'company' }
  ],

  // スキルシート管理
  '/skillsheets/list': [
    { resource: 'skillsheet', action: 'view', scope: 'company' }
  ],
  '/skillsheets/:id': [
    { resource: 'skillsheet', action: 'view', scope: 'company' }
  ],
  '/skillsheets/edit/:id': [
    { resource: 'skillsheet', action: 'update', scope: 'company' }
  ],

  // プロジェクト管理
  '/projects/list': [
    { resource: 'project', action: 'view', scope: 'company' }
  ],
  '/projects/new': [
    { resource: 'project', action: 'create' }
  ],
  '/projects/:id': [
    { resource: 'project', action: 'view', scope: 'company' }
  ],
  '/projects/edit/:id': [
    { resource: 'project', action: 'update', scope: 'company' }
  ],

  // アプローチ管理
  '/approaches/history': [
    { resource: 'approach', action: 'view', scope: 'company' }
  ],
  '/approaches/create': [
    { resource: 'approach', action: 'create' }
  ],

  // 取引先管理
  '/business-partners': [
    { resource: 'partner', action: 'view', scope: 'company' }
  ],
  '/business-partners/new': [
    { resource: 'partner', action: 'create' }
  ],
  '/business-partners/:id': [
    { resource: 'partner', action: 'view', scope: 'company' }
  ],
  '/business-partners/:id/edit': [
    { resource: 'partner', action: 'update', scope: 'company' }
  ],
  '/business-partners/:partnerId/users': [
    { resource: 'partner', action: 'manage' }
  ],
  '/business-partners/:partnerId/access-control': [
    { resource: 'partner', action: 'manage' }
  ],
  '/business-partners/:partnerId/ng-list': [
    { resource: 'partner', action: 'manage' }
  ],

  // 設定
  '/settings': [
    { resource: 'settings', action: 'view' }
  ],

  // プロフィール
  '/profile': [],  // 自分のプロフィールは誰でも見れる

  // クライアント向けページ
  '/client/offers': [
    { resource: 'offer', action: 'view', scope: 'company' }
  ],
  '/client/offers/create': [
    { resource: 'offer', action: 'create' }
  ],
  '/client/engineers/search': [
    { resource: 'skillsheet', action: 'search', scope: 'allowed' }
  ],
};

/**
 * ルートパスから必要な権限を取得
 */
export const getRoutePermissions = (path: string): RoutePermission[] => {
  // 完全一致を優先
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path];
  }

  // パラメータを含むパスのマッチング
  const pathSegments = path.split('/');
  const routeKeys = Object.keys(ROUTE_PERMISSIONS);
  
  for (const route of routeKeys) {
    const routeSegments = route.split('/');
    
    // セグメント数が一致しない場合はスキップ
    if (pathSegments.length !== routeSegments.length) {
      continue;
    }
    
    // 各セグメントをチェック
    let matches = true;
    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const pathSegment = pathSegments[i];
      
      // パラメータ（:で始まる）の場合はスキップ
      if (routeSegment.startsWith(':')) {
        continue;
      }
      
      // 完全一致しない場合は不一致
      if (routeSegment !== pathSegment) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      return ROUTE_PERMISSIONS[route];
    }
  }
  
  // マッチしない場合は空配列を返す（認証のみ必要）
  return [];
};

/**
 * ユーザーがルートにアクセスできるかチェック
 */
export const canAccessRoute = (
  path: string,
  hasPermission: (resource: string, action: string, scope?: string) => boolean
): boolean => {
  const requiredPermissions = getRoutePermissions(path);
  
  // 権限が不要な場合は認証のみでOK
  if (requiredPermissions.length === 0) {
    return true;
  }
  
  // 全ての必要権限を満たしているかチェック
  return requiredPermissions.every(perm => 
    hasPermission(perm.resource, perm.action, perm.scope)
  );
};
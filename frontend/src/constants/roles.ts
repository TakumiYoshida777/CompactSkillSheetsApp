/**
 * ユーザーロール定数
 */

// SES企業側のロール
export const SES_ROLES = {
  ADMIN: 'admin',
  SALES: 'sales',
  ENGINEER: 'engineer',
  // 日本語ロール名のサポート
  管理者: 'admin',
  営業: 'sales',
  エンジニア: 'engineer',
} as const;

// 取引先企業側のロール
export const CLIENT_ROLES = {
  CLIENT_ADMIN: 'client_admin',
  CLIENT_USER: 'client_user',
  CLIENT_PM: 'client_pm',
} as const;

// フリーランスのロール
export const FREELANCE_ROLES = {
  FREELANCER: 'freelancer',
  フリーランス: 'freelancer',
} as const;

// すべてのロール
export const ALL_ROLES = {
  ...SES_ROLES,
  ...CLIENT_ROLES,
  ...FREELANCE_ROLES,
} as const;

// ロールタイプ
export type SESRole = typeof SES_ROLES[keyof typeof SES_ROLES];
export type ClientRole = typeof CLIENT_ROLES[keyof typeof CLIENT_ROLES];
export type FreelanceRole = typeof FREELANCE_ROLES[keyof typeof FREELANCE_ROLES];
export type UserRole = SESRole | ClientRole | FreelanceRole;

// エンジニア登録権限を持つロール
export const ENGINEER_REGISTER_ROLES: readonly string[] = [
  SES_ROLES.ADMIN,
  SES_ROLES.SALES,
  SES_ROLES.管理者,
  SES_ROLES.営業,
];

// 権限チェックヘルパー関数
export const canRegisterEngineer = (userRoles: string | string[] | Array<{name: string}> | undefined): boolean => {
  if (!userRoles) return false;
  
  // オブジェクトの配列の場合（{name: string}[]）
  if (Array.isArray(userRoles) && userRoles.length > 0 && typeof userRoles[0] === 'object' && 'name' in userRoles[0]) {
    return userRoles.some((role: any) => ENGINEER_REGISTER_ROLES.includes(role.name));
  }
  
  // 文字列の配列の場合
  if (Array.isArray(userRoles)) {
    return userRoles.some(role => ENGINEER_REGISTER_ROLES.includes(role));
  }
  
  // 単一の文字列の場合
  return ENGINEER_REGISTER_ROLES.includes(userRoles);
};

// エンジニア編集権限を持つロール
export const ENGINEER_EDIT_ROLES: readonly string[] = [
  SES_ROLES.ADMIN,
  SES_ROLES.SALES,
  SES_ROLES.管理者,
  SES_ROLES.営業,
  SES_ROLES.ENGINEER, // 自分のデータのみ
  SES_ROLES.エンジニア,
];

// エンジニア閲覧権限を持つロール
export const ENGINEER_VIEW_ROLES: readonly string[] = [
  ...ENGINEER_EDIT_ROLES,
  CLIENT_ROLES.CLIENT_ADMIN,
  CLIENT_ROLES.CLIENT_USER,
  CLIENT_ROLES.CLIENT_PM,
];

// プロジェクト管理権限を持つロール
export const PROJECT_MANAGE_ROLES: readonly string[] = [
  SES_ROLES.ADMIN,
  SES_ROLES.SALES,
  SES_ROLES.管理者,
  SES_ROLES.営業,
];

// アプローチ送信権限を持つロール
export const APPROACH_SEND_ROLES: readonly string[] = [
  SES_ROLES.ADMIN,
  SES_ROLES.SALES,
  SES_ROLES.管理者,
  SES_ROLES.営業,
];

// ロール表示名のマッピング
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: '管理者',
  sales: '営業',
  engineer: 'エンジニア',
  client_admin: '取引先管理者',
  client_user: '取引先ユーザー',
  client_pm: '取引先PM',
  freelancer: 'フリーランス',
  管理者: '管理者',
  営業: '営業',
  エンジニア: 'エンジニア',
  フリーランス: 'フリーランス',
};

// ロールの優先度（権限の強さ）
export const ROLE_PRIORITY: Record<string, number> = {
  admin: 100,
  管理者: 100,
  sales: 80,
  営業: 80,
  client_admin: 70,
  client_pm: 60,
  client_user: 50,
  engineer: 40,
  エンジニア: 40,
  freelancer: 30,
  フリーランス: 30,
};

// 最高権限のロールを取得
export const getHighestRole = (roles: string[]): string | null => {
  if (!roles || roles.length === 0) return null;
  
  return roles.reduce((highest, current) => {
    const currentPriority = ROLE_PRIORITY[current] || 0;
    const highestPriority = ROLE_PRIORITY[highest] || 0;
    return currentPriority > highestPriority ? current : highest;
  }, roles[0]);
};
import { usePermissions, useHasPermission } from './usePermissions';

/**
 * 権限チェック用のカスタムフック
 * ハードコーディングされた権限チェックを置き換えるために使用
 */
export const usePermissionCheck = () => {
  const hasPermission = useHasPermission();

  return {
    // エンジニア関連の権限
    canViewEngineer: (scope?: string) => hasPermission('engineer', 'view', scope || 'company'),
    canCreateEngineer: () => hasPermission('engineer', 'create'),
    canEditEngineer: (scope?: string) => hasPermission('engineer', 'update', scope || 'company'),
    canDeleteEngineer: () => hasPermission('engineer', 'delete'),
    canExportEngineer: () => hasPermission('engineer', 'export'),

    // スキルシート関連の権限
    canViewSkillSheet: (scope?: string) => hasPermission('skillsheet', 'view', scope || 'company'),
    canCreateSkillSheet: () => hasPermission('skillsheet', 'create'),
    canEditSkillSheet: (scope?: string) => hasPermission('skillsheet', 'update', scope || 'company'),
    canDeleteSkillSheet: () => hasPermission('skillsheet', 'delete'),
    canExportSkillSheet: () => hasPermission('skillsheet', 'export'),

    // プロジェクト関連の権限
    canViewProject: (scope?: string) => hasPermission('project', 'view', scope || 'company'),
    canCreateProject: () => hasPermission('project', 'create'),
    canEditProject: (scope?: string) => hasPermission('project', 'update', scope || 'company'),
    canDeleteProject: () => hasPermission('project', 'delete'),
    canAssignProject: () => hasPermission('project', 'assign'),

    // 取引先関連の権限
    canViewPartner: (scope?: string) => hasPermission('partner', 'view', scope || 'company'),
    canCreatePartner: () => hasPermission('partner', 'create'),
    canEditPartner: (scope?: string) => hasPermission('partner', 'update', scope || 'company'),
    canDeletePartner: () => hasPermission('partner', 'delete'),
    canManagePartner: () => hasPermission('partner', 'manage'),

    // アプローチ関連の権限
    canViewApproach: (scope?: string) => hasPermission('approach', 'view', scope || 'company'),
    canCreateApproach: () => hasPermission('approach', 'create'),
    canEditApproach: () => hasPermission('approach', 'update'),
    canDeleteApproach: () => hasPermission('approach', 'delete'),
    canSendApproach: () => hasPermission('approach', 'send'),

    // オファー関連の権限
    canViewOffer: (scope?: string) => hasPermission('offer', 'view', scope || 'company'),
    canCreateOffer: () => hasPermission('offer', 'create'),
    canEditOffer: () => hasPermission('offer', 'update'),
    canDeleteOffer: () => hasPermission('offer', 'delete'),

    // ユーザー管理関連の権限
    canViewUser: (scope?: string) => hasPermission('user', 'view', scope || 'company'),
    canCreateUser: () => hasPermission('user', 'create'),
    canEditUser: (scope?: string) => hasPermission('user', 'update', scope || 'company'),
    canDeleteUser: () => hasPermission('user', 'delete'),
    canManageUserRole: () => hasPermission('user', 'manage_role'),

    // 企業管理関連の権限
    canViewCompany: (scope?: string) => hasPermission('company', 'view', scope || 'own'),
    canEditCompany: (scope?: string) => hasPermission('company', 'update', scope || 'own'),

    // 契約関連の権限
    canViewContract: (scope?: string) => hasPermission('contract', 'view', scope || 'company'),
    canCreateContract: () => hasPermission('contract', 'create'),
    canEditContract: () => hasPermission('contract', 'update'),

    // レポート関連の権限
    canViewReport: (scope?: string) => hasPermission('report', 'view', scope || 'company'),
    canCreateReport: () => hasPermission('report', 'create'),
    canExportReport: () => hasPermission('report', 'export'),

    // 設定関連の権限
    canViewSettings: () => hasPermission('settings', 'view'),
    canEditSettings: () => hasPermission('settings', 'update'),

    // 汎用権限チェック
    hasPermission,
  };
};

/**
 * 後方互換性のためのロールベース権限チェック
 * @deprecated 新規実装では usePermissionCheck を使用してください
 */
export const useRoleCheck = () => {
  const { data: userRoles } = useUserRoles();
  
  const hasRole = (role: string | string[]): boolean => {
    if (!userRoles?.data) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return userRoles.data.some((userRole: any) => 
      roles.includes(userRole.name)
    );
  };

  return {
    hasRole,
    isAdmin: () => hasRole(['admin', '管理者']),
    isSales: () => hasRole(['sales', '営業']),
    isEngineer: () => hasRole(['engineer', 'エンジニア']),
    isClientAdmin: () => hasRole('client_admin'),
    isClientUser: () => hasRole('client_user'),
  };
};

// useUserRolesをインポート
import { useUserRoles } from './usePermissions';
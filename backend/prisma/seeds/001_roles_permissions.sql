-- 権限管理システム初期データ投入スクリプト
-- 実行日: 2025年8月23日
-- 目的: Rolesテーブル、Permissionsテーブルへの初期データ投入

-- ========================================
-- 1. Rolesテーブルへの初期データ投入
-- ========================================
BEGIN;

-- 既存データのクリア（開発環境のみ）
DELETE FROM role_permissions;
DELETE FROM user_roles;
DELETE FROM permissions;
DELETE FROM roles;

-- 基本ロールの追加
INSERT INTO roles (name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES
('admin', '管理者', 'システム全体の管理権限を持つロール', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('manager', 'マネージャー', 'ユーザー管理とプロジェクト管理権限を持つロール', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('sales', '営業', '取引先管理とエンジニア情報閲覧権限を持つロール', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('engineer', 'エンジニア', '自身のスキルシート管理権限を持つロール', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('client_admin', '取引先管理者', '取引先企業の管理者権限を持つロール', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('client_sales', '取引先営業', '取引先企業の営業権限を持つロール', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('client_pm', '取引先PM', '取引先企業のプロジェクトマネージャー権限を持つロール', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 2. Permissionsテーブルへの初期データ投入
-- ========================================

-- ユーザー管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('user:view', 'ユーザー閲覧', 'user', 'view', 'ユーザー情報を閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user:create', 'ユーザー作成', 'user', 'create', 'ユーザーを作成する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user:update', 'ユーザー更新', 'user', 'update', 'ユーザー情報を更新する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user:delete', 'ユーザー削除', 'user', 'delete', 'ユーザーを削除する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user:manage_role', 'ロール管理', 'user', 'manage_role', 'ユーザーのロールを管理する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- エンジニア管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('engineer:view', 'エンジニア閲覧', 'engineer', 'view', 'エンジニア情報を閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('engineer:create', 'エンジニア作成', 'engineer', 'create', 'エンジニアを作成する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('engineer:update', 'エンジニア更新', 'engineer', 'update', 'エンジニア情報を更新する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('engineer:delete', 'エンジニア削除', 'engineer', 'delete', 'エンジニアを削除する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('engineer:export', 'エンジニアエクスポート', 'engineer', 'export', 'エンジニア情報をエクスポートする権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- スキルシート管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('skillsheet:view', 'スキルシート閲覧', 'skillsheet', 'view', 'スキルシートを閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('skillsheet:create', 'スキルシート作成', 'skillsheet', 'create', 'スキルシートを作成する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('skillsheet:update', 'スキルシート更新', 'skillsheet', 'update', 'スキルシートを更新する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('skillsheet:delete', 'スキルシート削除', 'skillsheet', 'delete', 'スキルシートを削除する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('skillsheet:export', 'スキルシートエクスポート', 'skillsheet', 'export', 'スキルシートをエクスポートする権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- プロジェクト管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('project:view', 'プロジェクト閲覧', 'project', 'view', 'プロジェクト情報を閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('project:create', 'プロジェクト作成', 'project', 'create', 'プロジェクトを作成する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('project:update', 'プロジェクト更新', 'project', 'update', 'プロジェクト情報を更新する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('project:delete', 'プロジェクト削除', 'project', 'delete', 'プロジェクトを削除する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('project:assign', 'プロジェクトアサイン', 'project', 'assign', 'エンジニアをプロジェクトにアサインする権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 取引先管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('partner:view', '取引先閲覧', 'partner', 'view', '取引先情報を閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('partner:create', '取引先作成', 'partner', 'create', '取引先を作成する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('partner:update', '取引先更新', 'partner', 'update', '取引先情報を更新する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('partner:delete', '取引先削除', 'partner', 'delete', '取引先を削除する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('partner:manage', '取引先管理', 'partner', 'manage', '取引先の設定を管理する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- アプローチ管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('approach:view', 'アプローチ閲覧', 'approach', 'view', 'アプローチ情報を閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('approach:create', 'アプローチ作成', 'approach', 'create', 'アプローチを作成する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('approach:update', 'アプローチ更新', 'approach', 'update', 'アプローチ情報を更新する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('approach:delete', 'アプローチ削除', 'approach', 'delete', 'アプローチを削除する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('approach:send', 'アプローチ送信', 'approach', 'send', 'アプローチを送信する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- オファー管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('offer:view', 'オファー閲覧', 'offer', 'view', 'オファー情報を閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('offer:create', 'オファー作成', 'offer', 'create', 'オファーを作成する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('offer:update', 'オファー更新', 'offer', 'update', 'オファー情報を更新する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('offer:delete', 'オファー削除', 'offer', 'delete', 'オファーを削除する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('offer:respond', 'オファー回答', 'offer', 'respond', 'オファーに回答する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- レポート管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('report:view', 'レポート閲覧', 'report', 'view', 'レポートを閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('report:create', 'レポート作成', 'report', 'create', 'レポートを作成する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('report:export', 'レポートエクスポート', 'report', 'export', 'レポートをエクスポートする権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 設定管理権限
INSERT INTO permissions (name, "displayName", resource, action, description, "createdAt", "updatedAt") VALUES
('settings:view', '設定閲覧', 'settings', 'view', 'システム設定を閲覧する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('settings:update', '設定更新', 'settings', 'update', 'システム設定を更新する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('settings:manage', '設定管理', 'settings', 'manage', 'システム設定を管理する権限', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================
-- 3. Role_permissionsテーブルへの初期データ投入
-- ========================================

-- 管理者ロールには全権限を付与
INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin';

-- マネージャーロールの権限
INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'manager'
AND p.name IN (
    'user:view', 'user:create', 'user:update',
    'engineer:view', 'engineer:create', 'engineer:update',
    'skillsheet:view', 'skillsheet:update',
    'project:view', 'project:create', 'project:update', 'project:assign',
    'partner:view', 'partner:create', 'partner:update',
    'approach:view', 'approach:create', 'approach:update', 'approach:send',
    'offer:view', 'offer:create', 'offer:update',
    'report:view', 'report:create', 'report:export'
);

-- 営業ロールの権限
INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'sales'
AND p.name IN (
    'engineer:view',
    'skillsheet:view',
    'project:view',
    'partner:view', 'partner:create', 'partner:update',
    'approach:view', 'approach:create', 'approach:update', 'approach:send',
    'offer:view', 'offer:create', 'offer:update',
    'report:view'
);

-- エンジニアロールの権限
INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'engineer'
AND p.name IN (
    'skillsheet:view', 'skillsheet:update',
    'project:view'
);

-- 取引先管理者ロールの権限
INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'client_admin'
AND p.name IN (
    'engineer:view',
    'skillsheet:view',
    'offer:view', 'offer:respond'
);

-- 取引先営業ロールの権限
INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'client_sales'
AND p.name IN (
    'engineer:view',
    'skillsheet:view',
    'offer:view', 'offer:respond'
);

-- 取引先PMロールの権限
INSERT INTO role_permissions ("roleId", "permissionId", "createdAt")
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'client_pm'
AND p.name IN (
    'engineer:view',
    'skillsheet:view'
);

COMMIT;

-- ========================================
-- 4. 既存ユーザーへのロール割り当て（サンプル）
-- ========================================
-- 注意: 以下は既存ユーザーがいる場合のサンプルです。
-- 実際の環境に合わせて調整してください。

/*
-- 既存ユーザーにロールを割り当てる例
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt")
SELECT 
    u.id,
    r.id,
    1, -- システム管理者のIDを指定
    CURRENT_TIMESTAMP
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@example.com' AND r.name = 'admin';
*/

-- ========================================
-- 5. 動作確認用クエリ
-- ========================================

-- ロールと権限の確認
SELECT 
    r.name as role_name,
    r."displayName" as role_display,
    COUNT(rp."permissionId") as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp."roleId"
GROUP BY r.id, r.name, r."displayName"
ORDER BY r.id;

-- 特定ロールの権限一覧確認
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p."displayName" as permission_display,
    p.resource,
    p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp."roleId"
JOIN permissions p ON rp."permissionId" = p.id
WHERE r.name = 'sales'
ORDER BY p.resource, p.action;
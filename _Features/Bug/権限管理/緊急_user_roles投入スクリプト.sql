-- =====================================================
-- user_rolesテーブル 緊急データ投入スクリプト
-- 実行日: 2025年1月24日
-- 目的: 権限管理システムを動作させるための最小限のデータ投入
-- =====================================================

-- 既存データの確認（実行前に確認用）
SELECT u.id, u.name, u.email FROM users u ORDER BY id;
SELECT r.id, r.name, r."displayName" FROM roles r ORDER BY id;

-- =====================================================
-- user_rolesテーブルへのデータ投入
-- =====================================================

BEGIN;

-- 1. 管理者ユーザー（admin@example-ses.local）にadminロールを付与
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt")
SELECT 
    u.id,
    r.id,
    1, -- システム管理者が付与
    NOW()
FROM users u, roles r
WHERE u.email = 'admin@example-ses.local'
  AND r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur."userId" = u.id AND ur."roleId" = r.id
  );

-- 2. 一般ユーザー（user@example-ses.local）にsalesロールを付与
-- （または必要に応じてengineerロールに変更）
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt")
SELECT 
    u.id,
    r.id,
    1, -- システム管理者が付与
    NOW()
FROM users u, roles r
WHERE u.email = 'user@example-ses.local'
  AND r.name = 'sales' -- または 'engineer'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur."userId" = u.id AND ur."roleId" = r.id
  );

-- 3. クライアント管理者（admin@example-client.local）にclient_adminロールを付与
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt")
SELECT 
    u.id,
    r.id,
    1, -- システム管理者が付与
    NOW()
FROM users u, roles r
WHERE u.email = 'admin@example-client.local'
  AND r.name = 'client_admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur."userId" = u.id AND ur."roleId" = r.id
  );

-- =====================================================
-- 投入結果の確認
-- =====================================================

-- ユーザーとロールの関連を確認
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    r.name as role_name,
    r."displayName" as role_display,
    ur."createdAt"
FROM user_roles ur
JOIN users u ON ur."userId" = u.id
JOIN roles r ON ur."roleId" = r.id
ORDER BY u.id;

-- 各ユーザーの権限数を確認
SELECT 
    u.name as user_name,
    r.name as role_name,
    COUNT(DISTINCT p.id) as permission_count
FROM user_roles ur
JOIN users u ON ur."userId" = u.id
JOIN roles r ON ur."roleId" = r.id
JOIN role_permissions rp ON rp."roleId" = r.id
JOIN permissions p ON rp."permissionId" = p.id
GROUP BY u.name, r.name
ORDER BY u.name;

-- adminユーザーの具体的な権限を確認（サンプル）
SELECT 
    p.name as permission,
    p."displayName",
    p.resource,
    p.action,
    p.scope
FROM user_roles ur
JOIN users u ON ur."userId" = u.id
JOIN roles r ON ur."roleId" = r.id
JOIN role_permissions rp ON rp."roleId" = r.id
JOIN permissions p ON rp."permissionId" = p.id
WHERE u.email = 'admin@example-ses.local'
ORDER BY p.resource, p.action, p.scope
LIMIT 20;

COMMIT;

-- =====================================================
-- 追加: 他のユーザーがいる場合の汎用スクリプト
-- =====================================================

-- エンジニアテーブルのユーザーにengineerロールを付与する例
/*
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt")
SELECT 
    e."userId",
    r.id,
    1,
    NOW()
FROM engineers e
JOIN roles r ON r.name = 'engineer'
WHERE e."userId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur."userId" = e."userId"
  );
*/

-- =====================================================
-- ロールバック用（必要な場合のみ）
-- =====================================================
-- DELETE FROM user_roles WHERE "grantedBy" = 1 AND "createdAt" >= '2025-01-24';
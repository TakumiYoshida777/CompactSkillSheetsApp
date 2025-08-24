-- 本番環境用 user_roles投入スクリプト
-- 実行日: 2025-08-24
-- 目的: 本番環境のユーザーに適切なロールを割り当てる
--
-- 注意事項:
-- 1. 本番環境で実行する前に必ずバックアップを取得すること
-- 2. 既存のuser_rolesデータがある場合は重複しないように注意
-- 3. grantedByのユーザーIDは適切な管理者IDに変更すること

-- トランザクション開始
BEGIN;

-- 既存のuser_rolesをクリア（必要に応じてコメントアウト）
-- DELETE FROM user_roles;

-- 管理者ロールの割り当て
-- 管理者メールアドレスを本番環境のものに変更してください
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt", "updatedAt")
SELECT 
    u.id,
    r.id,
    1, -- 初期設定なので管理者ID(1)で設定
    NOW(),
    NOW()
FROM users u
CROSS JOIN roles r
WHERE 
    u.email IN (
        -- 管理者ユーザーのメールアドレス（本番環境に合わせて変更）
        'admin@production-company.com'
        -- 必要に応じて追加
    )
    AND r.name = 'admin'
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur."userId" = u.id AND ur."roleId" = r.id
    );

-- SES企業管理者ロールの割り当て
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt", "updatedAt")
SELECT 
    u.id,
    r.id,
    1,
    NOW(),
    NOW()
FROM users u
JOIN companies c ON u."companyId" = c.id
CROSS JOIN roles r
WHERE 
    c."companyType" = 'SES_COMPANY'
    AND u.email LIKE '%@%' -- 管理者権限を持つべきユーザーのパターン
    AND r.name = 'ses_company_admin'
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur."userId" = u.id AND ur."roleId" = r.id
    );

-- 営業ロールの割り当て
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt", "updatedAt")
SELECT 
    u.id,
    r.id,
    1,
    NOW(),
    NOW()
FROM users u
JOIN companies c ON u."companyId" = c.id
CROSS JOIN roles r
WHERE 
    c."companyType" = 'SES_COMPANY'
    AND r.name = 'sales'
    -- 営業部門のユーザーを識別する条件を追加
    -- 例: AND u.department = 'sales'
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur."userId" = u.id AND ur."roleId" = r.id
    );

-- エンジニアロールの割り当て
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt", "updatedAt")
SELECT 
    u.id,
    r.id,
    1,
    NOW(),
    NOW()
FROM users u
JOIN companies c ON u."companyId" = c.id
JOIN engineers e ON e."userId" = u.id
CROSS JOIN roles r
WHERE 
    c."companyType" = 'SES_COMPANY'
    AND r.name = 'engineer'
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur."userId" = u.id AND ur."roleId" = r.id
    );

-- クライアント企業管理者ロールの割り当て
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt", "updatedAt")
SELECT 
    u.id,
    r.id,
    1,
    NOW(),
    NOW()
FROM users u
JOIN companies c ON u."companyId" = c.id
CROSS JOIN roles r
WHERE 
    c."companyType" = 'CLIENT_COMPANY'
    AND r.name = 'client_admin'
    -- 管理者権限を持つべきユーザーの条件
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur."userId" = u.id AND ur."roleId" = r.id
    );

-- クライアント企業一般ユーザーロールの割り当て
INSERT INTO user_roles ("userId", "roleId", "grantedBy", "createdAt", "updatedAt")
SELECT 
    u.id,
    r.id,
    1,
    NOW(),
    NOW()
FROM users u
JOIN companies c ON u."companyId" = c.id
CROSS JOIN roles r
WHERE 
    c."companyType" = 'CLIENT_COMPANY'
    AND r.name = 'client_user'
    -- 一般ユーザーの条件
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur."userId" = u.id
    );

-- 結果の確認
SELECT 
    c.name as company_name,
    c."companyType" as company_type,
    u.email,
    u.name as user_name,
    r.name as role_name,
    ur."createdAt"
FROM user_roles ur
JOIN users u ON ur."userId" = u.id
JOIN roles r ON ur."roleId" = r.id
LEFT JOIN companies c ON u."companyId" = c.id
ORDER BY c.name, r.name, u.email;

-- 正常に完了したらコミット
-- 問題があればROLLBACK
COMMIT;

-- 統計情報
SELECT 
    r.name as role_name,
    COUNT(ur.id) as user_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur."roleId"
GROUP BY r.id, r.name
ORDER BY r.name;
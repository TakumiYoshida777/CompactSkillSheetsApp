-- ============================================
-- 認証用サンプルデータ投入SQL
-- ============================================

-- 既存データのクリーンアップ（必要に応じてコメントアウト）
-- DELETE FROM user_roles WHERE userId IN (2, 3, 4, 5, 6);
-- DELETE FROM users WHERE id IN (2, 3, 4, 5, 6);

-- ============================================
-- 追加のSES企業管理者ユーザー
-- ============================================

-- パスワード: Admin123!
-- bcryptハッシュ値: $2b$10$1feuzxn0p8Iy0oaznlXGBe7hunhEW6wwBNM.hSwrXwON6sys1NLoW
INSERT INTO users (id, "companyId", email, name, "passwordHash", "isActive", "updatedAt")
VALUES (2, 1, 'admin2@test-ses.com', 'SES管理者2', '$2b$10$1feuzxn0p8Iy0oaznlXGBe7hunhEW6wwBNM.hSwrXwON6sys1NLoW', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 管理者権限を付与
INSERT INTO user_roles ("userId", "roleId", "grantedBy")
VALUES (2, 1, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- SES企業営業ユーザー
-- ============================================

-- パスワード: Sales123!
INSERT INTO users (id, "companyId", email, name, "passwordHash", "isActive", "updatedAt")
VALUES (3, 1, 'sales@test-ses.com', '営業担当太郎', '$2b$10$1feuzxn0p8Iy0oaznlXGBe7hunhEW6wwBNM.hSwrXwON6sys1NLoW', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 営業権限を付与
INSERT INTO user_roles ("userId", "roleId", "grantedBy")
VALUES (3, 2, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 別のSES企業とその管理者
-- ============================================

-- パスワード: Admin123!
INSERT INTO users (id, "companyId", email, name, "passwordHash", "isActive", "updatedAt")
VALUES (4, 2, 'admin@digital-innovation.com', 'デジタル管理者', '$2b$10$1feuzxn0p8Iy0oaznlXGBe7hunhEW6wwBNM.hSwrXwON6sys1NLoW', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 管理者権限を付与
INSERT INTO user_roles ("userId", "roleId", "grantedBy")
VALUES (4, 1, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 取引先企業データ
-- ============================================

-- 取引先企業1
INSERT INTO companies (id, name, "companyType", "emailDomain", "address", "phone", "isActive", "updatedAt")
VALUES 
(101, '株式会社クライアントA', 'CLIENT', 'client-a.co.jp', '東京都港区', '03-9999-0001', true, CURRENT_TIMESTAMP),
(102, '株式会社クライアントB', 'CLIENT', 'client-b.co.jp', '東京都千代田区', '03-9999-0002', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 取引先企業ユーザー
-- ============================================

-- 取引先企業A管理者
-- パスワード: Client123!
INSERT INTO users (id, "companyId", email, name, "passwordHash", "isActive", "updatedAt")
VALUES (5, 101, 'admin@client-a.co.jp', 'クライアントA管理者', '$2b$10$1feuzxn0p8Iy0oaznlXGBe7hunhEW6wwBNM.hSwrXwON6sys1NLoW', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 取引先管理者権限を付与
INSERT INTO user_roles ("userId", "roleId", "grantedBy")
VALUES (5, 4, 1)
ON CONFLICT DO NOTHING;

-- 取引先企業B一般ユーザー
-- パスワード: User123!
INSERT INTO users (id, "companyId", email, name, "passwordHash", "isActive", "updatedAt")
VALUES (6, 102, 'user@client-b.co.jp', 'クライアントBユーザー', '$2b$10$1feuzxn0p8Iy0oaznlXGBe7hunhEW6wwBNM.hSwrXwON6sys1NLoW', true, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 取引先ユーザー権限を付与
INSERT INTO user_roles ("userId", "roleId", "grantedBy")
VALUES (6, 5, 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- シーケンスの更新
-- ============================================

-- usersテーブルのシーケンスを更新
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- companiesテーブルのシーケンスを更新
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

-- user_rolesテーブルのシーケンスを更新
SELECT setval('user_roles_id_seq', (SELECT MAX(id) FROM user_roles));

-- ============================================
-- 投入確認
-- ============================================

SELECT 
    u.id,
    u.email,
    u.name,
    c.name as company_name,
    c."companyType",
    r."displayName" as role_name
FROM users u
LEFT JOIN companies c ON u."companyId" = c.id
LEFT JOIN user_roles ur ON u.id = ur."userId"
LEFT JOIN roles r ON ur."roleId" = r.id
ORDER BY u.id;
-- 企業データの作成（SES企業） - enum値を大文字に修正
INSERT INTO companies (id, "companyType", name, "emailDomain", address, phone, "websiteUrl", "contactEmail", "maxEngineers", "isActive", "createdAt", "updatedAt")
VALUES 
(1, 'SES', '株式会社テックソリューション', 'techsolution.co.jp', '東京都渋谷区渋谷1-1-1', '03-1234-5678', 'https://techsolution.co.jp', 'contact@techsolution.co.jp', 6000, true, NOW(), NOW()),
(2, 'SES', '株式会社デジタルイノベーション', 'digital-innovation.co.jp', '東京都港区六本木2-2-2', '03-2345-6789', 'https://digital-innovation.co.jp', 'info@digital-innovation.co.jp', 6000, true, NOW(), NOW()),
(3, 'SES', 'SESパートナーズ株式会社', 'ses-partners.co.jp', '東京都新宿区西新宿3-3-3', '03-3456-7890', 'https://ses-partners.co.jp', 'contact@ses-partners.co.jp', 6000, true, NOW(), NOW()),
(4, 'SES', '株式会社クラウドテック', 'cloudtech.co.jp', '東京都千代田区大手町4-4-4', '03-4567-8901', 'https://cloudtech.co.jp', 'info@cloudtech.co.jp', 6000, true, NOW(), NOW()),
(5, 'SES', '株式会社システムプロ', 'systempro.co.jp', '東京都品川区大崎5-5-5', '03-5678-9012', 'https://systempro.co.jp', 'contact@systempro.co.jp', 6000, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- シーケンスのリセット
SELECT setval('companies_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM companies), 0), 5));

-- エンジニアデータの作成 - genderも大文字に修正、currentStatusのenum値も確認
INSERT INTO engineers (id, "companyId", name, "nameKana", email, phone, "birthDate", gender, "nearestStation", "engineerType", "currentStatus", "availableDate", "isPublic", "createdAt", "updatedAt")
VALUES
(1, 1, '田中太郎', 'タナカタロウ', 'tanaka@techsolution.co.jp', '090-1234-5678', '1992-03-15', 'MALE', '渋谷駅', 'EMPLOYEE', 'WAITING', '2024-02-01', true, NOW(), NOW()),
(2, 2, '佐藤花子', 'サトウハナコ', 'sato@digital-innovation.co.jp', '090-2345-6789', '1996-07-22', 'FEMALE', '六本木駅', 'EMPLOYEE', 'WAITING', '2024-02-15', true, NOW(), NOW()),
(3, 1, '鈴木一郎', 'スズキイチロウ', 'suzuki@techsolution.co.jp', '090-3456-7890', '1989-11-08', 'MALE', '新宿駅', 'EMPLOYEE', 'WAITING', '2024-03-01', true, NOW(), NOW()),
(4, 3, '山田次郎', 'ヤマダジロウ', 'yamada@ses-partners.co.jp', '090-4567-8901', '1994-05-20', 'MALE', '西新宿駅', 'EMPLOYEE', 'WAITING_SOON', '2024-04-01', true, NOW(), NOW()),
(5, 2, '伊藤美咲', 'イトウミサキ', 'ito@digital-innovation.co.jp', '090-5678-9012', '1998-01-30', 'FEMALE', '恵比寿駅', 'EMPLOYEE', 'WAITING', '2024-01-20', true, NOW(), NOW()),
(6, 4, '高橋健一', 'タカハシケンイチ', 'takahashi@cloudtech.co.jp', '090-6789-0123', '1991-09-12', 'MALE', '大手町駅', 'EMPLOYEE', 'WAITING', '2024-02-01', true, NOW(), NOW()),
(7, 3, '小林明美', 'コバヤシアケミ', 'kobayashi@ses-partners.co.jp', '090-7890-1234', '1995-06-18', 'FEMALE', '新宿三丁目駅', 'EMPLOYEE', 'WAITING', '2024-02-10', true, NOW(), NOW()),
(8, 5, '渡辺大輔', 'ワタナベダイスケ', 'watanabe@systempro.co.jp', '090-8901-2345', '1990-12-25', 'MALE', '大崎駅', 'EMPLOYEE', 'WAITING', '2024-02-20', true, NOW(), NOW()),
(9, 1, '中村優子', 'ナカムラユウコ', 'nakamura@techsolution.co.jp', '090-9012-3456', '1993-04-10', 'FEMALE', '表参道駅', 'EMPLOYEE', 'WAITING', '2024-01-25', true, NOW(), NOW()),
(10, 4, '加藤剛', 'カトウツヨシ', 'kato@cloudtech.co.jp', '090-0123-4567', '1988-08-05', 'MALE', '東京駅', 'EMPLOYEE', 'WAITING', '2024-02-05', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- シーケンスのリセット
SELECT setval('engineers_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM engineers), 0), 10));

-- スキルシートデータの作成
INSERT INTO skill_sheets (id, "engineerId", summary, "totalExperienceYears", "isCompleted", "createdAt", "updatedAt")
VALUES
(1, 1, 'Webアプリケーション開発を中心に8年の経験。フロントエンドからバックエンドまで幅広く対応可能。', 8, true, NOW(), NOW()),
(2, 2, 'Pythonを用いたバックエンド開発とAWS環境での構築経験が豊富。', 5, true, NOW(), NOW()),
(3, 3, 'エンタープライズシステムの開発経験10年。大規模プロジェクトのPL経験あり。', 10, true, NOW(), NOW()),
(4, 4, '.NET環境での業務システム開発が専門。Azure環境での構築経験も豊富。', 7, true, NOW(), NOW()),
(5, 5, 'モダンなフロントエンド開発が得意。Vue.jsを用いたSPA開発経験多数。', 4, true, NOW(), NOW()),
(6, 6, 'Go言語を用いたマイクロサービス開発とKubernetes環境での運用経験。', 9, true, NOW(), NOW()),
(7, 7, 'モバイルアプリ開発のスペシャリスト。iOS/Android両対応可能。', 6, true, NOW(), NOW()),
(8, 8, 'LAMP環境での開発経験8年。Laravelを用いた開発が得意。', 8, true, NOW(), NOW()),
(9, 9, 'Angularを用いたエンタープライズ向けフロントエンド開発の経験豊富。', 7, true, NOW(), NOW()),
(10, 10, 'Ruby on Railsを用いたWebサービス開発とプロジェクト管理の経験豊富。', 11, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- シーケンスのリセット
SELECT setval('skill_sheets_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM skill_sheets), 0), 10));

-- Node.jsスキルが無かったので追加
INSERT INTO skill_masters (skill_code, skill_name, skill_type, category, display_order)
VALUES ('NODEJS', 'Node.js', 'language', 'Backend', 45)
ON CONFLICT (skill_code) DO NOTHING;

-- Firebaseスキルも追加
INSERT INTO skill_masters (skill_code, skill_name, skill_type, category, display_order)
VALUES ('FIREBASE', 'Firebase', 'cloud', 'Backend', 46)
ON CONFLICT (skill_code) DO NOTHING;

-- エンジニアロール経験データの投入
INSERT INTO engineer_role_experiences (engineer_id, role_master_id, years_of_experience, proficiency_level, is_primary)
SELECT 
    e.id as engineer_id,
    rm.id as role_master_id,
    erc.years as years_of_experience,
    erc.level as proficiency_level,
    erc.is_primary
FROM (VALUES
    -- 田中太郎
    (1, 'PL', 3.0, 'advanced', false),
    (1, 'SE', 5.0, 'expert', true),
    -- 佐藤花子
    (2, 'SE', 3.0, 'advanced', true),
    (2, 'PG', 5.0, 'expert', false),
    -- 鈴木一郎
    (3, 'PM', 3.0, 'advanced', false),
    (3, 'PL', 5.0, 'expert', false),
    (3, 'SE', 10.0, 'expert', true),
    -- 山田次郎
    (4, 'SE', 5.0, 'advanced', true),
    (4, 'PG', 7.0, 'expert', false),
    -- 伊藤美咲
    (5, 'SE', 2.0, 'intermediate', false),
    (5, 'PG', 4.0, 'advanced', true),
    -- 高橋健一
    (6, 'ARCHITECT', 2.0, 'advanced', false),
    (6, 'SE', 7.0, 'expert', true),
    -- 小林明美
    (7, 'SE', 4.0, 'advanced', true),
    (7, 'PG', 6.0, 'expert', false),
    -- 渡辺大輔
    (8, 'PL', 2.0, 'intermediate', false),
    (8, 'SE', 6.0, 'advanced', true),
    (8, 'PG', 8.0, 'expert', false),
    -- 中村優子
    (9, 'SE', 7.0, 'expert', true),
    (9, 'PG', 7.0, 'expert', false),
    -- 加藤剛
    (10, 'PM', 5.0, 'expert', true),
    (10, 'PL', 8.0, 'expert', false),
    (10, 'CONSULTANT', 2.0, 'advanced', false)
) AS erc(engineer_id, role_code, years, level, is_primary)
JOIN engineers e ON e.id = erc.engineer_id
JOIN role_masters rm ON rm.role_code = erc.role_code
WHERE NOT EXISTS (
    SELECT 1 FROM engineer_role_experiences ere
    WHERE ere.engineer_id = e.id 
    AND ere.role_master_id = rm.id
);

-- エンジニア業務経験データの投入
INSERT INTO engineer_work_experiences (engineer_id, work_task_master_id, proficiency_level, years_of_experience, project_count)
SELECT 
    e.id as engineer_id,
    wtm.id as work_task_master_id,
    ewc.level as proficiency_level,
    ewc.years as years_of_experience,
    ewc.projects as project_count
FROM (VALUES
    -- 田中太郎
    (1, 'REQUIREMENT_DEFINITION', 'advanced', 3.0, 5),
    (1, 'BASIC_DESIGN', 'expert', 4.0, 8),
    (1, 'DETAILED_DESIGN', 'expert', 5.0, 10),
    (1, 'FRONTEND_DEV', 'expert', 6.0, 12),
    (1, 'BACKEND_DEV', 'advanced', 5.0, 10),
    -- 佐藤花子
    (2, 'DETAILED_DESIGN', 'advanced', 3.0, 6),
    (2, 'CODING', 'expert', 5.0, 10),
    (2, 'TEST_DESIGN', 'intermediate', 2.0, 4),
    (2, 'BACKEND_DEV', 'expert', 4.0, 8),
    (2, 'DATABASE_DESIGN', 'advanced', 3.0, 5),
    -- 鈴木一郎
    (3, 'REQUIREMENT_DEFINITION', 'expert', 5.0, 10),
    (3, 'BASIC_DESIGN', 'expert', 6.0, 12),
    (3, 'CLIENT_NEGOTIATION', 'advanced', 4.0, 8),
    (3, 'TEAM_MANAGEMENT', 'advanced', 3.0, 6),
    (3, 'PROJECT_MANAGEMENT', 'advanced', 3.0, 5),
    -- 山田次郎
    (4, 'BASIC_DESIGN', 'advanced', 3.0, 6),
    (4, 'DETAILED_DESIGN', 'advanced', 4.0, 8),
    (4, 'CODING', 'expert', 7.0, 15),
    (4, 'TEST_DESIGN', 'intermediate', 2.0, 4),
    (4, 'BACKEND_DEV', 'expert', 5.0, 10),
    -- 伊藤美咲
    (5, 'DETAILED_DESIGN', 'intermediate', 2.0, 4),
    (5, 'CODING', 'advanced', 4.0, 8),
    (5, 'TEST_EXECUTION', 'intermediate', 2.0, 4),
    (5, 'FRONTEND_DEV', 'advanced', 3.0, 6),
    -- 高橋健一
    (6, 'BASIC_DESIGN', 'expert', 5.0, 10),
    (6, 'DETAILED_DESIGN', 'expert', 6.0, 12),
    (6, 'CODING', 'expert', 7.0, 15),
    (6, 'ARCHITECTURE_DESIGN', 'advanced', 2.0, 4),
    (6, 'MICROSERVICES', 'advanced', 2.0, 3),
    -- 小林明美
    (7, 'DETAILED_DESIGN', 'advanced', 4.0, 8),
    (7, 'CODING', 'expert', 6.0, 12),
    (7, 'TEST_DESIGN', 'intermediate', 2.0, 4),
    (7, 'MOBILE_APP_DEV', 'expert', 5.0, 10),
    -- 渡辺大輔
    (8, 'BASIC_DESIGN', 'advanced', 4.0, 8),
    (8, 'DETAILED_DESIGN', 'expert', 5.0, 10),
    (8, 'CODING', 'expert', 8.0, 16),
    (8, 'TEST_DESIGN', 'advanced', 3.0, 6),
    (8, 'BACKEND_DEV', 'expert', 6.0, 12),
    -- 中村優子
    (9, 'BASIC_DESIGN', 'intermediate', 3.0, 6),
    (9, 'DETAILED_DESIGN', 'advanced', 5.0, 10),
    (9, 'CODING', 'expert', 7.0, 14),
    (9, 'FRONTEND_DEV', 'expert', 6.0, 12),
    -- 加藤剛
    (10, 'REQUIREMENT_DEFINITION', 'expert', 6.0, 12),
    (10, 'BASIC_DESIGN', 'expert', 7.0, 14),
    (10, 'BUDGET_MANAGEMENT', 'advanced', 4.0, 8),
    (10, 'QUALITY_MANAGEMENT', 'advanced', 4.0, 8),
    (10, 'PROJECT_MANAGEMENT', 'expert', 5.0, 10),
    (10, 'TEAM_MANAGEMENT', 'expert', 5.0, 10)
) AS ewc(engineer_id, task_code, level, years, projects)
JOIN engineers e ON e.id = ewc.engineer_id
JOIN work_task_masters wtm ON wtm.task_code = ewc.task_code
WHERE NOT EXISTS (
    SELECT 1 FROM engineer_work_experiences ewe
    WHERE ewe.engineer_id = e.id 
    AND ewe.work_task_master_id = wtm.id
);

-- エンジニアスキルデータの投入
INSERT INTO engineer_skills (engineer_id, skill_master_id, proficiency_level, years_of_experience, is_primary)
SELECT 
    e.id as engineer_id,
    sm.id as skill_master_id,
    esc.level as proficiency_level,
    esc.years as years_of_experience,
    esc.is_primary
FROM (VALUES
    -- 田中太郎
    (1, 'JAVASCRIPT', 'expert', 6.0, true),
    (1, 'TYPESCRIPT', 'advanced', 4.0, true),
    (1, 'REACT', 'expert', 5.0, true),
    (1, 'NODEJS', 'advanced', 4.0, false),
    (1, 'MYSQL', 'intermediate', 3.0, false),
    -- 佐藤花子
    (2, 'PYTHON', 'expert', 5.0, true),
    (2, 'DJANGO', 'advanced', 3.0, true),
    (2, 'POSTGRESQL', 'advanced', 4.0, false),
    (2, 'AWS', 'advanced', 3.0, true),
    (2, 'DOCKER', 'intermediate', 2.0, false),
    -- 鈴木一郎
    (3, 'JAVA', 'expert', 10.0, true),
    (3, 'SPRING', 'expert', 8.0, true),
    (3, 'MYSQL', 'advanced', 7.0, false),
    (3, 'DOCKER', 'intermediate', 3.0, false),
    (3, 'AWS', 'intermediate', 3.0, false),
    -- 山田次郎
    (4, 'CSHARP', 'expert', 7.0, true),
    (4, 'DOTNET', 'expert', 6.0, true),
    (4, 'AZURE', 'advanced', 4.0, true),
    (4, 'SQLSERVER', 'advanced', 5.0, false),
    -- 伊藤美咲
    (5, 'VUE', 'advanced', 3.0, true),
    (5, 'NUXTJS', 'intermediate', 2.0, true),
    (5, 'JAVASCRIPT', 'advanced', 4.0, false),
    (5, 'FIREBASE', 'intermediate', 2.0, false),
    -- 高橋健一
    (6, 'GO', 'expert', 5.0, true),
    (6, 'KUBERNETES', 'advanced', 3.0, true),
    (6, 'DOCKER', 'expert', 4.0, false),
    (6, 'REDIS', 'advanced', 3.0, false),
    (6, 'POSTGRESQL', 'advanced', 4.0, false),
    -- 小林明美
    (7, 'REACT_NATIVE', 'expert', 4.0, true),
    (7, 'FLUTTER', 'advanced', 3.0, true),
    (7, 'SWIFT', 'intermediate', 2.0, false),
    (7, 'KOTLIN', 'intermediate', 2.0, false),
    -- 渡辺大輔
    (8, 'PHP', 'expert', 8.0, true),
    (8, 'LARAVEL', 'expert', 5.0, true),
    (8, 'VUE', 'advanced', 3.0, false),
    (8, 'MYSQL', 'advanced', 6.0, false),
    -- 中村優子
    (9, 'ANGULAR', 'expert', 5.0, true),
    (9, 'TYPESCRIPT', 'expert', 5.0, true),
    (9, 'NESTJS', 'advanced', 3.0, false),
    (9, 'MONGODB', 'intermediate', 2.0, false),
    -- 加藤剛
    (10, 'RUBY', 'expert', 8.0, true),
    (10, 'RAILS', 'expert', 8.0, true),
    (10, 'POSTGRESQL', 'advanced', 6.0, false),
    (10, 'REDIS', 'advanced', 4.0, false),
    (10, 'AWS', 'advanced', 5.0, false)
) AS esc(engineer_id, skill_code, level, years, is_primary)
JOIN engineers e ON e.id = esc.engineer_id
JOIN skill_masters sm ON sm.skill_code = esc.skill_code
WHERE NOT EXISTS (
    SELECT 1 FROM engineer_skills es
    WHERE es.engineer_id = e.id 
    AND es.skill_master_id = sm.id
);
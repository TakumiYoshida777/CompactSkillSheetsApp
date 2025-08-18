-- ロールマスタデータの挿入
INSERT INTO role_masters (role_code, role_name, role_name_en, category, display_order) VALUES
('PM', 'プロジェクトマネージャー', 'Project Manager', '管理系', 1),
('PL', 'プロジェクトリーダー', 'Project Leader', '管理系', 2),
('SE', 'システムエンジニア', 'System Engineer', '技術系', 3),
('PG', 'プログラマー', 'Programmer', '技術系', 4),
('ARCHITECT', 'ITアーキテクト', 'IT Architect', '技術系', 5),
('CONSULTANT', 'ITコンサルタント', 'IT Consultant', '管理系', 6),
('TEST_ENGINEER', 'テストエンジニア', 'Test Engineer', '技術系', 7),
('INFRA_ENGINEER', 'インフラエンジニア', 'Infrastructure Engineer', '技術系', 8),
('DB_ENGINEER', 'データベースエンジニア', 'Database Engineer', '技術系', 9),
('SECURITY_ENGINEER', 'セキュリティエンジニア', 'Security Engineer', '技術系', 10),
('DATA_SCIENTIST', 'データサイエンティスト', 'Data Scientist', '技術系', 11),
('AI_ENGINEER', 'AIエンジニア', 'AI Engineer', '技術系', 12),
('SRE', 'サイトリライアビリティエンジニア', 'Site Reliability Engineer', '技術系', 13),
('DEVOPS_ENGINEER', 'DevOpsエンジニア', 'DevOps Engineer', '技術系', 14);

-- 業務タスクマスタデータの挿入
-- 要件・設計系
INSERT INTO work_task_masters (task_code, task_name, task_name_en, category, phase, display_order) VALUES
('REQUIREMENT_DEFINITION', '要件定義', 'Requirement Definition', '要件・設計系', '要件定義', 1),
('BASIC_DESIGN', '基本設計', 'Basic Design', '要件・設計系', '基本設計', 2),
('DETAILED_DESIGN', '詳細設計', 'Detailed Design', '要件・設計系', '詳細設計', 3),
('ARCHITECTURE_DESIGN', 'アーキテクチャ設計', 'Architecture Design', '要件・設計系', '基本設計', 4),
('API_DESIGN', 'API設計', 'API Design', '要件・設計系', '詳細設計', 5),
('UI_UX_DESIGN', 'UI/UX設計', 'UI/UX Design', '要件・設計系', '基本設計', 6),
('DATABASE_DESIGN', 'データベース設計', 'Database Design', '要件・設計系', '基本設計', 7),
('NETWORK_DESIGN', 'ネットワーク設計', 'Network Design', '要件・設計系', '基本設計', 8),
('SECURITY_DESIGN', 'セキュリティ設計', 'Security Design', '要件・設計系', '基本設計', 9);

-- 開発系
INSERT INTO work_task_masters (task_code, task_name, task_name_en, category, phase, display_order) VALUES
('FRONTEND_DEV', 'フロントエンド開発', 'Frontend Development', '開発系', '実装', 10),
('BACKEND_DEV', 'バックエンド開発', 'Backend Development', '開発系', '実装', 11),
('MOBILE_APP_DEV', 'モバイルアプリ開発', 'Mobile App Development', '開発系', '実装', 12),
('CODING', '実装・コーディング', 'Coding', '開発系', '実装', 13),
('AI_ML_DEV', 'AI/機械学習開発', 'AI/ML Development', '開発系', '実装', 14),
('DATA_ANALYSIS', 'データ分析', 'Data Analysis', '開発系', '実装', 15),
('BI_DEV', 'BI開発', 'BI Development', '開発系', '実装', 16),
('RPA_DEV', 'RPA開発', 'RPA Development', '開発系', '実装', 17),
('IOT_DEV', 'IoT開発', 'IoT Development', '開発系', '実装', 18),
('BLOCKCHAIN_DEV', 'ブロックチェーン開発', 'Blockchain Development', '開発系', '実装', 19);

-- テスト系
INSERT INTO work_task_masters (task_code, task_name, task_name_en, category, phase, display_order) VALUES
('TEST_DESIGN', 'テスト設計', 'Test Design', 'テスト系', 'テスト', 20),
('TEST_EXECUTION', 'テスト実施', 'Test Execution', 'テスト系', 'テスト', 21),
('INTEGRATION_TEST', '結合テスト', 'Integration Test', 'テスト系', 'テスト', 22),
('SYSTEM_TEST', '総合テスト', 'System Test', 'テスト系', 'テスト', 23),
('ACCEPTANCE_TEST', '受入テスト', 'Acceptance Test', 'テスト系', 'テスト', 24),
('PERFORMANCE_TEST', '性能テスト', 'Performance Test', 'テスト系', 'テスト', 25),
('SECURITY_TEST', 'セキュリティテスト', 'Security Test', 'テスト系', 'テスト', 26),
('AUTOMATION_TEST', '自動テスト作成', 'Test Automation', 'テスト系', 'テスト', 27);

-- インフラ・運用系
INSERT INTO work_task_masters (task_code, task_name, task_name_en, category, phase, display_order) VALUES
('INFRA_BUILD', 'インフラ構築', 'Infrastructure Build', 'インフラ・運用系', '構築', 28),
('CLOUD_BUILD', 'クラウド構築', 'Cloud Build', 'インフラ・運用系', '構築', 29),
('DATABASE_BUILD', 'データベース構築', 'Database Build', 'インフラ・運用系', '構築', 30),
('NETWORK_BUILD', 'ネットワーク構築', 'Network Build', 'インフラ・運用系', '構築', 31),
('DEVOPS', 'DevOps', 'DevOps', 'インフラ・運用系', '運用', 32),
('CI_CD_BUILD', 'CI/CD構築', 'CI/CD Build', 'インフラ・運用系', '構築', 33),
('CONTAINERIZATION', 'コンテナ化', 'Containerization', 'インフラ・運用系', '構築', 34),
('MICROSERVICES', 'マイクロサービス設計', 'Microservices Design', 'インフラ・運用系', '設計', 35),
('OPERATION_MAINTENANCE', '運用保守', 'Operation & Maintenance', 'インフラ・運用系', '運用', 36),
('INCIDENT_RESPONSE', '障害対応', 'Incident Response', 'インフラ・運用系', '運用', 37),
('PERFORMANCE_TUNING', '性能チューニング', 'Performance Tuning', 'インフラ・運用系', '運用', 38),
('SECURITY_AUDIT', 'セキュリティ監査', 'Security Audit', 'インフラ・運用系', '運用', 39);

-- 管理系
INSERT INTO work_task_masters (task_code, task_name, task_name_en, category, phase, display_order) VALUES
('PROJECT_MANAGEMENT', 'プロジェクト管理', 'Project Management', '管理系', '管理', 40),
('TEAM_MANAGEMENT', 'チームマネジメント', 'Team Management', '管理系', '管理', 41),
('CLIENT_NEGOTIATION', '顧客折衝', 'Client Negotiation', '管理系', '管理', 42),
('BUDGET_MANAGEMENT', '予算管理', 'Budget Management', '管理系', '管理', 43),
('QUALITY_MANAGEMENT', '品質管理', 'Quality Management', '管理系', '管理', 44),
('RISK_MANAGEMENT', 'リスク管理', 'Risk Management', '管理系', '管理', 45),
('SCHEDULE_MANAGEMENT', 'スケジュール管理', 'Schedule Management', '管理系', '管理', 46),
('RESOURCE_MANAGEMENT', '要員管理', 'Resource Management', '管理系', '管理', 47),
('VENDOR_MANAGEMENT', 'ベンダー管理', 'Vendor Management', '管理系', '管理', 48);

-- その他
INSERT INTO work_task_masters (task_code, task_name, task_name_en, category, phase, display_order) VALUES
('DOCUMENTATION', 'ドキュメント作成', 'Documentation', 'その他', '全般', 49),
('TRAINING', '教育・研修', 'Training', 'その他', '全般', 50),
('TECH_RESEARCH', '技術調査', 'Technical Research', 'その他', '全般', 51),
('TECH_SELECTION', '技術選定', 'Technology Selection', 'その他', '全般', 52);

-- スキルマスタデータの挿入（主要なもののみ）
-- プログラミング言語
INSERT INTO skill_masters (skill_code, skill_name, skill_type, category, display_order) VALUES
('JAVASCRIPT', 'JavaScript', 'language', 'Frontend', 1),
('TYPESCRIPT', 'TypeScript', 'language', 'Frontend', 2),
('PYTHON', 'Python', 'language', 'Backend', 3),
('JAVA', 'Java', 'language', 'Backend', 4),
('CSHARP', 'C#', 'language', 'Backend', 5),
('GO', 'Go', 'language', 'Backend', 6),
('RUBY', 'Ruby', 'language', 'Backend', 7),
('PHP', 'PHP', 'language', 'Backend', 8),
('SWIFT', 'Swift', 'language', 'Mobile', 9),
('KOTLIN', 'Kotlin', 'language', 'Mobile', 10);

-- フレームワーク
INSERT INTO skill_masters (skill_code, skill_name, skill_type, category, display_order) VALUES
('REACT', 'React', 'framework', 'Frontend', 11),
('ANGULAR', 'Angular', 'framework', 'Frontend', 12),
('VUE', 'Vue.js', 'framework', 'Frontend', 13),
('NEXTJS', 'Next.js', 'framework', 'Frontend', 14),
('NUXTJS', 'Nuxt.js', 'framework', 'Frontend', 15),
('DJANGO', 'Django', 'framework', 'Backend', 16),
('FLASK', 'Flask', 'framework', 'Backend', 17),
('SPRING', 'Spring Boot', 'framework', 'Backend', 18),
('DOTNET', '.NET Core', 'framework', 'Backend', 19),
('RAILS', 'Ruby on Rails', 'framework', 'Backend', 20),
('LARAVEL', 'Laravel', 'framework', 'Backend', 21),
('EXPRESS', 'Express.js', 'framework', 'Backend', 22),
('NESTJS', 'NestJS', 'framework', 'Backend', 23),
('FASTAPI', 'FastAPI', 'framework', 'Backend', 24),
('FLUTTER', 'Flutter', 'framework', 'Mobile', 25),
('REACT_NATIVE', 'React Native', 'framework', 'Mobile', 26);

-- データベース
INSERT INTO skill_masters (skill_code, skill_name, skill_type, category, display_order) VALUES
('MYSQL', 'MySQL', 'database', 'RDBMS', 27),
('POSTGRESQL', 'PostgreSQL', 'database', 'RDBMS', 28),
('ORACLE', 'Oracle', 'database', 'RDBMS', 29),
('SQLSERVER', 'SQL Server', 'database', 'RDBMS', 30),
('MONGODB', 'MongoDB', 'database', 'NoSQL', 31),
('REDIS', 'Redis', 'database', 'NoSQL', 32),
('ELASTICSEARCH', 'Elasticsearch', 'database', 'NoSQL', 33),
('DYNAMODB', 'DynamoDB', 'database', 'NoSQL', 34);

-- クラウドサービス
INSERT INTO skill_masters (skill_code, skill_name, skill_type, category, display_order) VALUES
('AWS', 'AWS', 'cloud', 'Cloud Platform', 35),
('AZURE', 'Azure', 'cloud', 'Cloud Platform', 36),
('GCP', 'Google Cloud Platform', 'cloud', 'Cloud Platform', 37),
('DOCKER', 'Docker', 'tool', 'Container', 38),
('KUBERNETES', 'Kubernetes', 'tool', 'Container', 39),
('TERRAFORM', 'Terraform', 'tool', 'IaC', 40),
('ANSIBLE', 'Ansible', 'tool', 'IaC', 41),
('JENKINS', 'Jenkins', 'tool', 'CI/CD', 42),
('GITHUB_ACTIONS', 'GitHub Actions', 'tool', 'CI/CD', 43),
('GITLAB_CI', 'GitLab CI', 'tool', 'CI/CD', 44);
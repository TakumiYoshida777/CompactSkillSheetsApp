-- Dev2環境用エンジニアサンプルデータ投入スクリプト
-- 実行方法: docker exec skillsheet-postgres-dev2 psql -U skillsheet -d skillsheet_dev2 -f /scripts/seed-dev2-engineers.sql

-- 既存の企業IDを取得（必要に応じて）
DO $$
DECLARE
    v_company_id BIGINT;
BEGIN
    -- 既存の企業を取得
    SELECT id INTO v_company_id FROM companies LIMIT 1;
    
    -- エンジニアデータの投入
    INSERT INTO engineers (
        "companyId",
        name,
        "nameKana",
        email,
        phone,
        "birthDate",
        gender,
        "nearestStation",
        "githubUrl",
        "engineerType",
        "currentStatus",
        "availableDate",
        "isPublic",
        "createdAt",
        "updatedAt"
    ) VALUES
    -- エンジニア1: 山田太郎（フルスタックエンジニア）
    (
        v_company_id,
        '山田 太郎',
        'ヤマダ タロウ',
        'yamada.taro@example.com',
        '090-1111-1111',
        '1988-05-15',
        'MALE',
        '新宿駅',
        'https://github.com/yamada-taro',
        'EMPLOYEE',
        'WAITING',
        '2025-09-01',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア2: 鈴木花子（フロントエンドエンジニア）
    (
        v_company_id,
        '鈴木 花子',
        'スズキ ハナコ',
        'suzuki.hanako@example.com',
        '090-2222-2222',
        '1992-08-20',
        'FEMALE',
        '渋谷駅',
        'https://github.com/suzuki-hanako',
        'EMPLOYEE',
        'WORKING',
        '2025-10-01',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア3: 佐藤次郎（バックエンドエンジニア）
    (
        v_company_id,
        '佐藤 次郎',
        'サトウ ジロウ',
        'sato.jiro@example.com',
        '090-3333-3333',
        '1990-03-10',
        'MALE',
        '品川駅',
        'https://github.com/sato-jiro',
        'EMPLOYEE',
        'WAITING',
        '2025-08-15',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア4: 田中美咲（インフラエンジニア）
    (
        v_company_id,
        '田中 美咲',
        'タナカ ミサキ',
        'tanaka.misaki@example.com',
        '090-4444-4444',
        '1995-11-25',
        'FEMALE',
        '東京駅',
        'https://github.com/tanaka-misaki',
        'EMPLOYEE',
        'WAITING',
        '2025-08-01',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア5: 高橋健一（PM/アーキテクト）
    (
        v_company_id,
        '高橋 健一',
        'タカハシ ケンイチ',
        'takahashi.kenichi@example.com',
        '090-5555-5555',
        '1985-07-05',
        'MALE',
        '池袋駅',
        NULL,
        'EMPLOYEE',
        'WORKING',
        '2025-12-01',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア6: 伊藤さくら（データサイエンティスト）
    (
        v_company_id,
        '伊藤 さくら',
        'イトウ サクラ',
        'ito.sakura@example.com',
        '090-6666-6666',
        '1993-04-15',
        'FEMALE',
        '六本木駅',
        'https://github.com/ito-sakura',
        'EMPLOYEE',
        'WAITING',
        '2025-09-15',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア7: 渡辺大輔（モバイルエンジニア）
    (
        v_company_id,
        '渡辺 大輔',
        'ワタナベ ダイスケ',
        'watanabe.daisuke@example.com',
        '090-7777-7777',
        '1991-12-20',
        'MALE',
        '恵比寿駅',
        'https://github.com/watanabe-daisuke',
        'FREELANCE',
        'WAITING',
        '2025-08-20',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア8: 小林真由美（QAエンジニア）
    (
        v_company_id,
        '小林 真由美',
        'コバヤシ マユミ',
        'kobayashi.mayumi@example.com',
        '090-8888-8888',
        '1994-09-30',
        'FEMALE',
        '秋葉原駅',
        NULL,
        'EMPLOYEE',
        'WAITING_SOON',
        '2025-10-15',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア9: 加藤隆（セキュリティエンジニア）
    (
        v_company_id,
        '加藤 隆',
        'カトウ タカシ',
        'kato.takashi@example.com',
        '090-9999-9999',
        'MALE',
        '新橋駅',
        'https://github.com/kato-takashi',
        'EMPLOYEE',
        'WAITING',
        '2025-08-10',
        true,
        NOW(),
        NOW()
    ),
    -- エンジニア10: 吉田愛（UI/UXデザイナー）
    (
        v_company_id,
        '吉田 愛',
        'ヨシダ アイ',
        'yoshida.ai@example.com',
        '090-0000-0000',
        '1996-06-18',
        'FEMALE',
        '表参道駅',
        'https://github.com/yoshida-ai',
        'EMPLOYEE',
        'WAITING',
        '2025-08-25',
        true,
        NOW(),
        NOW()
    );

    -- スキルシートの作成
    INSERT INTO skill_sheets (
        "engineerId",
        summary,
        "totalExperienceYears",
        "programmingLanguages",
        frameworks,
        databases,
        "cloudServices",
        tools,
        certifications,
        "possibleRoles",
        "possiblePhases",
        "educationBackground",
        "careerSummary",
        "specialSkills",
        "isCompleted",
        "createdAt",
        "updatedAt"
    )
    SELECT 
        e.id,
        CASE 
            WHEN e.name = '山田 太郎' THEN '10年以上のフルスタック開発経験。大規模Webアプリケーションの設計・開発・運用まで幅広く対応可能。'
            WHEN e.name = '鈴木 花子' THEN 'React/Vue.jsを用いたモダンなフロントエンド開発が得意。UI/UXにも精通。'
            WHEN e.name = '佐藤 次郎' THEN 'Java/Springを中心としたバックエンド開発のスペシャリスト。マイクロサービス設計も可能。'
            WHEN e.name = '田中 美咲' THEN 'AWS/GCPを活用したクラウドインフラ構築・運用の豊富な経験。DevOps推進も得意。'
            WHEN e.name = '高橋 健一' THEN '15年以上のPM経験。100人規模のプロジェクトマネジメント実績あり。'
            WHEN e.name = '伊藤 さくら' THEN 'Python/機械学習を用いたデータ分析・AI開発が専門。'
            WHEN e.name = '渡辺 大輔' THEN 'iOS/Android両方のネイティブアプリ開発が可能。Flutter経験もあり。'
            WHEN e.name = '小林 真由美' THEN '自動テスト設計・実装の専門家。CI/CD環境構築も対応可能。'
            WHEN e.name = '加藤 隆' THEN 'セキュリティ診断・脆弱性対策の豊富な経験。CISSP保有。'
            ELSE 'デザインシステム構築、プロトタイピング、ユーザビリティテストの経験豊富。'
        END,
        CASE 
            WHEN e.name = '山田 太郎' THEN 12
            WHEN e.name = '鈴木 花子' THEN 8
            WHEN e.name = '佐藤 次郎' THEN 10
            WHEN e.name = '田中 美咲' THEN 7
            WHEN e.name = '高橋 健一' THEN 15
            WHEN e.name = '伊藤 さくら' THEN 6
            WHEN e.name = '渡辺 大輔' THEN 9
            WHEN e.name = '小林 真由美' THEN 5
            WHEN e.name = '加藤 隆' THEN 11
            ELSE 4
        END,
        CASE 
            WHEN e.name = '山田 太郎' THEN '["JavaScript", "TypeScript", "Python", "Java", "Go"]'::jsonb
            WHEN e.name = '鈴木 花子' THEN '["JavaScript", "TypeScript", "HTML", "CSS", "SCSS"]'::jsonb
            WHEN e.name = '佐藤 次郎' THEN '["Java", "Kotlin", "Python", "Go", "SQL"]'::jsonb
            WHEN e.name = '田中 美咲' THEN '["Python", "Bash", "Terraform", "YAML", "SQL"]'::jsonb
            WHEN e.name = '高橋 健一' THEN '["Java", "Python", "JavaScript", "SQL", "VBA"]'::jsonb
            WHEN e.name = '伊藤 さくら' THEN '["Python", "R", "SQL", "Julia", "MATLAB"]'::jsonb
            WHEN e.name = '渡辺 大輔' THEN '["Swift", "Kotlin", "Dart", "JavaScript", "TypeScript"]'::jsonb
            WHEN e.name = '小林 真由美' THEN '["Python", "JavaScript", "Ruby", "Shell", "SQL"]'::jsonb
            WHEN e.name = '加藤 隆' THEN '["Python", "C", "C++", "Go", "Rust"]'::jsonb
            ELSE '["JavaScript", "TypeScript", "HTML", "CSS", "Figma"]'::jsonb
        END,
        CASE 
            WHEN e.name = '山田 太郎' THEN '["React", "Next.js", "Node.js", "Express", "Django"]'::jsonb
            WHEN e.name = '鈴木 花子' THEN '["React", "Vue.js", "Next.js", "Nuxt.js", "Redux"]'::jsonb
            WHEN e.name = '佐藤 次郎' THEN '["Spring Boot", "Spring Cloud", "Django", "FastAPI", "Express"]'::jsonb
            WHEN e.name = '田中 美咲' THEN '["Kubernetes", "Docker", "Ansible", "Jenkins", "GitLab CI"]'::jsonb
            WHEN e.name = '高橋 健一' THEN '["Spring", "Django", "React", "Angular", "Vue.js"]'::jsonb
            WHEN e.name = '伊藤 さくら' THEN '["TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy"]'::jsonb
            WHEN e.name = '渡辺 大輔' THEN '["SwiftUI", "UIKit", "Jetpack Compose", "Flutter", "React Native"]'::jsonb
            WHEN e.name = '小林 真由美' THEN '["Selenium", "Cypress", "Jest", "Pytest", "JUnit"]'::jsonb
            WHEN e.name = '加藤 隆' THEN '["OWASP", "Metasploit", "Burp Suite", "Nessus", "Wireshark"]'::jsonb
            ELSE '["React", "Vue.js", "Tailwind CSS", "Material-UI", "Ant Design"]'::jsonb
        END,
        CASE 
            WHEN e.name = '山田 太郎' THEN '["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch"]'::jsonb
            WHEN e.name = '鈴木 花子' THEN '["PostgreSQL", "MySQL", "MongoDB", "Firebase"]'::jsonb
            WHEN e.name = '佐藤 次郎' THEN '["PostgreSQL", "MySQL", "Oracle", "MongoDB", "Redis"]'::jsonb
            WHEN e.name = '田中 美咲' THEN '["PostgreSQL", "MySQL", "DynamoDB", "Redis", "Elasticsearch"]'::jsonb
            WHEN e.name = '高橋 健一' THEN '["Oracle", "PostgreSQL", "MySQL", "SQL Server", "MongoDB"]'::jsonb
            WHEN e.name = '伊藤 さくら' THEN '["PostgreSQL", "BigQuery", "Redshift", "Snowflake", "MongoDB"]'::jsonb
            WHEN e.name = '渡辺 大輔' THEN '["SQLite", "Realm", "Firebase", "PostgreSQL", "MongoDB"]'::jsonb
            WHEN e.name = '小林 真由美' THEN '["PostgreSQL", "MySQL", "SQLite", "MongoDB"]'::jsonb
            WHEN e.name = '加藤 隆' THEN '["PostgreSQL", "MySQL", "Redis", "Elasticsearch"]'::jsonb
            ELSE '["PostgreSQL", "MySQL", "Firebase", "MongoDB"]'::jsonb
        END,
        CASE 
            WHEN e.name = '田中 美咲' THEN '["AWS", "GCP", "Azure", "Terraform Cloud"]'::jsonb
            WHEN e.name = '伊藤 さくら' THEN '["AWS", "GCP", "Azure ML", "Databricks"]'::jsonb
            ELSE '["AWS", "GCP", "Firebase", "Vercel"]'::jsonb
        END,
        '["Git", "Docker", "VS Code", "IntelliJ IDEA", "Slack", "Jira"]'::jsonb,
        CASE 
            WHEN e.name = '高橋 健一' THEN '["PMP", "情報処理技術者（プロジェクトマネージャ）", "AWS Solutions Architect"]'::jsonb
            WHEN e.name = '加藤 隆' THEN '["CISSP", "情報処理安全確保支援士", "CEH"]'::jsonb
            WHEN e.name = '田中 美咲' THEN '["AWS Solutions Architect", "GCP Professional Cloud Architect"]'::jsonb
            ELSE '["基本情報技術者", "応用情報技術者"]'::jsonb
        END,
        '["要件定義", "基本設計", "詳細設計", "実装", "テスト", "運用保守"]'::jsonb,
        '["要件定義", "基本設計", "詳細設計", "製造", "単体テスト", "結合テスト", "総合テスト", "運用保守"]'::jsonb,
        CASE 
            WHEN e.name = '高橋 健一' THEN '{"university": "東京大学", "department": "工学部", "graduation": "2008年卒"}'::jsonb
            WHEN e.name = '伊藤 さくら' THEN '{"university": "東京工業大学", "department": "情報理工学院", "graduation": "2017年卒"}'::jsonb
            ELSE '{"university": "○○大学", "department": "情報工学部", "graduation": "20XX年卒"}'::jsonb
        END,
        '複数のプロジェクトで技術リードとして活躍。',
        CASE 
            WHEN e.name = '山田 太郎' THEN 'アーキテクチャ設計、パフォーマンスチューニング、技術選定'
            WHEN e.name = '鈴木 花子' THEN 'レスポンシブデザイン、アクセシビリティ、パフォーマンス最適化'
            WHEN e.name = '佐藤 次郎' THEN 'API設計、データベース設計、セキュリティ実装'
            ELSE '技術調査、プロトタイピング、ドキュメント作成'
        END,
        true,
        NOW(),
        NOW()
    FROM engineers e
    WHERE e."companyId" = v_company_id;

    RAISE NOTICE 'エンジニアデータの投入が完了しました。';
    
END $$;
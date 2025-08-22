-- Dev2環境用エンジニアサンプルデータ（シンプル版）

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
    "engineerType",
    "currentStatus",
    "availableDate",
    "isPublic",
    "createdAt",
    "updatedAt"
) VALUES
(1, '山田 太郎', 'ヤマダ タロウ', 'yamada.taro@example.com', '090-1111-1111', '1988-05-15', 'MALE', '新宿駅', 'EMPLOYEE', 'WAITING', '2025-09-01', true, NOW(), NOW()),
(1, '鈴木 花子', 'スズキ ハナコ', 'suzuki.hanako@example.com', '090-2222-2222', '1992-08-20', 'FEMALE', '渋谷駅', 'EMPLOYEE', 'WORKING', '2025-10-01', true, NOW(), NOW()),
(1, '佐藤 次郎', 'サトウ ジロウ', 'sato.jiro@example.com', '090-3333-3333', '1990-03-10', 'MALE', '品川駅', 'EMPLOYEE', 'WAITING', '2025-08-15', true, NOW(), NOW()),
(1, '田中 美咲', 'タナカ ミサキ', 'tanaka.misaki@example.com', '090-4444-4444', '1995-11-25', 'FEMALE', '東京駅', 'EMPLOYEE', 'WAITING', '2025-08-01', true, NOW(), NOW()),
(1, '高橋 健一', 'タカハシ ケンイチ', 'takahashi.kenichi@example.com', '090-5555-5555', '1985-07-05', 'MALE', '池袋駅', 'EMPLOYEE', 'WORKING', '2025-12-01', true, NOW(), NOW()),
(1, '伊藤 さくら', 'イトウ サクラ', 'ito.sakura@example.com', '090-6666-6666', '1993-04-15', 'FEMALE', '六本木駅', 'EMPLOYEE', 'WAITING', '2025-09-15', true, NOW(), NOW()),
(1, '渡辺 大輔', 'ワタナベ ダイスケ', 'watanabe.daisuke@example.com', '090-7777-7777', '1991-12-20', 'MALE', '恵比寿駅', 'FREELANCE', 'WAITING', '2025-08-20', true, NOW(), NOW()),
(1, '小林 真由美', 'コバヤシ マユミ', 'kobayashi.mayumi@example.com', '090-8888-8888', '1994-09-30', 'FEMALE', '秋葉原駅', 'EMPLOYEE', 'WAITING_SOON', '2025-10-15', true, NOW(), NOW()),
(1, '加藤 隆', 'カトウ タカシ', 'kato.takashi@example.com', '090-9999-9999', '1990-02-28', 'MALE', '新橋駅', 'EMPLOYEE', 'WAITING', '2025-08-10', true, NOW(), NOW()),
(1, '吉田 愛', 'ヨシダ アイ', 'yoshida.ai@example.com', '090-0000-0000', '1996-06-18', 'FEMALE', '表参道駅', 'EMPLOYEE', 'WAITING', '2025-08-25', true, NOW(), NOW());

-- スキルシートの作成
INSERT INTO skill_sheets (
    "engineerId",
    summary,
    "totalExperienceYears",
    "programmingLanguages",
    frameworks,
    databases,
    "isCompleted",
    "createdAt",
    "updatedAt"
)
SELECT 
    e.id,
    CASE e.name
        WHEN '山田 太郎' THEN '10年以上のフルスタック開発経験。大規模Webアプリケーションの設計・開発・運用まで幅広く対応可能。'
        WHEN '鈴木 花子' THEN 'React/Vue.jsを用いたモダンなフロントエンド開発が得意。UI/UXにも精通。'
        WHEN '佐藤 次郎' THEN 'Java/Springを中心としたバックエンド開発のスペシャリスト。マイクロサービス設計も可能。'
        WHEN '田中 美咲' THEN 'AWS/GCPを活用したクラウドインフラ構築・運用の豊富な経験。DevOps推進も得意。'
        WHEN '高橋 健一' THEN '15年以上のPM経験。100人規模のプロジェクトマネジメント実績あり。'
        WHEN '伊藤 さくら' THEN 'Python/機械学習を用いたデータ分析・AI開発が専門。'
        WHEN '渡辺 大輔' THEN 'iOS/Android両方のネイティブアプリ開発が可能。Flutter経験もあり。'
        WHEN '小林 真由美' THEN '自動テスト設計・実装の専門家。CI/CD環境構築も対応可能。'
        WHEN '加藤 隆' THEN 'セキュリティ診断・脆弱性対策の豊富な経験。CISSP保有。'
        ELSE 'デザインシステム構築、プロトタイピング、ユーザビリティテストの経験豊富。'
    END,
    CASE e.name
        WHEN '山田 太郎' THEN 12
        WHEN '鈴木 花子' THEN 8
        WHEN '佐藤 次郎' THEN 10
        WHEN '田中 美咲' THEN 7
        WHEN '高橋 健一' THEN 15
        WHEN '伊藤 さくら' THEN 6
        WHEN '渡辺 大輔' THEN 9
        WHEN '小林 真由美' THEN 5
        WHEN '加藤 隆' THEN 11
        ELSE 4
    END,
    '["JavaScript", "TypeScript", "Python", "Java"]'::jsonb,
    '["React", "Vue.js", "Node.js", "Express", "Spring Boot"]'::jsonb,
    '["PostgreSQL", "MySQL", "MongoDB", "Redis"]'::jsonb,
    true,
    NOW(),
    NOW()
FROM engineers e
WHERE e."companyId" = 1;
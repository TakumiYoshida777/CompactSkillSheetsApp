-- SES企業管理機能用サンプルデータ
-- 実行前に既存のデータをクリアすることを推奨

-- プロジェクトサンプルデータ
INSERT INTO projects (name, client_company, start_date, end_date, planned_end_date, project_scale, industry, business_type, development_methodology, team_size, description)
VALUES 
  ('ECサイトリニューアル', '株式会社ABC商事', '2024-01-01', NULL, '2024-12-31', 'LARGE', '小売業', 'BtoC', 'アジャイル', 8, 'ECサイトのフルリニューアルプロジェクト。React/Node.jsを使用したモダンな構成への移行。'),
  ('在庫管理システム開発', '株式会社XYZ物流', '2024-03-01', NULL, '2024-09-30', 'MEDIUM', '物流', 'BtoB', 'ウォーターフォール', 5, '物流倉庫の在庫管理システムの新規開発。'),
  ('社内ポータルサイト構築', '株式会社DEF製造', '2024-02-15', '2024-06-30', NULL, 'SMALL', '製造業', '社内システム', 'アジャイル', 3, '社内情報共有のためのポータルサイト構築。'),
  ('AI需要予測システム', '株式会社GHIリテール', '2024-04-01', NULL, '2025-03-31', 'LARGE', '小売業', 'BtoB', 'アジャイル', 10, 'AIを活用した需要予測システムの開発。'),
  ('モバイルアプリ開発', '株式会社JKLサービス', '2024-05-01', NULL, '2024-10-31', 'MEDIUM', 'サービス業', 'BtoC', 'アジャイル', 6, 'iOS/Android向けネイティブアプリの開発。');

-- エンジニアとプロジェクトの関連付け（engineer_projects）
-- 注: engineer_idは実際のエンジニアIDに合わせて調整する必要があります
INSERT INTO engineer_projects (engineer_id, project_id, role, responsibilities, start_date, end_date, is_current, achievements)
SELECT 
  e.id,
  p.id,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY e.id) = 1 THEN 'プロジェクトリーダー'
    WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY e.id) = 2 THEN 'サブリーダー'
    ELSE 'メンバー'
  END as role,
  '設計・開発・テスト' as responsibilities,
  p.start_date,
  p.end_date,
  CASE WHEN p.end_date IS NULL THEN true ELSE false END as is_current,
  NULL as achievements
FROM 
  engineers e
  CROSS JOIN projects p
WHERE 
  e.company_id = 1  -- 対象企業ID
  AND e.id IN (SELECT id FROM engineers WHERE company_id = 1 LIMIT 3)  -- 最初の3人のエンジニア
  AND p.id IN (SELECT id FROM projects ORDER BY id LIMIT 5)  -- 最初の5プロジェクト
LIMIT 10;

-- ビジネスパートナー（取引先企業）のサンプルデータ
INSERT INTO companies (company_type, name, email_domain, address, phone, website_url, contact_email, is_active)
VALUES 
  ('CLIENT', '株式会社テックパートナー', 'techpartner.co.jp', '東京都港区六本木1-1-1', '03-1234-5678', 'https://techpartner.co.jp', 'contact@techpartner.co.jp', true),
  ('CLIENT', '株式会社イノベーション', 'innovation.jp', '東京都渋谷区渋谷2-2-2', '03-2345-6789', 'https://innovation.jp', 'info@innovation.jp', true),
  ('CLIENT', '株式会社デジタルソリューション', 'digital-sol.com', '東京都新宿区西新宿3-3-3', '03-3456-7890', 'https://digital-sol.com', 'sales@digital-sol.com', true)
ON CONFLICT DO NOTHING;

-- ビジネスパートナー関係の作成
INSERT INTO business_partners (ses_company_id, client_company_id, access_url, url_token, is_active, created_by)
SELECT 
  1 as ses_company_id,  -- SES企業ID
  c.id as client_company_id,
  CONCAT('https://client.skillsheet.com/access/', LOWER(REPLACE(c.name, '株式会社', '')), '-', EXTRACT(EPOCH FROM NOW())::INTEGER) as access_url,
  CONCAT(LOWER(REPLACE(c.name, '株式会社', '')), '-', EXTRACT(EPOCH FROM NOW())::INTEGER, '-', MD5(RANDOM()::TEXT)) as url_token,
  true as is_active,
  1 as created_by  -- 作成者ユーザーID
FROM companies c
WHERE c.company_type = 'CLIENT'
  AND c.name IN ('株式会社テックパートナー', '株式会社イノベーション', '株式会社デジタルソリューション')
ON CONFLICT DO NOTHING;

-- 取引先ユーザーのサンプルデータ
INSERT INTO client_users (business_partner_id, email, password_hash, name, phone, department, position, is_active)
SELECT 
  bp.id,
  CONCAT('user', ROW_NUMBER() OVER (PARTITION BY bp.id ORDER BY bp.id), '@', c.email_domain) as email,
  '$2b$10$YourHashedPasswordHere' as password_hash,  -- 実際にはbcryptでハッシュ化したパスワード
  CONCAT('取引先ユーザー', ROW_NUMBER() OVER (PARTITION BY bp.id ORDER BY bp.id)) as name,
  '090-1234-5678' as phone,
  '営業部' as department,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY bp.id ORDER BY bp.id) = 1 THEN '部長'
    ELSE 'マネージャー'
  END as position,
  true as is_active
FROM business_partners bp
JOIN companies c ON bp.client_company_id = c.id
WHERE bp.ses_company_id = 1
LIMIT 6;  -- 各取引先に2名ずつ

-- アクセス権限の設定（取引先が閲覧できるエンジニア）
INSERT INTO client_access_permissions (business_partner_id, engineer_id, permission_type, is_active, created_by)
SELECT 
  bp.id as business_partner_id,
  e.id as engineer_id,
  'VIEW' as permission_type,
  true as is_active,
  1 as created_by
FROM business_partners bp
CROSS JOIN engineers e
WHERE bp.ses_company_id = 1
  AND e.company_id = 1
  AND e.id IN (SELECT id FROM engineers WHERE company_id = 1 AND is_public = true LIMIT 5)
ON CONFLICT DO NOTHING;

-- メールテンプレートのサンプルデータ
INSERT INTO email_templates (company_id, name, category, subject, body, variables, is_active)
VALUES 
  (1, '新規エンジニア紹介', 'APPROACH', '【ご紹介】優秀なエンジニアのご案内', 
   'お世話になっております。\n\n弊社の優秀なエンジニアをご紹介させていただきます。\n\n{{engineer_name}}（{{engineer_skills}}）\n\nぜひご検討ください。', 
   '{"engineer_name": "エンジニア名", "engineer_skills": "スキル概要"}', true),
  (1, '定期アプローチ', 'REGULAR', '【月次ご案内】稼働可能エンジニアリスト', 
   '平素よりお世話になっております。\n\n今月の稼働可能エンジニアをご案内いたします。\n\n{{available_count}}名のエンジニアが稼働可能です。', 
   '{"available_count": "稼働可能人数"}', true),
  (1, 'プロジェクト提案', 'PROPOSAL', '【ご提案】プロジェクト支援のご案内', 
   'お世話になっております。\n\n貴社のプロジェクト{{project_name}}に最適なエンジニアをご提案させていただきます。', 
   '{"project_name": "プロジェクト名"}', true);

-- アプローチ履歴のサンプルデータ
INSERT INTO approaches (from_company_id, to_company_id, approach_type, contact_methods, target_engineers, project_details, message_content, email_template_id, status, sent_by, sent_at)
SELECT 
  1 as from_company_id,
  c.id as to_company_id,
  'COMPANY' as approach_type,
  '{"email": true, "phone": false}' as contact_methods,
  CONCAT('[', STRING_AGG(e.id::TEXT, ','), ']')::JSONB as target_engineers,
  'Webアプリケーション開発プロジェクト' as project_details,
  'エンジニアのご紹介をさせていただきたく、ご連絡いたしました。' as message_content,
  et.id as email_template_id,
  CASE 
    WHEN RANDOM() > 0.7 THEN 'REPLIED'
    WHEN RANDOM() > 0.4 THEN 'OPENED'
    ELSE 'SENT'
  END as status,
  1 as sent_by,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) as sent_at
FROM companies c
CROSS JOIN email_templates et
CROSS JOIN LATERAL (SELECT id FROM engineers WHERE company_id = 1 LIMIT 3) e
WHERE c.company_type = 'CLIENT'
  AND et.company_id = 1
  AND et.category = 'APPROACH'
GROUP BY c.id, et.id
LIMIT 10;

-- メール送信ログのサンプルデータ
INSERT INTO email_logs (company_id, approach_id, recipient_email, subject, body, status, sent_at)
SELECT 
  a.from_company_id as company_id,
  a.id as approach_id,
  c.contact_email as recipient_email,
  et.subject as subject,
  et.body as body,
  CASE 
    WHEN a.status = 'REPLIED' THEN 'DELIVERED'
    WHEN a.status = 'OPENED' THEN 'DELIVERED'
    ELSE 'SENT'
  END as status,
  a.sent_at
FROM approaches a
JOIN companies c ON a.to_company_id = c.id
LEFT JOIN email_templates et ON a.email_template_id = et.id
WHERE a.from_company_id = 1
LIMIT 20;

-- データ投入完了メッセージ
SELECT 'サンプルデータの投入が完了しました' as message;
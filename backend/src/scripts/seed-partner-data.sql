-- 基本テーブルの作成（存在しない場合）
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS engineers (
  id SERIAL PRIMARY KEY,
  company_id INTEGER,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  company_id INTEGER,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- サンプル企業データ
INSERT INTO companies (id, name, email) VALUES 
  (1, 'テスト株式会社', 'test@example.com'),
  (2, 'サンプルシステム株式会社', 'sample@example.com')
ON CONFLICT (id) DO NOTHING;

-- サンプルエンジニアデータ
INSERT INTO engineers (company_id, name, email, status) VALUES 
  (1, '山田太郎', 'yamada@example.com', 'waiting'),
  (1, '佐藤花子', 'sato@example.com', 'waiting'),
  (1, '鈴木一郎', 'suzuki@example.com', 'assigned'),
  (1, '田中美香', 'tanaka@example.com', 'waiting'),
  (1, '高橋健太', 'takahashi@example.com', 'waiting')
ON CONFLICT DO NOTHING;

-- サンプル取引先企業データ
INSERT INTO business_partners (company_id, name, email, phone, address, contract_status, contract_start_date, contract_end_date, max_viewable_engineers, contact_person_name, contact_person_email) VALUES 
  (1, '株式会社ABC商事', 'abc@partner.com', '03-1234-5678', '東京都千代田区1-1-1', 'active', '2024-01-01', '2024-12-31', 50, '営業部長', 'sales@abc.com'),
  (1, '株式会社XYZシステム', 'xyz@partner.com', '03-9876-5432', '東京都港区2-2-2', 'active', '2024-02-01', '2025-01-31', 100, '技術部長', 'tech@xyz.com'),
  (1, '株式会社テックソリューション', 'tech@partner.com', '06-1111-2222', '大阪府大阪市3-3-3', 'active', '2024-03-01', '2024-08-31', 30, '開発部長', 'dev@tech.com'),
  (1, '株式会社イノベーション', 'innovation@partner.com', '045-333-4444', '神奈川県横浜市4-4-4', 'pending', '2024-09-01', '2025-08-31', 75, '企画部長', 'plan@innovation.com'),
  (1, '株式会社グローバルIT', 'global@partner.com', '052-555-6666', '愛知県名古屋市5-5-5', 'inactive', '2023-01-01', '2023-12-31', 25, '総務部長', 'admin@global.com')
ON CONFLICT DO NOTHING;

-- 取引先権限設定
INSERT INTO partner_permissions (partner_id, can_view_engineers, can_send_offers, max_viewable_engineers, visible_engineer_ids, auto_publish_waiting) 
SELECT 
  bp.id,
  true,
  true,
  bp.max_viewable_engineers,
  '[1, 2, 4]'::jsonb,
  false
FROM business_partners bp
WHERE NOT EXISTS (
  SELECT 1 FROM partner_permissions pp WHERE pp.partner_id = bp.id
);

-- サンプルメールテンプレート
INSERT INTO email_templates (company_id, name, category, subject, body, variables, is_active) VALUES 
  (1, '初回アプローチ', 'approach', 'エンジニアのご紹介', 'お世話になっております。\n\n弊社のエンジニア{{engineer_name}}をご紹介させていただきます。\n\nスキル：{{skills}}\n経験年数：{{experience}}年\n\nご検討のほど、よろしくお願いいたします。', '{"engineer_name": "", "skills": "", "experience": ""}'::jsonb, true),
  (1, 'フォローアップ', 'followup', 'ご提案の件について', 'お世話になっております。\n\n先日ご提案させていただいた件について、ご検討状況はいかがでしょうか。\n\n追加のご質問等ございましたら、お気軽にお問い合わせください。', '{}'::jsonb, true),
  (1, '月次報告', 'report', '【月次報告】{{month}}月のご報告', 'お世話になっております。\n\n{{month}}月の稼働状況についてご報告いたします。\n\n{{report_content}}\n\n今後ともよろしくお願いいたします。', '{"month": "", "report_content": ""}'::jsonb, true),
  (1, '契約更新のご案内', 'contract', '契約更新のご案内', 'お世話になっております。\n\n貴社との契約期限が{{end_date}}に迫っておりますので、更新についてご相談させていただきたくご連絡いたしました。\n\nご都合の良い日時をお知らせください。', '{"end_date": ""}'::jsonb, true)
ON CONFLICT DO NOTHING;

-- サンプルアプローチ履歴
INSERT INTO approaches (company_id, target_type, target_id, target_name, engineer_ids, template_id, subject, body, status, sent_at) VALUES 
  (1, 'company', 1, '株式会社ABC商事', '[1, 2]'::jsonb, 1, 'エンジニアのご紹介', '初回アプローチメッセージ', 'sent', NOW() - INTERVAL '7 days'),
  (1, 'company', 2, '株式会社XYZシステム', '[3, 4]'::jsonb, 1, 'エンジニアのご紹介', '初回アプローチメッセージ', 'sent', NOW() - INTERVAL '5 days'),
  (1, 'company', 1, '株式会社ABC商事', '[1]'::jsonb, 2, 'ご提案の件について', 'フォローアップメッセージ', 'sent', NOW() - INTERVAL '3 days'),
  (1, 'company', 3, '株式会社テックソリューション', '[5]'::jsonb, 1, 'エンジニアのご紹介', '初回アプローチメッセージ', 'draft', NULL),
  (1, 'freelance', 1, 'フリーランス田中', '[]'::jsonb, NULL, 'プロジェクトのご相談', 'プロジェクト参画のご相談', 'sent', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- サンプルフリーランスデータ
INSERT INTO freelancers (name, email, phone, skills, hourly_rate, availability) VALUES 
  ('フリーランス田中', 'tanaka.free@example.com', '090-1111-2222', '["Java", "Spring", "AWS"]'::jsonb, 5000, 'available'),
  ('フリーランス佐藤', 'sato.free@example.com', '090-3333-4444', '["Python", "Django", "Docker"]'::jsonb, 6000, 'available'),
  ('フリーランス鈴木', 'suzuki.free@example.com', '090-5555-6666', '["React", "TypeScript", "Node.js"]'::jsonb, 5500, 'busy'),
  ('フリーランス高橋', 'takahashi.free@example.com', '090-7777-8888', '["PHP", "Laravel", "MySQL"]'::jsonb, 4500, 'available'),
  ('フリーランス渡辺', 'watanabe.free@example.com', '090-9999-0000', '["Go", "Kubernetes", "GCP"]'::jsonb, 7000, 'available')
ON CONFLICT DO NOTHING;

-- サンプル定期アプローチ設定
INSERT INTO periodic_approaches (company_id, name, target_companies, engineer_conditions, template_id, schedule, is_active, next_run_at) VALUES 
  (1, '待機エンジニア週次配信', '[1, 2]'::jsonb, '{"status": "waiting"}'::jsonb, 1, '0 9 * * 1', true, NOW() + INTERVAL '7 days'),
  (1, '月次報告配信', '[1, 2, 3]'::jsonb, '{}'::jsonb, 3, '0 10 1 * *', true, NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- アクセスURL生成
INSERT INTO partner_access_urls (partner_id, token, expires_at, max_uses, is_active) VALUES 
  (1, 'abc123token456xyz', NOW() + INTERVAL '30 days', 10, true),
  (2, 'xyz789token012abc', NOW() + INTERVAL '60 days', NULL, true),
  (3, 'tech456token789def', NOW() + INTERVAL '15 days', 5, true)
ON CONFLICT DO NOTHING;

-- 取引先ユーザー
INSERT INTO partner_users (partner_id, name, email, password, role, is_active) VALUES 
  (1, 'ABC管理者', 'admin@abc.com', '$2b$10$YourHashedPasswordHere', 'admin', true),
  (1, 'ABC閲覧者', 'viewer@abc.com', '$2b$10$YourHashedPasswordHere', 'viewer', true),
  (2, 'XYZ管理者', 'admin@xyz.com', '$2b$10$YourHashedPasswordHere', 'admin', true),
  (3, 'Tech編集者', 'editor@tech.com', '$2b$10$YourHashedPasswordHere', 'editor', true)
ON CONFLICT DO NOTHING;

SELECT 'サンプルデータの投入が完了しました' as message;
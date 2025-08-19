-- 取引先企業管理テーブル
CREATE TABLE IF NOT EXISTS business_partners (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  contract_status VARCHAR(50) DEFAULT 'active',
  contract_start_date DATE,
  contract_end_date DATE,
  max_viewable_engineers INTEGER DEFAULT 100,
  contact_person_name VARCHAR(255),
  contact_person_email VARCHAR(255),
  contact_person_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 取引先権限管理テーブル
CREATE TABLE IF NOT EXISTS partner_permissions (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL UNIQUE,
  can_view_engineers BOOLEAN DEFAULT true,
  can_send_offers BOOLEAN DEFAULT true,
  max_viewable_engineers INTEGER DEFAULT 100,
  visible_engineer_ids JSONB DEFAULT '[]',
  ng_engineer_ids JSONB DEFAULT '[]',
  auto_publish_waiting BOOLEAN DEFAULT false,
  custom_permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_partner FOREIGN KEY (partner_id) REFERENCES business_partners(id) ON DELETE CASCADE
);

-- アクセスURL管理テーブル
CREATE TABLE IF NOT EXISTS partner_access_urls (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_partner_url FOREIGN KEY (partner_id) REFERENCES business_partners(id) ON DELETE CASCADE
);

-- 取引先ユーザーテーブル
CREATE TABLE IF NOT EXISTS partner_users (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_partner_user FOREIGN KEY (partner_id) REFERENCES business_partners(id) ON DELETE CASCADE
);

-- アプローチ管理テーブル
CREATE TABLE IF NOT EXISTS approaches (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- 'company' or 'freelance'
  target_id INTEGER,
  target_name VARCHAR(255),
  engineer_ids JSONB DEFAULT '[]',
  template_id INTEGER,
  subject VARCHAR(500),
  body TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  replied_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_company_approach FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- メールテンプレート管理テーブル
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subject VARCHAR(500),
  body TEXT,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_company_template FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- メール送信ログテーブル
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  approach_id INTEGER,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  body TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  error_message TEXT,
  message_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_approach_log FOREIGN KEY (approach_id) REFERENCES approaches(id) ON DELETE SET NULL
);

-- 定期アプローチ設定テーブル
CREATE TABLE IF NOT EXISTS periodic_approaches (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_companies JSONB DEFAULT '[]',
  engineer_conditions JSONB DEFAULT '{}',
  template_id INTEGER,
  schedule VARCHAR(100), -- cron形式
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  last_run_at TIMESTAMP,
  next_run_at TIMESTAMP,
  run_count INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_company_periodic FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_template_periodic FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL
);

-- フリーランステーブル（仮）
CREATE TABLE IF NOT EXISTS freelancers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  skills JSONB DEFAULT '[]',
  hourly_rate INTEGER,
  availability VARCHAR(50),
  portfolio_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 閲覧ログテーブル
CREATE TABLE IF NOT EXISTS view_logs (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER,
  engineer_id INTEGER,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  CONSTRAINT fk_partner_view FOREIGN KEY (partner_id) REFERENCES business_partners(id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX idx_business_partners_company_id ON business_partners(company_id);
CREATE INDEX idx_business_partners_contract_status ON business_partners(contract_status);
CREATE INDEX idx_partner_access_urls_token ON partner_access_urls(token);
CREATE INDEX idx_partner_users_email ON partner_users(email);
CREATE INDEX idx_approaches_company_id ON approaches(company_id);
CREATE INDEX idx_approaches_status ON approaches(status);
CREATE INDEX idx_approaches_target ON approaches(target_type, target_id);
CREATE INDEX idx_email_templates_company_id ON email_templates(company_id);
CREATE INDEX idx_email_logs_company_id ON email_logs(company_id);
CREATE INDEX idx_email_logs_approach_id ON email_logs(approach_id);
CREATE INDEX idx_periodic_approaches_company_id ON periodic_approaches(company_id);
CREATE INDEX idx_view_logs_partner_id ON view_logs(partner_id);
CREATE INDEX idx_view_logs_engineer_id ON view_logs(engineer_id);
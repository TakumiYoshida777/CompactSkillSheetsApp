-- 本番環境用のパフォーマンスインデックス追加

-- BusinessPartner検索用インデックス
CREATE INDEX IF NOT EXISTS "idx_business_partner_ses_company" ON "business_partners"("ses_company_id");
CREATE INDEX IF NOT EXISTS "idx_business_partner_client_company" ON "business_partners"("client_company_id");
CREATE INDEX IF NOT EXISTS "idx_business_partner_active_deleted" ON "business_partners"("is_active", "deleted_at");
CREATE INDEX IF NOT EXISTS "idx_business_partner_created_at" ON "business_partners"("created_at" DESC);

-- BusinessPartnerDetail検索用インデックス
CREATE INDEX IF NOT EXISTS "idx_bp_detail_industry" ON "business_partner_details"("industry");
CREATE INDEX IF NOT EXISTS "idx_bp_detail_engineers" ON "business_partner_details"("current_engineers");
CREATE INDEX IF NOT EXISTS "idx_bp_detail_revenue" ON "business_partner_details"("monthly_revenue");
CREATE INDEX IF NOT EXISTS "idx_bp_detail_rating" ON "business_partner_details"("rating");

-- ClientUser検索用インデックス
CREATE INDEX IF NOT EXISTS "idx_client_user_business_partner" ON "client_users"("business_partner_id");
CREATE INDEX IF NOT EXISTS "idx_client_user_email" ON "client_users"("email");
CREATE INDEX IF NOT EXISTS "idx_client_user_active" ON "client_users"("is_active", "deleted_at");

-- Company検索用インデックス
CREATE INDEX IF NOT EXISTS "idx_company_type" ON "companies"("company_type");
CREATE INDEX IF NOT EXISTS "idx_company_name" ON "companies"("name");
CREATE INDEX IF NOT EXISTS "idx_company_name_kana" ON "companies"("name_kana");

-- User検索用インデックス
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_user_company" ON "users"("company_id");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "users"("role_id");
CREATE INDEX IF NOT EXISTS "idx_user_active" ON "users"("is_active", "deleted_at");

-- Engineer検索用インデックス
CREATE INDEX IF NOT EXISTS "idx_engineer_user" ON "engineers"("user_id");
CREATE INDEX IF NOT EXISTS "idx_engineer_ses_company" ON "engineers"("ses_company_id");
CREATE INDEX IF NOT EXISTS "idx_engineer_client_company" ON "engineers"("client_company_id");
CREATE INDEX IF NOT EXISTS "idx_engineer_status" ON "engineers"("is_waiting", "deleted_at");

-- SkillSheet検索用インデックス
CREATE INDEX IF NOT EXISTS "idx_skill_sheet_engineer" ON "skill_sheets"("engineer_id");
CREATE INDEX IF NOT EXISTS "idx_skill_sheet_created_at" ON "skill_sheets"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_skill_sheet_status" ON "skill_sheets"("is_public", "deleted_at");

-- Project検索用インデックス
CREATE INDEX IF NOT EXISTS "idx_project_engineer" ON "projects"("engineer_id");
CREATE INDEX IF NOT EXISTS "idx_project_dates" ON "projects"("start_date", "end_date");
CREATE INDEX IF NOT EXISTS "idx_project_name" ON "projects"("project_name");

-- 複合インデックス（頻繁に一緒に使用されるカラムの組み合わせ）
CREATE INDEX IF NOT EXISTS "idx_bp_search" ON "business_partners"("ses_company_id", "is_active", "deleted_at");
CREATE INDEX IF NOT EXISTS "idx_engineer_search" ON "engineers"("ses_company_id", "is_waiting", "deleted_at");
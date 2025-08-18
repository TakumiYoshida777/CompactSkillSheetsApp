-- ロールマスタテーブル
CREATE TABLE role_masters (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    role_name_en VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 業務タスクマスタテーブル
CREATE TABLE work_task_masters (
    id BIGSERIAL PRIMARY KEY,
    task_code VARCHAR(50) NOT NULL UNIQUE,
    task_name VARCHAR(100) NOT NULL,
    task_name_en VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    phase VARCHAR(50),
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- スキルマスタテーブル
CREATE TABLE skill_masters (
    id BIGSERIAL PRIMARY KEY,
    skill_code VARCHAR(50) NOT NULL UNIQUE,
    skill_name VARCHAR(100) NOT NULL,
    skill_type VARCHAR(50) NOT NULL CHECK (skill_type IN ('language', 'framework', 'database', 'cloud', 'tool', 'os', 'middleware', 'other')),
    category VARCHAR(50),
    version VARCHAR(50),
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- エンジニアロール経験テーブル
CREATE TABLE engineer_role_experiences (
    id BIGSERIAL PRIMARY KEY,
    engineer_id BIGINT NOT NULL,
    role_master_id BIGINT NOT NULL,
    years_of_experience DECIMAL(3,1) NOT NULL,
    last_used_date DATE,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (engineer_id) REFERENCES engineers(id) ON DELETE CASCADE,
    FOREIGN KEY (role_master_id) REFERENCES role_masters(id)
);

-- エンジニア業務経験テーブル
CREATE TABLE engineer_work_experiences (
    id BIGSERIAL PRIMARY KEY,
    engineer_id BIGINT NOT NULL,
    work_task_master_id BIGINT NOT NULL,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    years_of_experience DECIMAL(3,1),
    last_used_date DATE,
    project_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (engineer_id) REFERENCES engineers(id) ON DELETE CASCADE,
    FOREIGN KEY (work_task_master_id) REFERENCES work_task_masters(id)
);

-- エンジニアスキルテーブル
CREATE TABLE engineer_skills (
    id BIGSERIAL PRIMARY KEY,
    engineer_id BIGINT NOT NULL,
    skill_master_id BIGINT NOT NULL,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_of_experience DECIMAL(3,1),
    last_used_date DATE,
    is_primary BOOLEAN DEFAULT FALSE,
    certification VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (engineer_id) REFERENCES engineers(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_master_id) REFERENCES skill_masters(id)
);

-- インデックスの作成
CREATE INDEX idx_engineer_role_experiences_engineer ON engineer_role_experiences(engineer_id);
CREATE INDEX idx_engineer_role_experiences_role ON engineer_role_experiences(role_master_id);
CREATE INDEX idx_engineer_role_experiences_years ON engineer_role_experiences(years_of_experience);
CREATE INDEX idx_engineer_role_experiences_primary ON engineer_role_experiences(is_primary);

CREATE INDEX idx_engineer_work_experiences_engineer ON engineer_work_experiences(engineer_id);
CREATE INDEX idx_engineer_work_experiences_task ON engineer_work_experiences(work_task_master_id);
CREATE INDEX idx_engineer_work_experiences_level ON engineer_work_experiences(proficiency_level);

CREATE INDEX idx_engineer_skills_engineer ON engineer_skills(engineer_id);
CREATE INDEX idx_engineer_skills_skill ON engineer_skills(skill_master_id);
CREATE INDEX idx_engineer_skills_level ON engineer_skills(proficiency_level);
CREATE INDEX idx_engineer_skills_primary ON engineer_skills(is_primary);

CREATE INDEX idx_role_masters_code ON role_masters(role_code);
CREATE INDEX idx_work_task_masters_code ON work_task_masters(task_code);
CREATE INDEX idx_skill_masters_code ON skill_masters(skill_code);
CREATE INDEX idx_skill_masters_type ON skill_masters(skill_type);
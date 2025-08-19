-- デモエンジニアアカウント作成用SQLスクリプト
-- このスクリプトはデモエンジニアのアカウントを作成します

-- デモエンジニアA: 全クライアント対応可能
INSERT INTO users (email, "passwordHash", name, "isActive", "createdAt", "updatedAt", "passwordChangedAt")
VALUES (
  'demo-engineer-a@example.com',
  '$2b$10$ZgU.PXsLRqX1mKyR6FQi8.RzSQqJzNs4.jI9tVNvGCcKqzBcVqKtK', -- DemoPass123!
  'デモエンジニアA',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE
SET 
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "updatedAt" = CURRENT_TIMESTAMP;

-- デモエンジニアAのエンジニアプロフィール作成
INSERT INTO engineers (
  "userId",
  name,
  email,
  phone,
  "engineerType",
  "currentStatus",
  "isPublic",
  "createdAt",
  "updatedAt"
)
SELECT 
  u.id,
  'デモエンジニアA',
  'demo-engineer-a@example.com',
  '090-1234-5678',
  'EMPLOYEE'::engineer_type,
  'WORKING'::engineer_status,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE u.email = 'demo-engineer-a@example.com'
ON CONFLICT ("userId") DO UPDATE
SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  "currentStatus" = EXCLUDED."currentStatus",
  "updatedAt" = CURRENT_TIMESTAMP;

-- デモエンジニアB: 待機中ステータス
INSERT INTO users (email, "passwordHash", name, "isActive", "createdAt", "updatedAt", "passwordChangedAt")
VALUES (
  'demo-engineer-b@example.com',
  '$2b$10$ZgU.PXsLRqX1mKyR6FQi8.RzSQqJzNs4.jI9tVNvGCcKqzBcVqKtK', -- DemoPass123!
  'デモエンジニアB',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE
SET 
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "updatedAt" = CURRENT_TIMESTAMP;

-- デモエンジニアBのエンジニアプロフィール作成
INSERT INTO engineers (
  "userId",
  name,
  email,
  phone,
  "engineerType",
  "currentStatus",
  "isPublic",
  "createdAt",
  "updatedAt"
)
SELECT 
  u.id,
  'デモエンジニアB',
  'demo-engineer-b@example.com',
  '090-8765-4321',
  'FREELANCE'::engineer_type,
  'WAITING'::engineer_status,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE u.email = 'demo-engineer-b@example.com'
ON CONFLICT ("userId") DO UPDATE
SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  "currentStatus" = EXCLUDED."currentStatus",
  "updatedAt" = CURRENT_TIMESTAMP;
# usersテーブルのrole_id設計分析

## 調査日時
2025年1月24日

## 現在の設計

### usersテーブルの構造
```prisma
model User {
  id          BigInt    @id @default(autoincrement())
  companyId   BigInt?
  email       String    @unique
  name        String
  // ... その他のフィールド
  
  userRoles   UserRole[]  // ← リレーション（1対多）
  
  // role_id カラムは存在しない
}
```

### 関連テーブルの構造
```prisma
model UserRole {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt
  roleId    BigInt
  grantedBy BigInt
  createdAt DateTime @default(now())
  
  user    User @relation(fields: [userId], references: [id])
  role    Role @relation(fields: [roleId], references: [id])
  
  @@unique([userId, roleId])
  @@map("user_roles")
}
```

## 設計の評価

### ✅ 現在の設計（中間テーブル方式）は適切です

#### 理由1: 多対多の関係を正しく表現
- **1ユーザーが複数のロールを持てる**
  - 例: あるユーザーが「sales」と「manager」の両方のロールを持つ
- **1ロールを複数のユーザーが持てる**
  - 例: 「engineer」ロールを100人のユーザーが持つ

#### 理由2: 拡張性と柔軟性
```sql
-- 複数ロールの割り当てが可能
INSERT INTO user_roles (userId, roleId, grantedBy) VALUES
(1, 15, 1), -- user 1にadminロール
(1, 16, 1), -- user 1にmanagerロールも追加
(1, 17, 1); -- user 1にsalesロールも追加
```

#### 理由3: 監査情報の記録
- **grantedBy**: 誰がロールを付与したか
- **createdAt**: いつロールが付与されたか
- 将来的に`revokedBy`、`revokedAt`を追加可能

## もしusersテーブルにrole_idを持たせた場合の問題

### ❌ アンチパターン1: 単一role_idカラム
```sql
-- 悪い例
ALTER TABLE users ADD COLUMN role_id BIGINT;
```

**問題点**:
1. **1ユーザー1ロールに制限される**
   - 営業マネージャー（sales + manager）のような複合ロールが表現不可
2. **ロール変更履歴が残らない**
   - 誰がいつ変更したか不明
3. **一時的な権限付与が困難**
   - 期間限定の権限昇格などが実装しにくい

### ❌ アンチパターン2: 複数role_idカラム
```sql
-- 悪い例
ALTER TABLE users ADD COLUMN primary_role_id BIGINT;
ALTER TABLE users ADD COLUMN secondary_role_id BIGINT;
ALTER TABLE users ADD COLUMN tertiary_role_id BIGINT;
```

**問題点**:
1. **カラム数の制限**
   - 4つ目のロールが必要になったら？
2. **クエリが複雑化**
   ```sql
   WHERE primary_role_id = ? OR secondary_role_id = ? OR tertiary_role_id = ?
   ```
3. **正規化違反**
   - 第一正規形に違反

## 現在の設計の利点

### 1. 複雑な権限管理が可能
```sql
-- 営業部長: salesとmanagerの両方のロールを持つ
SELECT u.name, GROUP_CONCAT(r.name) as roles
FROM users u
JOIN user_roles ur ON u.id = ur.userId
JOIN roles r ON ur.roleId = r.id
WHERE u.id = 1
GROUP BY u.id, u.name;
-- 結果: "田中太郎" | "sales,manager"
```

### 2. ロールの追加・削除が簡単
```sql
-- ロール追加
INSERT INTO user_roles (userId, roleId, grantedBy) VALUES (1, 16, 2);

-- ロール削除
DELETE FROM user_roles WHERE userId = 1 AND roleId = 16;

-- ユーザーは他のロールを維持
```

### 3. 権限の継承と組み合わせ
```typescript
// 複数ロールの権限を統合
async function getUserPermissions(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true }
          }
        }
      }
    }
  });
  
  // 全ロールの権限を集約
  const permissions = new Set();
  userRoles.forEach(ur => {
    ur.role.rolePermissions.forEach(rp => {
      permissions.add(rp.permission.name);
    });
  });
  
  return Array.from(permissions);
}
```

## 推奨事項

### 1. 現在の設計を維持すべき理由
- ✅ **正規化されている**（第三正規形）
- ✅ **拡張性が高い**
- ✅ **監査ログ対応**
- ✅ **業界標準のRBACパターン**

### 2. 必要な対応
1. **user_rolesテーブルへのデータ投入**（最優先）
2. **デフォルトロールの概念を追加**（オプション）
   ```sql
   -- もしデフォルトロールが必要なら、別途フラグで管理
   ALTER TABLE user_roles ADD COLUMN is_primary BOOLEAN DEFAULT false;
   ```

### 3. パフォーマンス最適化
```sql
-- 適切なインデックスの追加（既に存在する可能性あり）
CREATE INDEX idx_user_roles_user_id ON user_roles(userId);
CREATE INDEX idx_user_roles_role_id ON user_roles(roleId);
```

## 結論

**usersテーブルにrole_idがないのは正しい設計です。**

### 理由
1. **多対多の関係を適切に表現**
2. **RBAC（Role-Based Access Control）の標準パターン**
3. **拡張性と保守性が高い**
4. **監査ログ対応可能**

### 現在の問題
- 設計は正しいが、**user_rolesテーブルにデータが入っていない**
- これがrole_idカラムがないことと混同されやすい

### 解決方法
- user_rolesテーブルにデータを投入すれば即座に動作する
- 設計変更は不要
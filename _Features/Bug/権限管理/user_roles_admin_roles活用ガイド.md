# user_rolesとadmin_rolesテーブル活用ガイド

## 現在のテーブル構造

### 1. user_rolesテーブル（一般ユーザー用）

**モデル名**: UserRole  
**物理テーブル名**: user_roles

```prisma
model UserRole {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt
  roleId    BigInt
  grantedBy BigInt   // 権限を付与した管理者のID
  createdAt DateTime @default(now())

  user    User @relation(fields: [userId], references: [id])
  role    Role @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId])
  @@map("user_roles")
}
```

**用途**:
- 一般ユーザー（エンジニア、営業、マネージャー等）のロール管理
- rolesテーブルと連携した権限制御
- 権限付与の履歴管理（grantedByで付与者を記録）

### 2. admin_rolesテーブル（管理者用）

**モデル名**: AdminRole  
**物理テーブル名**: admin_roles

```prisma
model AdminRole {
  id          BigInt   @id @default(autoincrement())
  name        String   @unique @db.VarChar(50)
  displayName String   @db.VarChar(100)
  description String?  @db.Text
  permissions Json     // 権限情報をJSON形式で格納
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  adminUserRoles AdminUserRole[]

  @@map("admin_roles")
}
```

**用途**:
- システム管理者専用のロール定義
- 権限情報をJSON形式で柔軟に管理
- システムロールの保護（isSystemフラグ）

## 活用方法

### 1. 基本的な使い分け

#### user_rolesの活用シーン
```typescript
// 一般ユーザーへのロール付与
async function assignUserRole(userId: string, roleId: string, grantedBy: string) {
  return await prisma.userRole.create({
    data: {
      userId: BigInt(userId),
      roleId: BigInt(roleId),
      grantedBy: BigInt(grantedBy),
    }
  });
}

// ユーザーの権限確認
async function getUserPermissions(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId: BigInt(userId) },
    include: {
      role: {
        include: {
          role_permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });
  
  // 権限の集約
  const permissions = new Set();
  userRoles.forEach(ur => {
    ur.role.role_permissions.forEach(rp => {
      permissions.add(rp.permission.name);
    });
  });
  
  return Array.from(permissions);
}
```

#### admin_rolesの活用シーン
```typescript
// 管理者ロールの作成
async function createAdminRole(name: string, permissions: object) {
  return await prisma.adminRole.create({
    data: {
      name,
      displayName: name,
      permissions: permissions, // JSON形式で権限を格納
      isSystem: true, // システムロールとして保護
    }
  });
}

// 管理者権限の確認
async function getAdminPermissions(adminUserId: string) {
  const adminUserRoles = await prisma.adminUserRole.findMany({
    where: { adminUserId: BigInt(adminUserId) },
    include: {
      adminRole: true
    }
  });
  
  // JSON形式の権限を解析
  const permissions = [];
  adminUserRoles.forEach(aur => {
    const rolePerms = aur.adminRole.permissions as any;
    permissions.push(...rolePerms);
  });
  
  return permissions;
}
```

### 2. 段階的な権限管理の実装

#### フェーズ1: user_rolesを活用した基本実装
1. **既存ユーザーへのロール割り当て**
   ```sql
   -- 管理者ユーザーにadminロールを付与
   INSERT INTO user_roles (userId, roleId, grantedBy, createdAt)
   SELECT u.id, r.id, 1, NOW()
   FROM users u, roles r
   WHERE u.email = 'admin@example.com'
   AND r.name = 'admin';
   ```

2. **権限チェックミドルウェアでの活用**
   ```typescript
   async function checkUserPermission(userId: string, resource: string, action: string) {
     const userRoles = await prisma.userRole.findMany({
       where: { userId: BigInt(userId) },
       include: {
         role: {
           include: {
             role_permissions: {
               include: {
                 permission: true
               }
             }
           }
         }
       }
     });
     
     // 権限チェックロジック
     return userRoles.some(ur => 
       ur.role.role_permissions.some(rp => 
         rp.permission.resource === resource && 
         rp.permission.action === action
       )
     );
   }
   ```

#### フェーズ2: admin_rolesを活用した高度な管理
1. **スーパー管理者の設定**
   ```typescript
   // スーパー管理者ロールの作成
   await prisma.adminRole.create({
     data: {
       name: 'super_admin',
       displayName: 'スーパー管理者',
       description: 'システム全体の管理権限',
       permissions: {
         all: true, // 全権限を持つ
         manage_roles: true,
         manage_users: true,
         system_settings: true
       },
       isSystem: true // 削除不可
     }
   });
   ```

2. **権限管理画面での活用**
   ```typescript
   // 管理者のみアクセス可能な権限管理機能
   async function canAccessAdminPanel(userId: string) {
     const adminUserRole = await prisma.adminUserRole.findFirst({
       where: {
         adminUserId: BigInt(userId),
         adminRole: {
           name: 'super_admin'
         }
       }
     });
     
     return !!adminUserRole;
   }
   ```

### 3. 両テーブルの連携活用

#### 統合的な権限確認
```typescript
async function getAllUserPermissions(userId: string) {
  // 一般ユーザー権限を取得
  const userPermissions = await getUserPermissionsFromUserRoles(userId);
  
  // 管理者権限を取得（該当する場合）
  const adminPermissions = await getAdminPermissionsFromAdminRoles(userId);
  
  // 権限の統合
  return {
    regular: userPermissions,
    admin: adminPermissions,
    isAdmin: adminPermissions.length > 0,
    isSuperAdmin: adminPermissions.some(p => p.name === 'super_admin')
  };
}
```

#### 権限の階層管理
```typescript
// 権限の優先度設定
const PERMISSION_HIERARCHY = {
  super_admin: 100,    // admin_rolesから
  admin: 90,          // user_rolesから
  manager: 70,        // user_rolesから
  sales: 50,          // user_rolesから
  engineer: 30,       // user_rolesから
  guest: 10           // デフォルト
};

async function getHighestRole(userId: string) {
  const allRoles = await getAllUserRoles(userId);
  
  return allRoles.reduce((highest, current) => {
    const currentPriority = PERMISSION_HIERARCHY[current] || 0;
    const highestPriority = PERMISSION_HIERARCHY[highest] || 0;
    return currentPriority > highestPriority ? current : highest;
  }, 'guest');
}
```

## 実装推奨事項

### 1. user_rolesの即座の活用
- **既存システムとの互換性維持**
- **段階的な移行が可能**
- **rolesテーブルとの連携が既に設計済み**

### 2. admin_rolesの将来的な活用
- **スーパー管理者機能の実装時に使用**
- **JSON形式で柔軟な権限設定が可能**
- **システムロールの保護機能あり**

### 3. データ投入の優先順位

#### 最優先: user_rolesへのデータ投入
```sql
-- 1. rolesテーブルにロールデータを投入
INSERT INTO roles (name, displayName, isSystem) VALUES
('admin', '管理者', true),
('sales', '営業', true),
('engineer', 'エンジニア', true);

-- 2. user_rolesでユーザーとロールを紐付け
INSERT INTO user_roles (userId, roleId, grantedBy)
SELECT u.id, r.id, 1
FROM users u, roles r
WHERE u.type = 'admin' AND r.name = 'admin';
```

#### 次段階: admin_rolesの活用
```sql
-- スーパー管理者用のロール作成
INSERT INTO admin_roles (name, displayName, permissions, isSystem)
VALUES ('super_admin', 'スーパー管理者', 
        '{"all": true, "system_management": true}', true);

-- スーパー管理者の割り当て
INSERT INTO admin_user_roles (adminUserId, adminRoleId, grantedBy)
VALUES (1, 1, 1);
```

## まとめ

1. **user_roles**: 一般的な権限管理に使用（即座に活用可能）
2. **admin_roles**: 高度な管理者権限に使用（将来の拡張用）
3. **段階的な実装**: まずuser_rolesで基本実装、その後admin_rolesで拡張
4. **両テーブルの連携**: 統合的な権限管理システムの構築が可能
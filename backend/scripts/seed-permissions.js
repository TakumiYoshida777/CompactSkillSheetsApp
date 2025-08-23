#!/usr/bin/env node

/**
 * 権限管理システム初期データ投入スクリプト
 * 実行方法: node scripts/seed-permissions.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 権限管理システムの初期データ投入を開始します...');

  try {
    // トランザクションで実行
    await prisma.$transaction(async (tx) => {
      // 1. 既存データのクリア（開発環境のみ）
      console.log('📝 既存データをクリアしています...');
      await tx.role_permissions.deleteMany({});
      await tx.user_roles.deleteMany({});
      await tx.permissions.deleteMany({});
      await tx.roles.deleteMany({});

      // 2. ロールの作成
      console.log('👥 ロールを作成しています...');
      const roles = await Promise.all([
        tx.roles.create({
          data: {
            name: 'admin',
            displayName: '管理者',
            description: 'システム全体の管理権限を持つロール',
            isSystem: true
          }
        }),
        tx.roles.create({
          data: {
            name: 'manager',
            displayName: 'マネージャー',
            description: 'ユーザー管理とプロジェクト管理権限を持つロール',
            isSystem: true
          }
        }),
        tx.roles.create({
          data: {
            name: 'sales',
            displayName: '営業',
            description: '取引先管理とエンジニア情報閲覧権限を持つロール',
            isSystem: true
          }
        }),
        tx.roles.create({
          data: {
            name: 'engineer',
            displayName: 'エンジニア',
            description: '自身のスキルシート管理権限を持つロール',
            isSystem: true
          }
        }),
        tx.roles.create({
          data: {
            name: 'client_admin',
            displayName: '取引先管理者',
            description: '取引先企業の管理者権限を持つロール',
            isSystem: true
          }
        }),
        tx.roles.create({
          data: {
            name: 'client_sales',
            displayName: '取引先営業',
            description: '取引先企業の営業権限を持つロール',
            isSystem: true
          }
        }),
        tx.roles.create({
          data: {
            name: 'client_pm',
            displayName: '取引先PM',
            description: '取引先企業のプロジェクトマネージャー権限を持つロール',
            isSystem: true
          }
        })
      ]);

      const roleMap = {};
      roles.forEach(role => {
        roleMap[role.name] = role.id;
      });

      // 3. 権限の作成
      console.log('🔐 権限を作成しています...');
      const permissionData = [
        // ユーザー管理権限
        { name: 'user:view', displayName: 'ユーザー閲覧', resource: 'user', action: 'view', description: 'ユーザー情報を閲覧する権限' },
        { name: 'user:create', displayName: 'ユーザー作成', resource: 'user', action: 'create', description: 'ユーザーを作成する権限' },
        { name: 'user:update', displayName: 'ユーザー更新', resource: 'user', action: 'update', description: 'ユーザー情報を更新する権限' },
        { name: 'user:delete', displayName: 'ユーザー削除', resource: 'user', action: 'delete', description: 'ユーザーを削除する権限' },
        { name: 'user:manage_role', displayName: 'ロール管理', resource: 'user', action: 'manage_role', description: 'ユーザーのロールを管理する権限' },
        
        // エンジニア管理権限
        { name: 'engineer:view', displayName: 'エンジニア閲覧', resource: 'engineer', action: 'view', description: 'エンジニア情報を閲覧する権限' },
        { name: 'engineer:create', displayName: 'エンジニア作成', resource: 'engineer', action: 'create', description: 'エンジニアを作成する権限' },
        { name: 'engineer:update', displayName: 'エンジニア更新', resource: 'engineer', action: 'update', description: 'エンジニア情報を更新する権限' },
        { name: 'engineer:delete', displayName: 'エンジニア削除', resource: 'engineer', action: 'delete', description: 'エンジニアを削除する権限' },
        { name: 'engineer:export', displayName: 'エンジニアエクスポート', resource: 'engineer', action: 'export', description: 'エンジニア情報をエクスポートする権限' },
        
        // スキルシート管理権限
        { name: 'skillsheet:view', displayName: 'スキルシート閲覧', resource: 'skillsheet', action: 'view', description: 'スキルシートを閲覧する権限' },
        { name: 'skillsheet:create', displayName: 'スキルシート作成', resource: 'skillsheet', action: 'create', description: 'スキルシートを作成する権限' },
        { name: 'skillsheet:update', displayName: 'スキルシート更新', resource: 'skillsheet', action: 'update', description: 'スキルシートを更新する権限' },
        { name: 'skillsheet:delete', displayName: 'スキルシート削除', resource: 'skillsheet', action: 'delete', description: 'スキルシートを削除する権限' },
        { name: 'skillsheet:export', displayName: 'スキルシートエクスポート', resource: 'skillsheet', action: 'export', description: 'スキルシートをエクスポートする権限' },
        
        // プロジェクト管理権限
        { name: 'project:view', displayName: 'プロジェクト閲覧', resource: 'project', action: 'view', description: 'プロジェクト情報を閲覧する権限' },
        { name: 'project:create', displayName: 'プロジェクト作成', resource: 'project', action: 'create', description: 'プロジェクトを作成する権限' },
        { name: 'project:update', displayName: 'プロジェクト更新', resource: 'project', action: 'update', description: 'プロジェクト情報を更新する権限' },
        { name: 'project:delete', displayName: 'プロジェクト削除', resource: 'project', action: 'delete', description: 'プロジェクトを削除する権限' },
        { name: 'project:assign', displayName: 'プロジェクトアサイン', resource: 'project', action: 'assign', description: 'エンジニアをプロジェクトにアサインする権限' },
        
        // 取引先管理権限
        { name: 'partner:view', displayName: '取引先閲覧', resource: 'partner', action: 'view', description: '取引先情報を閲覧する権限' },
        { name: 'partner:create', displayName: '取引先作成', resource: 'partner', action: 'create', description: '取引先を作成する権限' },
        { name: 'partner:update', displayName: '取引先更新', resource: 'partner', action: 'update', description: '取引先情報を更新する権限' },
        { name: 'partner:delete', displayName: '取引先削除', resource: 'partner', action: 'delete', description: '取引先を削除する権限' },
        { name: 'partner:manage', displayName: '取引先管理', resource: 'partner', action: 'manage', description: '取引先の設定を管理する権限' },
        
        // アプローチ管理権限
        { name: 'approach:view', displayName: 'アプローチ閲覧', resource: 'approach', action: 'view', description: 'アプローチ情報を閲覧する権限' },
        { name: 'approach:create', displayName: 'アプローチ作成', resource: 'approach', action: 'create', description: 'アプローチを作成する権限' },
        { name: 'approach:update', displayName: 'アプローチ更新', resource: 'approach', action: 'update', description: 'アプローチ情報を更新する権限' },
        { name: 'approach:delete', displayName: 'アプローチ削除', resource: 'approach', action: 'delete', description: 'アプローチを削除する権限' },
        { name: 'approach:send', displayName: 'アプローチ送信', resource: 'approach', action: 'send', description: 'アプローチを送信する権限' },
        
        // オファー管理権限
        { name: 'offer:view', displayName: 'オファー閲覧', resource: 'offer', action: 'view', description: 'オファー情報を閲覧する権限' },
        { name: 'offer:create', displayName: 'オファー作成', resource: 'offer', action: 'create', description: 'オファーを作成する権限' },
        { name: 'offer:update', displayName: 'オファー更新', resource: 'offer', action: 'update', description: 'オファー情報を更新する権限' },
        { name: 'offer:delete', displayName: 'オファー削除', resource: 'offer', action: 'delete', description: 'オファーを削除する権限' },
        { name: 'offer:respond', displayName: 'オファー回答', resource: 'offer', action: 'respond', description: 'オファーに回答する権限' },
        
        // レポート管理権限
        { name: 'report:view', displayName: 'レポート閲覧', resource: 'report', action: 'view', description: 'レポートを閲覧する権限' },
        { name: 'report:create', displayName: 'レポート作成', resource: 'report', action: 'create', description: 'レポートを作成する権限' },
        { name: 'report:export', displayName: 'レポートエクスポート', resource: 'report', action: 'export', description: 'レポートをエクスポートする権限' },
        
        // 設定管理権限
        { name: 'settings:view', displayName: '設定閲覧', resource: 'settings', action: 'view', description: 'システム設定を閲覧する権限' },
        { name: 'settings:update', displayName: '設定更新', resource: 'settings', action: 'update', description: 'システム設定を更新する権限' },
        { name: 'settings:manage', displayName: '設定管理', resource: 'settings', action: 'manage', description: 'システム設定を管理する権限' }
      ];

      const permissions = await Promise.all(
        permissionData.map(perm => 
          tx.permissions.create({ data: perm })
        )
      );

      const permissionMap = {};
      permissions.forEach(perm => {
        permissionMap[perm.name] = perm.id;
      });

      // 4. ロールへの権限割り当て
      console.log('🔗 ロールに権限を割り当てています...');
      
      // 管理者には全権限を付与
      const adminPermissions = Object.values(permissionMap).map(permId => ({
        roleId: roleMap['admin'],
        permissionId: permId
      }));
      await tx.role_permissions.createMany({ data: adminPermissions });

      // マネージャーロールの権限
      const managerPermissions = [
        'user:view', 'user:create', 'user:update',
        'engineer:view', 'engineer:create', 'engineer:update',
        'skillsheet:view', 'skillsheet:update',
        'project:view', 'project:create', 'project:update', 'project:assign',
        'partner:view', 'partner:create', 'partner:update',
        'approach:view', 'approach:create', 'approach:update', 'approach:send',
        'offer:view', 'offer:create', 'offer:update',
        'report:view', 'report:create', 'report:export'
      ].map(name => ({
        roleId: roleMap['manager'],
        permissionId: permissionMap[name]
      }));
      await tx.role_permissions.createMany({ data: managerPermissions });

      // 営業ロールの権限
      const salesPermissions = [
        'engineer:view',
        'skillsheet:view',
        'project:view',
        'partner:view', 'partner:create', 'partner:update',
        'approach:view', 'approach:create', 'approach:update', 'approach:send',
        'offer:view', 'offer:create', 'offer:update',
        'report:view'
      ].map(name => ({
        roleId: roleMap['sales'],
        permissionId: permissionMap[name]
      }));
      await tx.role_permissions.createMany({ data: salesPermissions });

      // エンジニアロールの権限
      const engineerPermissions = [
        'skillsheet:view', 'skillsheet:update',
        'project:view'
      ].map(name => ({
        roleId: roleMap['engineer'],
        permissionId: permissionMap[name]
      }));
      await tx.role_permissions.createMany({ data: engineerPermissions });

      // 取引先管理者ロールの権限
      const clientAdminPermissions = [
        'engineer:view',
        'skillsheet:view',
        'offer:view', 'offer:respond'
      ].map(name => ({
        roleId: roleMap['client_admin'],
        permissionId: permissionMap[name]
      }));
      await tx.role_permissions.createMany({ data: clientAdminPermissions });

      // 取引先営業ロールの権限
      const clientSalesPermissions = [
        'engineer:view',
        'skillsheet:view',
        'offer:view', 'offer:respond'
      ].map(name => ({
        roleId: roleMap['client_sales'],
        permissionId: permissionMap[name]
      }));
      await tx.role_permissions.createMany({ data: clientSalesPermissions });

      // 取引先PMロールの権限
      const clientPmPermissions = [
        'engineer:view',
        'skillsheet:view'
      ].map(name => ({
        roleId: roleMap['client_pm'],
        permissionId: permissionMap[name]
      }));
      await tx.role_permissions.createMany({ data: clientPmPermissions });

      // 5. デモ用の管理者ユーザーを作成（オプション）
      const createDemoAdmin = process.env.CREATE_DEMO_ADMIN === 'true';
      if (createDemoAdmin) {
        console.log('👤 デモ用管理者ユーザーを作成しています...');
        
        // デモSES企業を作成
        const demoCompany = await tx.companies.create({
          data: {
            companyType: 'SES',
            name: 'デモSES企業',
            emailDomain: 'demo-ses.example.com',
            maxEngineers: 100,
            isActive: true
          }
        });

        // 管理者ユーザーを作成
        const passwordHash = await bcrypt.hash('Admin@123', 10);
        const adminUser = await tx.users.create({
          data: {
            email: 'admin@demo-ses.example.com',
            passwordHash,
            name: 'システム管理者',
            companyId: demoCompany.id,
            isActive: true,
            passwordChangedAt: new Date()
          }
        });

        // 管理者ロールを割り当て
        await tx.user_roles.create({
          data: {
            userId: adminUser.id,
            roleId: roleMap['admin'],
            grantedBy: adminUser.id
          }
        });

        console.log('✅ デモ用管理者ユーザーを作成しました');
        console.log('   Email: admin@demo-ses.example.com');
        console.log('   Password: Admin@123');
      }

      console.log('✅ 権限管理システムの初期データ投入が完了しました！');
    });

    // 投入結果の確認
    const roleCount = await prisma.roles.count();
    const permissionCount = await prisma.permissions.count();
    const rolePermissionCount = await prisma.role_permissions.count();

    console.log('\n📊 投入結果:');
    console.log(`   ロール数: ${roleCount}`);
    console.log(`   権限数: ${permissionCount}`);
    console.log(`   ロール権限マッピング数: ${rolePermissionCount}`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
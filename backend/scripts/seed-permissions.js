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
      await tx.rolePermission.deleteMany({});
      await tx.userRole.deleteMany({});
      await tx.clientUserRole.deleteMany({}); // client_user_rolesテーブルもクリア
      await tx.permission.deleteMany({});
      await tx.role.deleteMany({});

      // 2. ロールの作成
      console.log('👥 ロールを作成しています...');
      const roles = await Promise.all([
        // サービス提供事業者ロール
        tx.role.create({
          data: {
            name: 'super_admin',
            displayName: 'スーパー管理者',
            description: 'システム全体の最高権限を持つロール',
            isSystem: true
          }
        }),
        tx.role.create({
          data: {
            name: 'general_admin',
            displayName: '一般管理者',
            description: 'システムの一般的な管理権限を持つロール',
            isSystem: true
          }
        }),
        tx.role.create({
          data: {
            name: 'operator',
            displayName: 'オペレーター',
            description: 'サポート業務を行うロール',
            isSystem: true
          }
        }),
        // SES企業ロール
        tx.role.create({
          data: {
            name: 'admin',
            displayName: '管理者',
            description: 'SES企業の管理権限を持つロール',
            isSystem: true
          }
        }),
        tx.role.create({
          data: {
            name: 'manager',
            displayName: 'マネージャー',
            description: 'ユーザー管理とプロジェクト管理権限を持つロール',
            isSystem: true
          }
        }),
        tx.role.create({
          data: {
            name: 'sales',
            displayName: '営業',
            description: '取引先管理とエンジニア情報閲覧権限を持つロール',
            isSystem: true
          }
        }),
        tx.role.create({
          data: {
            name: 'engineer',
            displayName: 'エンジニア',
            description: '自身のスキルシート管理権限を持つロール',
            isSystem: true
          }
        }),
        // 取引先企業ロール
        tx.role.create({
          data: {
            name: 'client_admin',
            displayName: '取引先管理者',
            description: '取引先企業の管理者権限を持つロール',
            isSystem: true
          }
        }),
        tx.role.create({
          data: {
            name: 'client_sales',
            displayName: '取引先営業',
            description: '取引先企業の営業権限を持つロール',
            isSystem: true
          }
        }),
        tx.role.create({
          data: {
            name: 'client_pm',
            displayName: '取引先PM',
            description: '取引先企業のプロジェクトマネージャー権限を持つロール',
            isSystem: true
          }
        }),
        // フリーランスロール
        tx.role.create({
          data: {
            name: 'freelancer',
            displayName: 'フリーランス',
            description: 'フリーランスエンジニアのロール',
            isSystem: true
          }
        })
      ]);

      const roleMap = {};
      roles.forEach(role => {
        roleMap[role.name] = role.id;
      });

      // 3. 権限の作成（スコープ付き）
      console.log('🔐 権限を作成しています...');
      const permissionData = [
        // ユーザー管理権限
        { name: 'user:view:all', displayName: 'ユーザー閲覧（全体）', resource: 'user', action: 'view', scope: 'all', description: '全てのユーザー情報を閲覧する権限' },
        { name: 'user:view:company', displayName: 'ユーザー閲覧（自社）', resource: 'user', action: 'view', scope: 'company', description: '自社のユーザー情報を閲覧する権限' },
        { name: 'user:view:own', displayName: 'ユーザー閲覧（自分）', resource: 'user', action: 'view', scope: 'own', description: '自分のユーザー情報を閲覧する権限' },
        { name: 'user:create', displayName: 'ユーザー作成', resource: 'user', action: 'create', description: 'ユーザーを作成する権限' },
        { name: 'user:update:all', displayName: 'ユーザー更新（全体）', resource: 'user', action: 'update', scope: 'all', description: '全てのユーザー情報を更新する権限' },
        { name: 'user:update:company', displayName: 'ユーザー更新（自社）', resource: 'user', action: 'update', scope: 'company', description: '自社のユーザー情報を更新する権限' },
        { name: 'user:update:own', displayName: 'ユーザー更新（自分）', resource: 'user', action: 'update', scope: 'own', description: '自分のユーザー情報を更新する権限' },
        { name: 'user:delete', displayName: 'ユーザー削除', resource: 'user', action: 'delete', description: 'ユーザーを削除する権限' },
        { name: 'user:manage_role', displayName: 'ロール管理', resource: 'user', action: 'manage_role', description: 'ユーザーのロールを管理する権限' },
        
        // エンジニア管理権限
        { name: 'engineer:view:all', displayName: 'エンジニア閲覧（全体）', resource: 'engineer', action: 'view', scope: 'all', description: '全てのエンジニア情報を閲覧する権限' },
        { name: 'engineer:view:company', displayName: 'エンジニア閲覧（自社）', resource: 'engineer', action: 'view', scope: 'company', description: '自社のエンジニア情報を閲覧する権限' },
        { name: 'engineer:view:allowed', displayName: 'エンジニア閲覧（許可）', resource: 'engineer', action: 'view', scope: 'allowed', description: '許可されたエンジニア情報を閲覧する権限' },
        { name: 'engineer:create', displayName: 'エンジニア作成', resource: 'engineer', action: 'create', description: 'エンジニアを作成する権限' },
        { name: 'engineer:update:all', displayName: 'エンジニア更新（全体）', resource: 'engineer', action: 'update', scope: 'all', description: '全てのエンジニア情報を更新する権限' },
        { name: 'engineer:update:company', displayName: 'エンジニア更新（自社）', resource: 'engineer', action: 'update', scope: 'company', description: '自社のエンジニア情報を更新する権限' },
        { name: 'engineer:delete', displayName: 'エンジニア削除', resource: 'engineer', action: 'delete', description: 'エンジニアを削除する権限' },
        { name: 'engineer:export', displayName: 'エンジニアエクスポート', resource: 'engineer', action: 'export', description: 'エンジニア情報をエクスポートする権限' },
        
        // スキルシート管理権限
        { name: 'skillsheet:view:all', displayName: 'スキルシート閲覧（全体）', resource: 'skillsheet', action: 'view', scope: 'all', description: '全てのスキルシートを閲覧する権限' },
        { name: 'skillsheet:view:company', displayName: 'スキルシート閲覧（自社）', resource: 'skillsheet', action: 'view', scope: 'company', description: '自社のスキルシートを閲覧する権限' },
        { name: 'skillsheet:view:allowed', displayName: 'スキルシート閲覧（許可）', resource: 'skillsheet', action: 'view', scope: 'allowed', description: '許可されたスキルシートを閲覧する権限' },
        { name: 'skillsheet:view:own', displayName: 'スキルシート閲覧（自分）', resource: 'skillsheet', action: 'view', scope: 'own', description: '自分のスキルシートを閲覧する権限' },
        { name: 'skillsheet:create', displayName: 'スキルシート作成', resource: 'skillsheet', action: 'create', description: 'スキルシートを作成する権限' },
        { name: 'skillsheet:update:all', displayName: 'スキルシート更新（全体）', resource: 'skillsheet', action: 'update', scope: 'all', description: '全てのスキルシートを更新する権限' },
        { name: 'skillsheet:update:company', displayName: 'スキルシート更新（自社）', resource: 'skillsheet', action: 'update', scope: 'company', description: '自社のスキルシートを更新する権限' },
        { name: 'skillsheet:update:own', displayName: 'スキルシート更新（自分）', resource: 'skillsheet', action: 'update', scope: 'own', description: '自分のスキルシートを更新する権限' },
        { name: 'skillsheet:delete', displayName: 'スキルシート削除', resource: 'skillsheet', action: 'delete', description: 'スキルシートを削除する権限' },
        { name: 'skillsheet:export', displayName: 'スキルシートエクスポート', resource: 'skillsheet', action: 'export', description: 'スキルシートをエクスポートする権限' },
        
        // プロジェクト管理権限
        { name: 'project:view:all', displayName: 'プロジェクト閲覧（全体）', resource: 'project', action: 'view', scope: 'all', description: '全てのプロジェクト情報を閲覧する権限' },
        { name: 'project:view:company', displayName: 'プロジェクト閲覧（自社）', resource: 'project', action: 'view', scope: 'company', description: '自社のプロジェクト情報を閲覧する権限' },
        { name: 'project:view:assigned', displayName: 'プロジェクト閲覧（参加）', resource: 'project', action: 'view', scope: 'assigned', description: '参加しているプロジェクト情報を閲覧する権限' },
        { name: 'project:create', displayName: 'プロジェクト作成', resource: 'project', action: 'create', description: 'プロジェクトを作成する権限' },
        { name: 'project:update:all', displayName: 'プロジェクト更新（全体）', resource: 'project', action: 'update', scope: 'all', description: '全てのプロジェクト情報を更新する権限' },
        { name: 'project:update:company', displayName: 'プロジェクト更新（自社）', resource: 'project', action: 'update', scope: 'company', description: '自社のプロジェクト情報を更新する権限' },
        { name: 'project:delete', displayName: 'プロジェクト削除', resource: 'project', action: 'delete', description: 'プロジェクトを削除する権限' },
        { name: 'project:assign', displayName: 'プロジェクトアサイン', resource: 'project', action: 'assign', description: 'エンジニアをプロジェクトにアサインする権限' },
        
        // 取引先管理権限
        { name: 'partner:view:all', displayName: '取引先閲覧（全体）', resource: 'partner', action: 'view', scope: 'all', description: '全ての取引先情報を閲覧する権限' },
        { name: 'partner:view:company', displayName: '取引先閲覧（自社）', resource: 'partner', action: 'view', scope: 'company', description: '自社の取引先情報を閲覧する権限' },
        { name: 'partner:create', displayName: '取引先作成', resource: 'partner', action: 'create', description: '取引先を作成する権限' },
        { name: 'partner:update:all', displayName: '取引先更新（全体）', resource: 'partner', action: 'update', scope: 'all', description: '全ての取引先情報を更新する権限' },
        { name: 'partner:update:company', displayName: '取引先更新（自社）', resource: 'partner', action: 'update', scope: 'company', description: '自社の取引先情報を更新する権限' },
        { name: 'partner:delete', displayName: '取引先削除', resource: 'partner', action: 'delete', description: '取引先を削除する権限' },
        { name: 'partner:manage', displayName: '取引先管理', resource: 'partner', action: 'manage', description: '取引先の設定を管理する権限' },
        
        // 企業管理権限
        { name: 'company:view:all', displayName: '企業閲覧（全体）', resource: 'company', action: 'view', scope: 'all', description: '全ての企業情報を閲覧する権限' },
        { name: 'company:view:own', displayName: '企業閲覧（自社）', resource: 'company', action: 'view', scope: 'own', description: '自社の企業情報を閲覧する権限' },
        { name: 'company:create', displayName: '企業作成', resource: 'company', action: 'create', description: '企業を作成する権限' },
        { name: 'company:update:all', displayName: '企業更新（全体）', resource: 'company', action: 'update', scope: 'all', description: '全ての企業情報を更新する権限' },
        { name: 'company:update:own', displayName: '企業更新（自社）', resource: 'company', action: 'update', scope: 'own', description: '自社の企業情報を更新する権限' },
        { name: 'company:delete', displayName: '企業削除', resource: 'company', action: 'delete', description: '企業を削除する権限' },
        { name: 'company:manage', displayName: '企業管理', resource: 'company', action: 'manage', description: '企業の設定を管理する権限' },
        
        // 契約管理権限
        { name: 'contract:view:all', displayName: '契約閲覧（全体）', resource: 'contract', action: 'view', scope: 'all', description: '全ての契約情報を閲覧する権限' },
        { name: 'contract:view:company', displayName: '契約閲覧（自社）', resource: 'contract', action: 'view', scope: 'company', description: '自社の契約情報を閲覧する権限' },
        { name: 'contract:create', displayName: '契約作成', resource: 'contract', action: 'create', description: '契約を作成する権限' },
        { name: 'contract:update', displayName: '契約更新', resource: 'contract', action: 'update', description: '契約情報を更新する権限' },
        { name: 'contract:delete', displayName: '契約削除', resource: 'contract', action: 'delete', description: '契約を削除する権限' },
        
        // 請求管理権限
        { name: 'invoice:view:all', displayName: '請求閲覧（全体）', resource: 'invoice', action: 'view', scope: 'all', description: '全ての請求情報を閲覧する権限' },
        { name: 'invoice:view:company', displayName: '請求閲覧（自社）', resource: 'invoice', action: 'view', scope: 'company', description: '自社の請求情報を閲覧する権限' },
        { name: 'invoice:create', displayName: '請求作成', resource: 'invoice', action: 'create', description: '請求を作成する権限' },
        { name: 'invoice:update', displayName: '請求更新', resource: 'invoice', action: 'update', description: '請求情報を更新する権限' },
        { name: 'invoice:delete', displayName: '請求削除', resource: 'invoice', action: 'delete', description: '請求を削除する権限' },
        
        // アプローチ管理権限
        { name: 'approach:view:all', displayName: 'アプローチ閲覧（全体）', resource: 'approach', action: 'view', scope: 'all', description: '全てのアプローチ情報を閲覧する権限' },
        { name: 'approach:view:company', displayName: 'アプローチ閲覧（自社）', resource: 'approach', action: 'view', scope: 'company', description: '自社のアプローチ情報を閲覧する権限' },
        { name: 'approach:create', displayName: 'アプローチ作成', resource: 'approach', action: 'create', description: 'アプローチを作成する権限' },
        { name: 'approach:update', displayName: 'アプローチ更新', resource: 'approach', action: 'update', description: 'アプローチ情報を更新する権限' },
        { name: 'approach:delete', displayName: 'アプローチ削除', resource: 'approach', action: 'delete', description: 'アプローチを削除する権限' },
        { name: 'approach:send', displayName: 'アプローチ送信', resource: 'approach', action: 'send', description: 'アプローチを送信する権限' },
        
        // オファー管理権限
        { name: 'offer:view:all', displayName: 'オファー閲覧（全体）', resource: 'offer', action: 'view', scope: 'all', description: '全てのオファー情報を閲覧する権限' },
        { name: 'offer:view:company', displayName: 'オファー閲覧（自社）', resource: 'offer', action: 'view', scope: 'company', description: '自社のオファー情報を閲覧する権限' },
        { name: 'offer:create', displayName: 'オファー作成', resource: 'offer', action: 'create', description: 'オファーを作成する権限' },
        { name: 'offer:update', displayName: 'オファー更新', resource: 'offer', action: 'update', description: 'オファー情報を更新する権限' },
        { name: 'offer:delete', displayName: 'オファー削除', resource: 'offer', action: 'delete', description: 'オファーを削除する権限' },
        { name: 'offer:respond', displayName: 'オファー回答', resource: 'offer', action: 'respond', description: 'オファーに回答する権限' },
        
        // レポート管理権限
        { name: 'report:view:all', displayName: 'レポート閲覧（全体）', resource: 'report', action: 'view', scope: 'all', description: '全てのレポートを閲覧する権限' },
        { name: 'report:view:company', displayName: 'レポート閲覧（自社）', resource: 'report', action: 'view', scope: 'company', description: '自社のレポートを閲覧する権限' },
        { name: 'report:create', displayName: 'レポート作成', resource: 'report', action: 'create', description: 'レポートを作成する権限' },
        { name: 'report:export', displayName: 'レポートエクスポート', resource: 'report', action: 'export', description: 'レポートをエクスポートする権限' },
        
        // 設定管理権限
        { name: 'settings:view', displayName: '設定閲覧', resource: 'settings', action: 'view', description: 'システム設定を閲覧する権限' },
        { name: 'settings:update', displayName: '設定更新', resource: 'settings', action: 'update', description: 'システム設定を更新する権限' },
        { name: 'settings:manage', displayName: '設定管理', resource: 'settings', action: 'manage', description: 'システム設定を管理する権限' },
        
        // システム管理権限
        { name: 'system:manage', displayName: 'システム管理', resource: 'system', action: 'manage', description: 'システム全体を管理する権限' },
        { name: 'system:backup', displayName: 'バックアップ', resource: 'system', action: 'backup', description: 'システムバックアップを実行する権限' },
        { name: 'system:restore', displayName: 'リストア', resource: 'system', action: 'restore', description: 'システムリストアを実行する権限' },
        { name: 'system:monitor', displayName: 'モニタリング', resource: 'system', action: 'monitor', description: 'システムモニタリングを実行する権限' }
      ];

      const permissions = await Promise.all(
        permissionData.map(perm => 
          tx.permission.create({ data: perm })
        )
      );

      const permissionMap = {};
      permissions.forEach(perm => {
        permissionMap[perm.name] = perm.id;
      });

      // 4. ロールへの権限割り当て
      console.log('🔗 ロールに権限を割り当てています...');
      
      // スーパー管理者には全権限を付与
      const superAdminPermissions = Object.values(permissionMap).map(permId => ({
        roleId: roleMap['super_admin'],
        permissionId: permId
      }));
      await tx.rolePermission.createMany({ data: superAdminPermissions });

      // 一般管理者ロールの権限
      const generalAdminPermissions = [
        'company:view:all', 'company:create', 'company:update:all', 'company:manage',
        'user:view:all', 'user:create', 'user:update:all', 'user:manage_role',
        'contract:view:all', 'contract:create', 'contract:update',
        'invoice:view:all', 'invoice:create', 'invoice:update',
        'report:view:all', 'report:create', 'report:export',
        'settings:view', 'settings:update'
      ].map(name => ({
        roleId: roleMap['general_admin'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: generalAdminPermissions });

      // オペレーターロールの権限
      const operatorPermissions = [
        'company:view:all',
        'user:view:all',
        'engineer:view:all',
        'skillsheet:view:all',
        'project:view:all',
        'partner:view:all',
        'report:view:all'
      ].map(name => ({
        roleId: roleMap['operator'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: operatorPermissions });

      // SES企業管理者には自社範囲の全権限を付与
      const adminPermissions = [
        'user:view:company', 'user:create', 'user:update:company', 'user:delete', 'user:manage_role',
        'engineer:view:company', 'engineer:create', 'engineer:update:company', 'engineer:delete', 'engineer:export',
        'skillsheet:view:company', 'skillsheet:create', 'skillsheet:update:company', 'skillsheet:delete', 'skillsheet:export',
        'project:view:company', 'project:create', 'project:update:company', 'project:delete', 'project:assign',
        'partner:view:company', 'partner:create', 'partner:update:company', 'partner:delete', 'partner:manage',
        'company:view:own', 'company:update:own',
        'contract:view:company', 'contract:create', 'contract:update',
        'invoice:view:company', 'invoice:create', 'invoice:update',
        'approach:view:company', 'approach:create', 'approach:update', 'approach:delete', 'approach:send',
        'offer:view:company', 'offer:create', 'offer:update', 'offer:delete',
        'report:view:company', 'report:create', 'report:export',
        'settings:view', 'settings:update'
      ].map(name => ({
        roleId: roleMap['admin'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: adminPermissions });

      // マネージャーロールの権限
      const managerPermissions = [
        'user:view:company', 'user:create', 'user:update:company',
        'engineer:view:company', 'engineer:create', 'engineer:update:company',
        'skillsheet:view:company', 'skillsheet:update:company',
        'project:view:company', 'project:create', 'project:update:company', 'project:assign',
        'partner:view:company', 'partner:create', 'partner:update:company',
        'approach:view:company', 'approach:create', 'approach:update', 'approach:send',
        'offer:view:company', 'offer:create', 'offer:update',
        'report:view:company', 'report:create', 'report:export'
      ].map(name => ({
        roleId: roleMap['manager'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: managerPermissions });

      // 営業ロールの権限
      const salesPermissions = [
        'engineer:view:company',
        'skillsheet:view:company',
        'project:view:company',
        'partner:view:company', 'partner:create', 'partner:update:company',
        'approach:view:company', 'approach:create', 'approach:update', 'approach:send',
        'offer:view:company', 'offer:create', 'offer:update',
        'report:view:company'
      ].map(name => ({
        roleId: roleMap['sales'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: salesPermissions });

      // エンジニアロールの権限
      const engineerPermissions = [
        'user:view:own', 'user:update:own',
        'skillsheet:view:own', 'skillsheet:update:own',
        'project:view:assigned'
      ].map(name => ({
        roleId: roleMap['engineer'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: engineerPermissions });

      // 取引先管理者ロールの権限
      const clientAdminPermissions = [
        'user:view:own', 'user:update:own',
        'engineer:view:allowed',
        'skillsheet:view:allowed',
        'offer:view:company', 'offer:respond',
        'company:view:own'
      ].map(name => ({
        roleId: roleMap['client_admin'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: clientAdminPermissions });

      // 取引先営業ロールの権限
      const clientSalesPermissions = [
        'user:view:own', 'user:update:own',
        'engineer:view:allowed',
        'skillsheet:view:allowed',
        'offer:view:company', 'offer:respond'
      ].map(name => ({
        roleId: roleMap['client_sales'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: clientSalesPermissions });

      // 取引先PMロールの権限
      const clientPmPermissions = [
        'user:view:own', 'user:update:own',
        'engineer:view:allowed',
        'skillsheet:view:allowed'
      ].map(name => ({
        roleId: roleMap['client_pm'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: clientPmPermissions });

      // フリーランスロールの権限
      const freelancerPermissions = [
        'user:view:own', 'user:update:own',
        'skillsheet:view:own', 'skillsheet:create', 'skillsheet:update:own',
        'project:view:assigned',
        'offer:view:company', 'offer:respond'
      ].map(name => ({
        roleId: roleMap['freelancer'],
        permissionId: permissionMap[name]
      }));
      await tx.rolePermission.createMany({ data: freelancerPermissions });

      // 5. デモ用の管理者ユーザーを作成（オプション）
      const createDemoAdmin = process.env.CREATE_DEMO_ADMIN === 'true';
      if (createDemoAdmin) {
        console.log('👤 デモ用管理者ユーザーを作成しています...');
        
        // デモSES企業を作成
        const demoCompany = await tx.company.create({
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
        const adminUser = await tx.user.create({
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
        await tx.userRole.create({
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
    const roleCount = await prisma.role.count();
    const permissionCount = await prisma.permission.count();
    const rolePermissionCount = await prisma.rolePermission.count();

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
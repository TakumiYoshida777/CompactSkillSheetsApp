/**
 * 本番環境用初期データ投入スクリプト
 * 使用方法: npx ts-node scripts/seed-production.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { logger } from '../src/utils/logger';

// 環境変数の読み込み
dotenv.config({ path: '.env.production' });

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting production seed...');

  try {
    // 1. 会社データの作成
    logger.info('Creating companies...');
    const sesCompany = await prisma.company.upsert({
      where: { id: 1n },
      update: {},
      create: {
        id: 1n,
        name: 'メインSES株式会社',
        nameKana: 'メインエスイーエスカブシキガイシャ',
        address: '東京都千代田区大手町1-1-1',
        phone: '03-1234-5678',
        email: 'info@main-ses.co.jp',
        website: 'https://www.main-ses.co.jp',
        isActive: true
      }
    });

    // 2. super_adminユーザーの作成
    logger.info('Creating super admin user...');
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeThisImmediately!123';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = await prisma.user.upsert({
      where: { email: 'super-admin@main-ses.co.jp' },
      update: {},
      create: {
        email: 'super-admin@main-ses.co.jp',
        name: 'スーパー管理者',
        passwordHash: hashedPassword,
        companyId: 1n,
        isActive: true
      }
    });

    // 3. super_adminロールの割り当て
    logger.info('Assigning super_admin role...');
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'super_admin' }
    });

    if (!superAdminRole) {
      throw new Error('super_admin role not found. Please run migrations first.');
    }

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: superAdmin.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
        grantedBy: superAdmin.id
      }
    });

    // 4. 初期管理者ユーザーの作成
    logger.info('Creating initial admin users...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisPassword!456';
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin1 = await prisma.user.upsert({
      where: { email: 'admin@main-ses.co.jp' },
      update: {},
      create: {
        email: 'admin@main-ses.co.jp',
        name: '管理者',
        passwordHash: adminHashedPassword,
        companyId: 1n,
        isActive: true
      }
    });

    // 5. adminロールの割り当て
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    });

    if (adminRole) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: admin1.id,
            roleId: adminRole.id
          }
        },
        update: {},
        create: {
          userId: admin1.id,
          roleId: adminRole.id,
          grantedBy: superAdmin.id
        }
      });
    }

    // 6. システム設定の初期化（必要に応じて）
    logger.info('Initializing system settings...');
    // ここにシステム設定の初期化コードを追加

    // 7. データ検証
    logger.info('Verifying seeded data...');
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const permissionCount = await prisma.permission.count();

    logger.info(`Seed completed successfully:
      - Users: ${userCount}
      - Roles: ${roleCount}
      - Permissions: ${permissionCount}
    `);

    // 重要な注意事項を表示
    console.log(`
    ========================================
    🔴 重要: セキュリティ設定
    ========================================
    
    1. 以下のデフォルトパスワードを必ず変更してください:
       - super-admin@main-ses.co.jp
       - admin@main-ses.co.jp
    
    2. 環境変数を確認してください:
       - JWT_SECRET が設定されていること
       - JWT_REFRESH_SECRET が設定されていること
       - 両方が強力なランダム文字列であること
    
    3. ファイアウォール設定を確認してください
    
    4. HTTPSが有効になっていることを確認してください
    
    ========================================
    `);

  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
main()
  .catch((e) => {
    console.error('Fatal error during seeding:', e);
    process.exit(1);
  });
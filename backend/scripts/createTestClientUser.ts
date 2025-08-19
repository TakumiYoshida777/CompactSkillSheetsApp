import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestClientUser() {
  try {
    // 既存のSES企業を取得（または作成）
    let company = await prisma.company.findFirst({
      where: { companyType: 'SES' }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'テストSES株式会社',
          companyType: 'SES',
          emailDomain: 'test-ses.co.jp',
          maxEngineers: 100,
          isActive: true
        }
      });
      console.log('Created test SES company');
    }

    // 取引先企業（クライアント会社）を作成（または既存を取得）
    let clientCompany = await prisma.company.findFirst({
      where: { 
        companyType: 'CLIENT',
        name: 'テスト取引先株式会社'
      }
    });

    if (!clientCompany) {
      clientCompany = await prisma.company.create({
        data: {
          name: 'テスト取引先株式会社',
          companyType: 'CLIENT',
          emailDomain: 'test-client.co.jp',
          maxEngineers: 0,
          isActive: true
        }
      });
      console.log('Created test client company');
    }

    // 取引先関係を作成（または既存を取得）
    let businessPartner = await prisma.businessPartner.findFirst({
      where: { 
        sesCompanyId: company.id,
        clientCompanyId: clientCompany.id
      }
    });

    if (!businessPartner) {
      businessPartner = await prisma.businessPartner.create({
        data: {
          sesCompanyId: company.id,
          clientCompanyId: clientCompany.id,
          accessUrl: `http://localhost:3000/client/${Date.now()}`,
          urlToken: `token_${Date.now()}`,
          isActive: true,
          createdBy: BigInt(1) // システム管理者
        }
      });
      console.log('Created test business partner');
    }

    // 取引先企業ユーザーを作成
    const passwordHash = await bcrypt.hash('TestClient123', 10);
    
    // 既存ユーザーチェック
    const existingUser = await prisma.clientUser.findUnique({
      where: { email: 'test-client@example.com' }
    });

    if (existingUser) {
      console.log('Client user already exists');
      await prisma.clientUser.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          isActive: true,
          failedLoginCount: 0,
          accountLockedUntil: null
        }
      });
      console.log('Updated existing client user password');
    } else {
      const clientUser = await prisma.clientUser.create({
        data: {
          businessPartnerId: businessPartner.id,
          email: 'test-client@example.com',
          passwordHash,
          name: '取引先太郎',
          department: '購買部',
          position: '課長',
          phone: '090-1234-5678',
          isActive: true,
          lastLoginAt: null,
          failedLoginCount: 0
        }
      });
      console.log('Created test client user');

      // ロールを作成
      await prisma.clientUserRole.create({
        data: {
          clientUserId: clientUser.id,
          role: 'client_user',
          grantedBy: BigInt(1) // システム管理者
        }
      });
      console.log('Created client user role');

      // アクセス権限を設定（待機中エンジニアのみ閲覧可能）
      await prisma.clientAccessPermission.create({
        data: {
          clientUserId: clientUser.id,
          permissionType: 'WAITING_ONLY',
          grantedBy: BigInt(1), // システム管理者
          grantedAt: new Date()
        }
      });
      console.log('Created access permission');
    }

    // テスト用エンジニアデータを作成
    const engineer = await prisma.engineer.findFirst();
    
    if (!engineer) {
      const newEngineer = await prisma.engineer.create({
        data: {
          companyId: company.id,
          name: '山田太郎',
          nameKana: 'ヤマダタロウ',
          email: 'yamada@test-ses.co.jp',
          phone: '090-9999-8888',
          birthDate: new Date('1990-01-01'),
          gender: 'MALE',
          nearestStation: '東京駅',
          engineerType: 'SES',
          currentStatus: 'WAITING',
          availableDate: new Date(),
          isPublic: true
        }
      });
      console.log('Created test engineer');

      // スキルシートを作成
      await prisma.skillSheet.create({
        data: {
          engineerId: newEngineer.id,
          summary: 'フルスタックエンジニアとして5年の経験があります',
          technicalSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
          businessSkills: ['要件定義', '基本設計', '詳細設計'],
          qualifications: ['基本情報技術者'],
          selfPR: 'Web開発のスペシャリストとして、フロントエンドからバックエンドまで幅広く対応可能です。',
          isPublic: true
        }
      });
      console.log('Created test skill sheet');
    }

    console.log('\n=================================');
    console.log('テスト用取引先企業ユーザーを作成しました');
    console.log('=================================');
    console.log('メールアドレス: test-client@example.com');
    console.log('パスワード: TestClient123');
    console.log('=================================\n');

  } catch (error) {
    console.error('Error creating test client user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestClientUser();
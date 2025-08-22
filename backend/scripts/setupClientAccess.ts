import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function setupClientAccess() {
  try {
    // SES企業とクライアント企業を取得
    const sesCompany = await prisma.company.findFirst({
      where: { companyType: 'SES' }
    });

    const clientCompany = await prisma.company.findFirst({
      where: { 
        name: '株式会社ABCコーポレーション'
      }
    });

    if (!sesCompany || !clientCompany) {
      console.error('必要な企業が見つかりません');
      return;
    }

    console.log('SES企業:', sesCompany.name);
    console.log('クライアント企業:', clientCompany.name);

    // ビジネスパートナーを作成
    const businessPartner = await prisma.businessPartner.create({
      data: {
        sesCompanyId: sesCompany.id,
        clientCompanyId: clientCompany.id,
        accessUrl: `http://localhost:3001/client/access/${crypto.randomBytes(16).toString('hex')}`,
        urlToken: crypto.randomBytes(32).toString('hex'),
        isActive: true,
        createdBy: BigInt(1) // 管理者ユーザーID
      }
    });

    console.log('ビジネスパートナー作成:', businessPartner.id);

    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash('Admin123!', 10);

    // クライアントユーザーを作成
    const clientUser = await prisma.clientUser.create({
      data: {
        businessPartnerId: businessPartner.id,
        email: 'admin@example-client.local',
        passwordHash: passwordHash,
        name: 'クライアント管理者',
        department: 'システム部',
        position: '部長',
        isActive: true
      }
    });

    console.log('クライアントユーザー作成:', clientUser.email);

    // ロールを作成（存在しない場合）
    let clientAdminRole = await prisma.role.findFirst({
      where: { name: 'CLIENT_ADMIN' }
    });

    if (!clientAdminRole) {
      clientAdminRole = await prisma.role.create({
        data: {
          name: 'CLIENT_ADMIN',
          displayName: 'クライアント管理者',
          description: 'クライアント企業の管理者ロール'
        }
      });
      console.log('ロール作成:', clientAdminRole.name);
    }

    // クライアントユーザーにロールを割り当て
    await prisma.clientUserRole.create({
      data: {
        clientUserId: clientUser.id,
        roleId: clientAdminRole.id,
        grantedBy: BigInt(1) // 管理者ユーザーID
      }
    });

    console.log('ロール割り当て完了');

    // アクセス権限を設定（全エンジニア閲覧可能）
    const engineers = await prisma.engineer.findMany({
      where: {
        companyId: sesCompany.id,
        isActive: true
      }
    });

    for (const engineer of engineers) {
      await prisma.clientAccessPermission.create({
        data: {
          businessPartnerId: businessPartner.id,
          engineerId: engineer.id,
          permissionType: 'FULL_ACCESS',
          isActive: true,
          createdBy: BigInt(1)
        }
      });
    }

    console.log(`${engineers.length}人のエンジニアへのアクセス権限を設定しました`);

    console.log('\n=================================');
    console.log('クライアントユーザーのセットアップ完了');
    console.log('=================================');
    console.log('メールアドレス: admin@example-client.local');
    console.log('パスワード: Admin123!');
    console.log('=================================');

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupClientAccess();
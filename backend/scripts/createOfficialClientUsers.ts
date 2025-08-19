import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createOfficialClientUsers() {
  try {
    // 既存のSES企業を取得（または作成）
    let sesCompany = await prisma.company.findFirst({
      where: { 
        companyType: 'SES',
        name: '株式会社テストSES'
      }
    });

    if (!sesCompany) {
      sesCompany = await prisma.company.create({
        data: {
          name: '株式会社テストSES',
          companyType: 'SES',
          emailDomain: 'test-ses.com',
          maxEngineers: 100,
          isActive: true
        }
      });
      console.log('Created SES company: 株式会社テストSES');
    }

    // パスワードハッシュを生成
    const passwordHash = await bcrypt.hash('Admin123!', 10);

    // 1. 株式会社クライアントAを作成
    let clientCompanyA = await prisma.company.findFirst({
      where: { 
        companyType: 'CLIENT',
        name: '株式会社クライアントA'
      }
    });

    if (!clientCompanyA) {
      clientCompanyA = await prisma.company.create({
        data: {
          name: '株式会社クライアントA',
          companyType: 'CLIENT',
          emailDomain: 'client-a.co.jp',
          maxEngineers: 0,
          isActive: true
        }
      });
      console.log('Created client company: 株式会社クライアントA');
    }

    // 取引先関係Aを作成
    let businessPartnerA = await prisma.businessPartner.findFirst({
      where: { 
        sesCompanyId: sesCompany.id,
        clientCompanyId: clientCompanyA.id
      }
    });

    if (!businessPartnerA) {
      businessPartnerA = await prisma.businessPartner.create({
        data: {
          sesCompanyId: sesCompany.id,
          clientCompanyId: clientCompanyA.id,
          accessUrl: `http://localhost:3000/client/partner-a`,
          urlToken: `token_client_a_${Date.now()}`,
          isActive: true,
          createdBy: BigInt(1)
        }
      });
      console.log('Created business partner relation for クライアントA');

      // アクセス権限を設定（全エンジニア閲覧可能）
      await prisma.clientAccessPermission.create({
        data: {
          businessPartnerId: businessPartnerA.id,
          permissionType: 'FULL_ACCESS',
          createdBy: BigInt(1),
          isActive: true
        }
      });
      console.log('Created FULL_ACCESS permission for クライアントA');
    }

    // クライアントA管理者ユーザーを作成
    const existingAdminA = await prisma.clientUser.findUnique({
      where: { email: 'admin@client-a.co.jp' }
    });

    if (existingAdminA) {
      await prisma.clientUser.update({
        where: { id: existingAdminA.id },
        data: {
          passwordHash,
          isActive: true,
          failedLoginCount: 0,
          accountLockedUntil: null
        }
      });
      console.log('Updated existing admin@client-a.co.jp');
    } else {
      const adminA = await prisma.clientUser.create({
        data: {
          businessPartnerId: businessPartnerA.id,
          email: 'admin@client-a.co.jp',
          passwordHash,
          name: 'クライアントA管理者',
          department: '管理部',
          position: '部長',
          phone: '03-1111-1111',
          isActive: true,
          failedLoginCount: 0
        }
      });
      
      // client_adminロールを取得または作成
      let adminRole = await prisma.role.findFirst({
        where: { name: 'client_admin' }
      });
      
      if (!adminRole) {
        adminRole = await prisma.role.create({
          data: {
            name: 'client_admin',
            displayName: '取引先管理者',
            description: '取引先企業管理者ロール'
          }
        });
      }
      
      await prisma.clientUserRole.create({
        data: {
          clientUserId: adminA.id,
          roleId: adminRole.id,
          grantedBy: BigInt(1)
        }
      });
      console.log('Created admin@client-a.co.jp');
    }

    // 2. 株式会社クライアントBを作成
    let clientCompanyB = await prisma.company.findFirst({
      where: { 
        companyType: 'CLIENT',
        name: '株式会社クライアントB'
      }
    });

    if (!clientCompanyB) {
      clientCompanyB = await prisma.company.create({
        data: {
          name: '株式会社クライアントB',
          companyType: 'CLIENT',
          emailDomain: 'client-b.co.jp',
          maxEngineers: 0,
          isActive: true
        }
      });
      console.log('Created client company: 株式会社クライアントB');
    }

    // 取引先関係Bを作成
    let businessPartnerB = await prisma.businessPartner.findFirst({
      where: { 
        sesCompanyId: sesCompany.id,
        clientCompanyId: clientCompanyB.id
      }
    });

    if (!businessPartnerB) {
      businessPartnerB = await prisma.businessPartner.create({
        data: {
          sesCompanyId: sesCompany.id,
          clientCompanyId: clientCompanyB.id,
          accessUrl: `http://localhost:3000/client/partner-b`,
          urlToken: `token_client_b_${Date.now()}`,
          isActive: true,
          createdBy: BigInt(1)
        }
      });
      console.log('Created business partner relation for クライアントB');

      // アクセス権限を設定（待機中エンジニアのみ）
      await prisma.clientAccessPermission.create({
        data: {
          businessPartnerId: businessPartnerB.id,
          permissionType: 'WAITING_ONLY',
          createdBy: BigInt(1),
          isActive: true
        }
      });
      console.log('Created WAITING_ONLY permission for クライアントB');
    }

    // クライアントB一般ユーザーを作成
    const existingUserB = await prisma.clientUser.findUnique({
      where: { email: 'user@client-b.co.jp' }
    });

    if (existingUserB) {
      await prisma.clientUser.update({
        where: { id: existingUserB.id },
        data: {
          passwordHash,
          isActive: true,
          failedLoginCount: 0,
          accountLockedUntil: null
        }
      });
      console.log('Updated existing user@client-b.co.jp');
    } else {
      const userB = await prisma.clientUser.create({
        data: {
          businessPartnerId: businessPartnerB.id,
          email: 'user@client-b.co.jp',
          passwordHash,
          name: 'クライアントB担当者',
          department: '購買部',
          position: '担当',
          phone: '03-2222-2222',
          isActive: true,
          failedLoginCount: 0
        }
      });
      
      // client_userロールを取得または作成
      let userRole = await prisma.role.findFirst({
        where: { name: 'client_user' }
      });
      
      if (!userRole) {
        userRole = await prisma.role.create({
          data: {
            name: 'client_user',
            displayName: '取引先ユーザー',
            description: '取引先企業一般ユーザーロール'
          }
        });
      }
      
      await prisma.clientUserRole.create({
        data: {
          clientUserId: userB.id,
          roleId: userRole.id,
          grantedBy: BigInt(1)
        }
      });
      console.log('Created user@client-b.co.jp');
    }

    console.log('\n=====================================');
    console.log('公式取引先企業アカウントを作成しました');
    console.log('=====================================');
    console.log('\n【株式会社クライアントA】');
    console.log('メール: admin@client-a.co.jp');
    console.log('パスワード: Admin123!');
    console.log('権限: 取引先管理者（全エンジニア閲覧可能）');
    console.log('\n【株式会社クライアントB】');
    console.log('メール: user@client-b.co.jp');
    console.log('パスワード: Admin123!');
    console.log('権限: 取引先ユーザー（待機中エンジニアのみ閲覧可能）');
    console.log('=====================================\n');

  } catch (error) {
    console.error('Error creating official client users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOfficialClientUsers();
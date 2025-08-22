import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createClientUser() {
  try {
    // パスワードをハッシュ化
    const passwordHash = await bcrypt.hash('Admin123!', 10);

    // 既存のビジネスパートナーを確認
    const businessPartner = await prisma.businessPartner.findFirst({
      where: {
        clientCompany: {
          name: '株式会社ABCコーポレーション'
        }
      }
    });

    if (!businessPartner) {
      console.error('ビジネスパートナーが見つかりません');
      return;
    }

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

    console.log('クライアントユーザーを作成しました:', clientUser);

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createClientUser();
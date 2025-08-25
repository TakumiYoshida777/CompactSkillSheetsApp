import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEngineers() {
  try {
    // 1. adminユーザーの情報を確認
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@demo-ses.example.com' },
      include: { company: true }
    });
    console.log('=== Admin User Info ===');
    console.log('User ID:', adminUser?.id);
    console.log('Company ID:', adminUser?.companyId);
    console.log('Company Name:', adminUser?.company?.name);
    console.log('');

    // 2. 全エンジニアの数を確認
    const totalEngineers = await prisma.engineer.count();
    console.log('=== Total Engineers ===');
    console.log('Total count:', totalEngineers);
    console.log('');

    // 3. 各企業ごとのエンジニア数を確認
    const companiesWithEngineers = await prisma.company.findMany({
      include: {
        _count: {
          select: { engineers: true }
        }
      }
    });
    console.log('=== Engineers per Company ===');
    companiesWithEngineers.forEach(company => {
      console.log(`${company.name} (ID: ${company.id}): ${company._count.engineers} engineers`);
    });
    console.log('');

    // 4. Company ID 1のエンジニアを取得
    const engineersForCompany1 = await prisma.engineer.findMany({
      where: { companyId: 1 },
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true
      }
    });
    console.log('=== Engineers for Company ID 1 ===');
    console.log('Count:', engineersForCompany1.length);
    if (engineersForCompany1.length > 0) {
      engineersForCompany1.forEach(eng => {
        console.log(`- ${eng.name} (ID: ${eng.id}, Email: ${eng.email})`);
      });
    } else {
      console.log('No engineers found for Company ID 1');
    }
    console.log('');

    // 5. 全エンジニアのcompanyIdを確認
    const allEngineers = await prisma.engineer.findMany({
      select: {
        id: true,
        name: true,
        companyId: true,
        company: {
          select: {
            name: true
          }
        }
      },
      take: 10
    });
    console.log('=== Sample Engineers with Company ===');
    allEngineers.forEach(eng => {
      console.log(`- ${eng.name} (ID: ${eng.id}) => Company ID: ${eng.companyId}, Company: ${eng.company?.name || 'NULL'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEngineers();
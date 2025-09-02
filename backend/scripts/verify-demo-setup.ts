import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDemoSetup() {
  try {
    // 1. Check demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'admin@demo-ses.example.com' },
      include: { company: true }
    });
    
    console.log('=== Demo User Setup ===');
    console.log('User:', demoUser?.email);
    console.log('Company ID:', demoUser?.companyId);
    console.log('Company Name:', demoUser?.company?.name);
    console.log('');

    if (demoUser?.companyId) {
      // 2. Check engineers for this company
      const engineers = await prisma.engineer.findMany({
        where: { companyId: demoUser.companyId },
        select: {
          id: true,
          name: true,
          email: true,
          currentStatus: true,
          engineerType: true
        }
      });

      console.log('=== Engineers for Demo User\'s Company ===');
      console.log(`Total: ${engineers.length} engineers`);
      engineers.forEach(eng => {
        console.log(`- ${eng.name} (${eng.email}) - Status: ${eng.currentStatus}, Type: ${eng.engineerType}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDemoSetup();
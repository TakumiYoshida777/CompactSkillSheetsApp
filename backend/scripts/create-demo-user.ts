import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@demo-ses.example.com' }
    });

    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Get the first SES company
    const sesCompany = await prisma.company.findFirst({
      where: {
        companyType: 'SES'
      }
    });

    if (!sesCompany) {
      console.log('No SES company found');
      return;
    }

    // Create demo user with the SES company ID
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = await prisma.user.create({
      data: {
        email: 'admin@demo-ses.example.com',
        passwordHash: hashedPassword,
        name: 'デモ管理者',
        companyId: sesCompany.id,
        isActive: true
      }
    });

    console.log('✅ Demo user created:', demoUser.email);
    console.log('📝 Login credentials: admin@demo-ses.example.com / password123');
    console.log('🏢 Company ID:', demoUser.companyId);

  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
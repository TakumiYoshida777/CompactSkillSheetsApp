import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignDemoPermissions() {
  try {
    // 1. Find demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'admin@demo-ses.example.com' }
    });

    if (!demoUser) {
      console.log('Demo user not found');
      return;
    }

    console.log('Demo user found:', demoUser.id);
    
    // Get user roles
    const userRoles = await prisma.userRole.findMany({
      where: { userId: demoUser.id },
      include: { role: true }
    });
    console.log('Current roles:', userRoles.map(ur => ur.role.name));

    // 2. Check or create admin role
    let adminRole = await prisma.role.findFirst({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.log('Creating admin role...');
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          displayName: '管理者',
          description: 'システム管理者'
        }
      });
    }

    // 3. Check or create engineer permissions
    const permissions = [
      { name: 'engineer:view:company', displayName: 'エンジニア閲覧（自社）', resource: 'engineer', action: 'view', scope: 'company' },
      { name: 'engineer:create', displayName: 'エンジニア作成', resource: 'engineer', action: 'create' },
      { name: 'engineer:update:company', displayName: 'エンジニア更新（自社）', resource: 'engineer', action: 'update', scope: 'company' },
      { name: 'engineer:delete', displayName: 'エンジニア削除', resource: 'engineer', action: 'delete' },
      { name: 'skillsheet:view:company', displayName: 'スキルシート閲覧（自社）', resource: 'skillsheet', action: 'view', scope: 'company' },
      { name: 'skillsheet:update:company', displayName: 'スキルシート更新（自社）', resource: 'skillsheet', action: 'update', scope: 'company' },
      { name: 'skillsheet:export', displayName: 'スキルシートエクスポート', resource: 'skillsheet', action: 'export' },
      { name: 'engineer:export', displayName: 'エンジニアエクスポート', resource: 'engineer', action: 'export' }
    ];

    for (const perm of permissions) {
      let permission = await prisma.permission.findFirst({
        where: { name: perm.name }
      });

      if (!permission) {
        permission = await prisma.permission.create({
          data: perm
        });
        console.log('Created permission:', perm.name);
      }

      // Connect permission to admin role
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id
          }
        },
        create: {
          roleId: adminRole.id,
          permissionId: permission.id
        },
        update: {}
      });
    }

    // 4. Assign admin role to demo user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: demoUser.id,
          roleId: adminRole.id
        }
      },
      create: {
        userId: demoUser.id,
        roleId: adminRole.id,
        grantedBy: demoUser.id
      },
      update: {}
    });

    console.log('✅ Admin role assigned to demo user');

    // 5. Verify permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: adminRole.id },
      include: {
        permission: true
      }
    });

    console.log('\n=== Demo User Permissions ===');
    console.log(`User: ${demoUser.email}`);
    console.log(`Role: ${adminRole.name}`);
    console.log('Permissions:');
    rolePermissions.forEach(rp => {
      console.log(`  - ${rp.permission.name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignDemoPermissions();
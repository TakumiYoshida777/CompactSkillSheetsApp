import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showEngineerDBInfo() {
  try {
    console.log('========================================');
    console.log('   エンジニアDB情報レポート');
    console.log('========================================\n');

    // 1. エンジニアテーブルの基本情報
    const totalEngineers = await prisma.engineer.count();
    console.log('【エンジニアテーブル基本情報】');
    console.log(`総レコード数: ${totalEngineers}件\n`);

    // 2. 企業別エンジニア数
    const companiesWithEngineers = await prisma.company.findMany({
      include: {
        _count: {
          select: { engineers: true }
        }
      }
    });
    
    console.log('【企業別エンジニア数】');
    companiesWithEngineers.forEach(company => {
      console.log(`- ${company.name} (ID: ${company.id}): ${company._count.engineers}名`);
    });
    console.log('');

    // 3. エンジニア詳細データ
    const engineers = await prisma.engineer.findMany({
      include: {
        company: true,
        user: true,
        skillSheet: true,
        engineerProjects: {
          include: {
            project: true
          }
        },
        engineerSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    console.log('【エンジニア詳細情報】');
    console.log('====================================');
    
    engineers.forEach((eng, index) => {
      console.log(`\n--- エンジニア ${index + 1} ---`);
      console.log(`ID: ${eng.id}`);
      console.log(`氏名: ${eng.name}`);
      console.log(`氏名（姓名）: ${eng.lastName} ${eng.firstName}`);
      console.log(`カナ: ${eng.nameKana || `${eng.lastNameKana || ''} ${eng.firstNameKana || ''}`}`);
      console.log(`メール: ${eng.email}`);
      console.log(`電話: ${eng.phone || '未設定'}`);
      console.log(`生年月日: ${eng.birthDate || '未設定'}`);
      console.log(`性別: ${eng.gender || '未設定'}`);
      console.log(`最寄駅: ${eng.nearestStation || '未設定'}`);
      console.log(`GitHub: ${eng.githubUrl || '未設定'}`);
      console.log(`エンジニアタイプ: ${eng.engineerType}`);
      console.log(`現在のステータス: ${eng.currentStatus}`);
      console.log(`稼働可能日: ${eng.availableDate || '即日'}`);
      console.log(`稼働可能性: ${eng.availability || '未設定'}`);
      console.log(`公開設定: ${eng.isPublic ? '公開' : '非公開'}`);
      console.log(`アクティブ: ${eng.isActive ? 'はい' : 'いいえ'}`);
      console.log(`所属企業: ${eng.company?.name || '未設定'} (ID: ${eng.companyId})`);
      console.log(`ユーザーID: ${eng.userId || '未設定'}`);
      console.log(`従業員番号: ${eng.employeeNumber || '未設定'}`);
      
      if (eng.currentProject) {
        console.log(`現在のプロジェクト: ${JSON.stringify(eng.currentProject, null, 2)}`);
      }
      
      if (eng.skillSheet) {
        console.log('\n【スキルシート情報】');
        console.log(`  総経験年数: ${eng.skillSheet.totalExperienceYears || 0}年`);
        console.log(`  サマリー: ${eng.skillSheet.summary || '未設定'}`);
        console.log(`  完成度: ${eng.skillSheet.isCompleted ? '完成' : '未完成'}`);
        
        if (eng.skillSheet.programmingLanguages) {
          console.log(`  プログラミング言語: ${JSON.stringify(eng.skillSheet.programmingLanguages)}`);
        }
        if (eng.skillSheet.frameworks) {
          console.log(`  フレームワーク: ${JSON.stringify(eng.skillSheet.frameworks)}`);
        }
        if (eng.skillSheet.databases) {
          console.log(`  データベース: ${JSON.stringify(eng.skillSheet.databases)}`);
        }
        if (eng.skillSheet.cloudServices) {
          console.log(`  クラウドサービス: ${JSON.stringify(eng.skillSheet.cloudServices)}`);
        }
        if (eng.skillSheet.tools) {
          console.log(`  ツール: ${JSON.stringify(eng.skillSheet.tools)}`);
        }
        if (eng.skillSheet.certifications) {
          console.log(`  資格: ${JSON.stringify(eng.skillSheet.certifications)}`);
        }
      }
      
      if (eng.engineerSkills && eng.engineerSkills.length > 0) {
        console.log('\n【スキル情報】');
        eng.engineerSkills.forEach(es => {
          console.log(`  - ${es.skill.name} (レベル: ${es.level}/5, 経験: ${es.years || 0}年)`);
        });
      }
      
      if (eng.engineerProjects && eng.engineerProjects.length > 0) {
        console.log('\n【プロジェクト履歴】');
        eng.engineerProjects.forEach(ep => {
          console.log(`  - ${ep.project.name} (${ep.startDate} ~ ${ep.endDate || '現在'})`);
          if (ep.role) console.log(`    役割: ${ep.role}`);
          if (ep.responsibilities) console.log(`    担当: ${ep.responsibilities}`);
        });
      }
      
      console.log(`作成日時: ${eng.createdAt}`);
      console.log(`更新日時: ${eng.updatedAt}`);
    });

    // 4. エンジニアステータスの分布
    console.log('\n【エンジニアステータス分布】');
    const statusCount = await prisma.engineer.groupBy({
      by: ['currentStatus'],
      _count: true
    });
    
    statusCount.forEach(s => {
      console.log(`- ${s.currentStatus}: ${s._count}名`);
    });

    // 5. エンジニアタイプの分布
    console.log('\n【エンジニアタイプ分布】');
    const typeCount = await prisma.engineer.groupBy({
      by: ['engineerType'],
      _count: true
    });
    
    typeCount.forEach(t => {
      console.log(`- ${t.engineerType}: ${t._count}名`);
    });

    // 6. テーブル構造情報
    console.log('\n【エンジニアテーブル構造】');
    console.log('カラム名とデータ型:');
    console.log(`- id: BigInt (PK, AutoIncrement)`);
    console.log(`- userId: BigInt (FK -> users.id, Unique, Nullable)`);
    console.log(`- companyId: BigInt (FK -> companies.id, Nullable)`);
    console.log(`- employeeNumber: VarChar(50) (Nullable)`);
    console.log(`- name: VarChar(100) (Required)`);
    console.log(`- nameKana: VarChar(100) (Nullable)`);
    console.log(`- email: VarChar(255) (Required)`);
    console.log(`- phone: VarChar(20) (Nullable)`);
    console.log(`- birthDate: Date (Nullable)`);
    console.log(`- gender: Enum (Nullable)`);
    console.log(`- nearestStation: VarChar(100) (Nullable)`);
    console.log(`- githubUrl: VarChar(500) (Nullable)`);
    console.log(`- engineerType: Enum (Required)`);
    console.log(`- currentStatus: Enum (Default: WORKING)`);
    console.log(`- availableDate: Date (Nullable)`);
    console.log(`- isPublic: Boolean (Default: true)`);
    console.log(`- lastName: VarChar(50) (Nullable)`);
    console.log(`- firstName: VarChar(50) (Nullable)`);
    console.log(`- lastNameKana: VarChar(50) (Nullable)`);
    console.log(`- firstNameKana: VarChar(50) (Nullable)`);
    console.log(`- availability: VarChar(50) (Nullable)`);
    console.log(`- currentProject: JSON (Nullable)`);
    console.log(`- isActive: Boolean (Default: true)`);
    console.log(`- createdAt: DateTime (Default: now())`);
    console.log(`- updatedAt: DateTime (Auto-update)`);

    console.log('\n【インデックス】');
    console.log('- companyId');
    console.log('- currentStatus');
    console.log('- engineerType');
    console.log('- isPublic');
    console.log('- availableDate');

    console.log('\n【関連テーブル】');
    console.log('- users (1:1) - ユーザーアカウント');
    console.log('- companies (N:1) - 所属企業');
    console.log('- skill_sheets (1:1) - スキルシート');
    console.log('- freelancers (1:1) - フリーランス情報');
    console.log('- engineer_projects (1:N) - プロジェクト履歴');
    console.log('- engineer_skills (1:N) - スキル情報');
    console.log('- project_assignments (1:N) - プロジェクトアサイン');
    console.log('- その他多数の関連テーブル');

    console.log('\n========================================');
    console.log('   レポート完了');
    console.log('========================================');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showEngineerDBInfo();
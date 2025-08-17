export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  department: string;
}

export interface ApproachHistory {
  id: string;
  date: string;
  type: 'email' | 'phone' | 'meeting' | 'proposal';
  subject: string;
  engineerCount?: number;
  status: 'sent' | 'replied' | 'pending' | 'accepted' | 'rejected';
  note?: string;
}

export interface BusinessPartner {
  id: string;
  name: string;
  contact: ContactPerson;
  industry: string;
  established: string;
  capital: string;
  employees: number;
  website: string;
  status: string;
  lastContact: string;
  nextContact: string;
  tags: string[];
  salesAmount: number;
  notes: string;
  approachCount: number;
  approaches?: ApproachHistory[];
}

export const generateMockData = (): BusinessPartner[] => {
  const industries = ['IT', '製造業', '金融', '小売', '医療', '建設', '運輸', '教育'];
  const names = [
    '株式会社テクノロジーソリューション',
    'グローバル開発株式会社',
    '未来システム株式会社',
    'デジタルイノベーション株式会社',
    '株式会社クラウドテック',
    'スマートビジネス株式会社',
    'エンタープライズシステム株式会社',
    '株式会社AIソリューション',
    'データサイエンス株式会社',
    '株式会社サイバーセキュリティ',
    'モバイルテック株式会社',
    'IoTインテグレーション株式会社',
    '株式会社ブロックチェーン',
    'クラウドインフラ株式会社',
    '株式会社デジタルトランスフォーメーション'
  ];

  const tags = [
    ['Java', 'Spring', 'AWS'],
    ['Python', 'Django', '機械学習'],
    ['React', 'Node.js', 'TypeScript'],
    ['C#', '.NET', 'Azure'],
    ['Go', 'Kubernetes', 'Docker'],
    ['PHP', 'Laravel', 'MySQL'],
    ['Ruby', 'Rails', 'PostgreSQL'],
    ['Swift', 'iOS', 'Firebase'],
    ['Kotlin', 'Android', 'GCP'],
    ['Vue.js', 'Nuxt.js', 'GraphQL']
  ];

  const contacts = [
    { name: '田中太郎', department: '営業部' },
    { name: '佐藤花子', department: '人事部' },
    { name: '鈴木一郎', department: '開発部' },
    { name: '高橋美咲', department: '管理部' },
    { name: '山田健太', department: '営業部' },
    { name: '渡辺真理', department: '人事部' },
    { name: '伊藤隆', department: '開発部' },
    { name: '中村優子', department: '管理部' },
    { name: '小林誠', department: '営業部' },
    { name: '加藤直美', department: '人事部' }
  ];

  const statuses = ['active', 'pending', 'inactive', 'prospect'];

  return names.map((name, index) => {
    const contact = contacts[index % contacts.length];
    const establishedYear = 1990 + Math.floor(Math.random() * 30);
    const capital = Math.floor(Math.random() * 10000) * 100;
    const employees = Math.floor(Math.random() * 1000) + 10;
    const salesAmount = Math.floor(Math.random() * 50000) + 1000;
    const approachCount = Math.floor(Math.random() * 20);

    return {
      id: `BP${String(index + 1).padStart(5, '0')}`,
      name,
      contact: {
        name: contact.name,
        email: `${contact.name.toLowerCase().replace(/[^\w]/g, '')}@example.com`,
        phone: `03-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        department: contact.department
      },
      industry: industries[index % industries.length],
      established: `${establishedYear}年`,
      capital: `${capital.toLocaleString()}万円`,
      employees,
      website: `https://example-${index + 1}.com`,
      status: statuses[index % statuses.length],
      lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP'),
      nextContact: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP'),
      tags: tags[index % tags.length],
      salesAmount,
      notes: `取引先${index + 1}に関する備考`,
      approachCount
    };
  });
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'processing';
    case 'inactive':
      return 'default';
    case 'prospect':
      return 'warning';
    default:
      return 'default';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '取引中';
    case 'pending':
      return '商談中';
    case 'inactive':
      return '休止中';
    case 'prospect':
      return '見込み';
    default:
      return status;
  }
};
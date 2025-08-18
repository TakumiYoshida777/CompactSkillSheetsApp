import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, message } from 'antd';
import { UserAddOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import EngineerSearchTable from '../../components/EngineerSearch/EngineerSearchTable';
import type { Engineer } from '../../components/EngineerSearch/EngineerSearchTable';

const EngineerList: React.FC = () => {
  const navigate = useNavigate();

  // ダミーデータ（SES企業内のエンジニア）
  const mockEngineers: Engineer[] = [
    {
      key: '1',
      engineerId: 'ENG001',
      name: '田中太郎',
      age: 32,
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      experience: 8,
      status: 'available',
      availableDate: '2024/02/01',
      lastUpdated: '2024/01/10',
      email: 'tanaka@example.com',
      phone: '090-1234-5678',
    },
    {
      key: '2',
      engineerId: 'ENG002',
      name: '佐藤花子',
      age: 28,
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      experience: 5,
      status: 'assigned',
      currentProject: 'ECサイトリニューアル',
      projectEndDate: '2024/04/30',
      lastUpdated: '2024/01/08',
      email: 'sato@example.com',
      phone: '090-2345-6789',
    },
    {
      key: '3',
      engineerId: 'ENG003',
      name: '鈴木一郎',
      age: 35,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
      experience: 10,
      status: 'waiting',
      availableDate: '2024/03/01',
      lastUpdated: '2024/01/05',
      email: 'suzuki@example.com',
      phone: '090-3456-7890',
    },
    {
      key: '4',
      engineerId: 'ENG004',
      name: '山田次郎',
      age: 30,
      skills: ['C#', '.NET Core', 'Azure', 'SQL Server'],
      experience: 7,
      status: 'assigned',
      currentProject: '在庫管理システム',
      projectEndDate: '2024/06/30',
      lastUpdated: '2024/01/12',
      email: 'yamada@example.com',
      phone: '090-4567-8901',
    },
    {
      key: '5',
      engineerId: 'ENG005',
      name: '伊藤美咲',
      age: 26,
      skills: ['Vue.js', 'Nuxt.js', 'Firebase', 'GraphQL'],
      experience: 4,
      status: 'available',
      availableDate: '2024/01/20',
      lastUpdated: '2024/01/09',
      email: 'ito@example.com',
      phone: '090-5678-9012',
    },
    {
      key: '6',
      engineerId: 'ENG006',
      name: '高橋健一',
      age: 33,
      skills: ['Go', 'Kubernetes', 'gRPC', 'Redis'],
      experience: 9,
      status: 'waiting_scheduled',
      currentProject: 'マイクロサービス基盤',
      projectEndDate: '2024/03/15',
      availableDate: '2024/03/16',
      lastUpdated: '2024/01/11',
      email: 'takahashi@example.com',
      phone: '090-6789-0123',
    },
  ];

  // エンジニア新規登録
  const handleAddEngineer = () => {
    navigate('/engineers/new');
  };

  // エンジニア詳細表示
  const handleEngineerClick = (engineer: Engineer) => {
    navigate(`/engineers/${engineer.engineerId}`);
  };

  // エンジニア編集
  const handleEditEngineer = (engineerId: string) => {
    navigate(`/engineers/edit/${engineerId}`);
    message.info(`エンジニア ${engineerId} の編集画面へ遷移`);
  };

  // エクスポート処理
  const handleExport = (engineerIds?: string[]) => {
    if (engineerIds && engineerIds.length > 0) {
      message.success(`${engineerIds.length}名のエンジニアデータをエクスポートしました`);
    } else {
      message.success('すべてのエンジニアデータをエクスポートしました');
    }
  };

  // カスタムアクションコンポーネント
  const CustomActions = () => (
    <Space>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        size="large"
        onClick={handleAddEngineer}
      >
        新規登録
      </Button>
      <Button
        icon={<DownloadOutlined />}
        size="large"
        onClick={() => handleExport()}
      >
        エクスポート
      </Button>
    </Space>
  );

  return (
    <div>
      <EngineerSearchTable
        engineers={mockEngineers}
        showActions={false}
        showCompanyColumn={false}
        title="エンジニア一覧"
        description="登録されているエンジニアの管理"
        customActions={<CustomActions />}
        onRowClick={handleEngineerClick}
      />
    </div>
  );
};

export default EngineerList;
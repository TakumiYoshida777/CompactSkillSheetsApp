import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Progress,
  Avatar,
  Dropdown,
  Badge,
  Tooltip,
  Typography,
  Statistic,
} from 'antd';
import {
  ProjectOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  UserOutlined,
  FileTextOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface Project {
  key: string;
  projectId: string;
  name: string;
  client: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  manager: string;
  teamSize: number;
  requiredSkills: string[];
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface AssignedEngineer {
  name: string;
  role: string;
  avatar?: string;
}

const ProjectList: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ダミーデータ
  const projects: Project[] = [
    {
      key: '1',
      projectId: 'PRJ001',
      name: 'ECサイトリニューアル',
      client: 'ABC商事株式会社',
      status: 'active',
      startDate: '2023/06/01',
      endDate: '2024/03/31',
      budget: 50000000,
      progress: 65,
      manager: '山田太郎',
      teamSize: 8,
      requiredSkills: ['React', 'Node.js', 'AWS'],
      description: '既存ECサイトのフルリニューアルプロジェクト',
      priority: 'high',
    },
    {
      key: '2',
      projectId: 'PRJ002',
      name: '在庫管理システム開発',
      client: 'XYZ物流株式会社',
      status: 'active',
      startDate: '2023/10/01',
      endDate: '2024/05/31',
      budget: 30000000,
      progress: 40,
      manager: '佐藤花子',
      teamSize: 5,
      requiredSkills: ['Java', 'Spring Boot', 'PostgreSQL'],
      description: '物流会社向け在庫管理システムの新規開発',
      priority: 'medium',
    },
    {
      key: '3',
      projectId: 'PRJ003',
      name: '社内業務システム改修',
      client: 'DEF製造株式会社',
      status: 'planning',
      startDate: '2024/02/01',
      endDate: '2024/09/30',
      budget: 25000000,
      progress: 0,
      manager: '鈴木一郎',
      teamSize: 6,
      requiredSkills: ['Python', 'Django', 'MySQL'],
      description: '既存業務システムのマイクロサービス化',
      priority: 'high',
    },
    {
      key: '4',
      projectId: 'PRJ004',
      name: 'モバイルアプリ開発',
      client: 'GHI小売株式会社',
      status: 'completed',
      startDate: '2023/01/01',
      endDate: '2023/12/31',
      budget: 40000000,
      progress: 100,
      manager: '田中次郎',
      teamSize: 7,
      requiredSkills: ['React Native', 'Firebase', 'TypeScript'],
      description: '店舗向けモバイルアプリケーション開発',
      priority: 'low',
    },
    {
      key: '5',
      projectId: 'PRJ005',
      name: 'AIチャットボット開発',
      client: 'JKLサービス株式会社',
      status: 'on-hold',
      startDate: '2023/08/01',
      endDate: '2024/02/29',
      budget: 20000000,
      progress: 30,
      manager: '伊藤美咲',
      teamSize: 4,
      requiredSkills: ['Python', 'TensorFlow', 'NLP'],
      description: 'カスタマーサポート用AIチャットボット',
      priority: 'medium',
    },
  ];

  const assignedEngineers: Record<string, AssignedEngineer[]> = {
    '1': [
      { name: '田中太郎', role: 'フロントエンドリード' },
      { name: '佐藤花子', role: 'バックエンドエンジニア' },
      { name: '鈴木一郎', role: 'インフラエンジニア' },
    ],
    '2': [
      { name: '山田次郎', role: 'フルスタックエンジニア' },
      { name: '伊藤美咲', role: 'データベースエンジニア' },
    ],
    '3': [
      { name: '高橋健太', role: 'プロジェクトリーダー' },
    ],
    '4': [
      { name: '中村優子', role: 'モバイルエンジニア' },
      { name: '小林大輔', role: 'QAエンジニア' },
    ],
    '5': [
      { name: '渡辺真一', role: 'AIエンジニア' },
    ],
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'planning':
        return 'blue';
      case 'completed':
        return 'default';
      case 'on-hold':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return '進行中';
      case 'planning':
        return '計画中';
      case 'completed':
        return '完了';
      case 'on-hold':
        return '保留中';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <SyncOutlined spin />;
      case 'planning':
        return <ClockCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'on-hold':
        return <ExclamationCircleOutlined />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const actionMenu: MenuProps['items'] = [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: '詳細表示',
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '編集',
    },
    {
      key: 'assign',
      icon: <UserAddOutlined />,
      label: 'エンジニアアサイン',
    },
    {
      key: 'report',
      icon: <FileTextOutlined />,
      label: 'レポート生成',
    },
    {
      key: 'email',
      icon: <MailOutlined />,
      label: 'メール送信',
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '削除',
      danger: true,
    },
  ];

  const columns: ColumnsType<Project> = [
    {
      title: 'ID',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 100,
      fixed: 'left',
    },
    {
      title: 'プロジェクト名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <ProjectOutlined />
          <Text strong>{text}</Text>
          <Badge count={record.priority} color={getPriorityColor(record.priority)} />
        </Space>
      ),
    },
    {
      title: 'クライアント',
      dataIndex: 'client',
      key: 'client',
      width: 180,
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '進行中', value: 'active' },
        { text: '計画中', value: 'planning' },
        { text: '完了', value: 'completed' },
        { text: '保留中', value: 'on-hold' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: Project['status']) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '進捗',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      sorter: (a, b) => a.progress - b.progress,
      render: (progress) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '期間',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CalendarOutlined /> {record.startDate} 〜
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            　　{record.endDate}
          </Text>
        </Space>
      ),
    },
    {
      title: '予算',
      dataIndex: 'budget',
      key: 'budget',
      width: 150,
      sorter: (a, b) => a.budget - b.budget,
      render: (budget) => (
        <Text strong>¥{(budget / 1000000).toFixed(1)}M</Text>
      ),
    },
    {
      title: 'チーム',
      key: 'team',
      width: 150,
      render: (_, record) => (
        <Space>
          <Avatar.Group maxCount={3} size="small">
            {assignedEngineers[record.key]?.map((engineer, index) => (
              <Tooltip key={index} title={`${engineer.name} (${engineer.role})`}>
                <Avatar icon={<UserOutlined />} />
              </Tooltip>
            ))}
          </Avatar.Group>
          <Text type="secondary">{record.teamSize}名</Text>
        </Space>
      ),
    },
    {
      title: '責任者',
      dataIndex: 'manager',
      key: 'manager',
      width: 120,
    },
    {
      title: '必要スキル',
      dataIndex: 'requiredSkills',
      key: 'requiredSkills',
      width: 250,
      render: (skills: string[]) => (
        <>
          {skills.slice(0, 2).map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
          {skills.length > 2 && <Tag>+{skills.length - 2}</Tag>}
        </>
      ),
    },
    {
      title: 'アクション',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: () => (
        <Dropdown menu={{ items: actionMenu }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">プロジェクト管理</h1>
        <p className="text-gray-600 mt-2">進行中のプロジェクトと要員管理</p>
      </div>

      {/* 統計カード */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="総プロジェクト数"
              value={projects.length}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="進行中"
              value={projects.filter(p => p.status === 'active').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="総予算"
              value={projects.reduce((sum, p) => sum + p.budget, 0) / 1000000}
              precision={1}
              suffix="M円"
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="総要員数"
              value={projects.reduce((sum, p) => sum + p.teamSize, 0)}
              suffix="名"
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 検索・フィルター */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="プロジェクト名、クライアント名で検索"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={setSearchText}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="ステータス"
              style={{ width: '100%' }}
              size="large"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">すべて</Option>
              <Option value="active">進行中</Option>
              <Option value="planning">計画中</Option>
              <Option value="completed">完了</Option>
              <Option value="on-hold">保留中</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker
              placeholder={['開始日', '終了日']}
              style={{ width: '100%' }}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
              >
                新規プロジェクト
              </Button>
              <Tooltip title="詳細フィルター">
                <Button
                  icon={<FilterOutlined />}
                  size="large"
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* テーブル */}
      <Card>
        <div className="mb-4">
          {selectedRowKeys.length > 0 && (
            <Space>
              <span>{selectedRowKeys.length}件選択中</span>
              <Button>一括編集</Button>
              <Button danger>選択項目を削除</Button>
            </Space>
          )}
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={projects}
          scroll={{ x: 1800 }}
          pagination={{
            total: projects.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
          }}
        />
      </Card>
    </div>
  );
};

export default ProjectList;
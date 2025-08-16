import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Dropdown,
  Select,
  DatePicker,
  Row,
  Col,
  Badge,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  FilterOutlined,
  DownloadOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import ResponsiveTable from '../../components/ResponsiveTable';
import useResponsive from '../../hooks/useResponsive';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Engineer {
  key: string;
  engineerId: string;
  name: string;
  age: number;
  skills: string[];
  experience: number;
  status: 'available' | 'assigned' | 'waiting' | 'waiting_scheduled' | 'leave';
  currentProject?: string;
  availableDate?: string;
  projectEndDate?: string; // 案件終了日
  lastUpdated: string;
  email: string;
  phone: string;
}

const EngineerList: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { isMobile } = useResponsive();

  // 待機予定判定ヘルパー関数
  const isWaitingScheduled = (projectEndDate?: string): boolean => {
    if (!projectEndDate) return false;
    const endDate = new Date(projectEndDate);
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    return endDate > today && endDate <= threeMonthsLater;
  };

  // ダミーデータ
  const engineers: Engineer[] = [
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
      projectEndDate: '2024/04/30', // 3ヶ月以内に終了予定
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
      projectEndDate: '2024/06/30', // 3ヶ月以内に終了予定
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
      projectEndDate: '2024/03/15', // 待機予定
      availableDate: '2024/03/16',
      lastUpdated: '2024/01/11',
      email: 'takahashi@example.com',
      phone: '090-6789-0123',
    },
  ];

  const getStatusColor = (status: Engineer['status']) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'assigned':
        return 'blue';
      case 'waiting':
        return 'orange';
      case 'waiting_scheduled':
        return 'gold';
      case 'leave':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Engineer['status']) => {
    switch (status) {
      case 'available':
        return '稼働可能';
      case 'assigned':
        return 'アサイン中';
      case 'waiting':
        return '待機中';
      case 'waiting_scheduled':
        return '待機予定';
      case 'leave':
        return '休職中';
      default:
        return status;
    }
  };

  const actionMenu: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '編集',
    },
    {
      key: 'skillsheet',
      icon: <FileTextOutlined />,
      label: 'スキルシート',
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

  const columns: ColumnsType<Engineer> = [
    {
      title: 'ID',
      dataIndex: 'engineerId',
      key: 'engineerId',
      width: 80,
      fixed: 'left',
    },
    {
      title: '氏名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span className="font-medium">{text}</span>
        </Space>
      ),
    },
    {
      title: '年齢',
      dataIndex: 'age',
      key: 'age',
      width: 70,
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'スキル',
      dataIndex: 'skills',
      key: 'skills',
      width: 300,
      render: (skills: string[]) => (
        <>
          {skills.slice(0, 3).map((skill) => (
            <Tag key={skill} color="blue">
              {skill}
            </Tag>
          ))}
          {skills.length > 3 && (
            <Tag>+{skills.length - 3}</Tag>
          )}
        </>
      ),
    },
    {
      title: '経験年数',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
      sorter: (a, b) => a.experience - b.experience,
      render: (exp) => `${exp}年`,
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: '稼働可能', value: 'available' },
        { text: 'アサイン中', value: 'assigned' },
        { text: '待機中', value: 'waiting' },
        { text: '待機予定', value: 'waiting_scheduled' },
        { text: '休職中', value: 'leave' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: Engineer['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '現在のプロジェクト',
      dataIndex: 'currentProject',
      key: 'currentProject',
      width: 200,
      render: (project, record) => {
        if (!project) return '-';
        return (
          <div>
            <div>{project}</div>
            {record.projectEndDate && (
              <div className="text-xs text-gray-500">
                終了予定: {record.projectEndDate}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '稼働開始可能日',
      dataIndex: 'availableDate',
      key: 'availableDate',
      width: 120,
      render: (date, record) => {
        if (record.status === 'waiting_scheduled' && record.projectEndDate) {
          return (
            <Tooltip title={`プロジェクト終了後: ${record.projectEndDate}`}>
              <Space>
                <CalendarOutlined />
                {date || '未定'}
              </Space>
            </Tooltip>
          );
        }
        return date ? (
          <Space>
            <CalendarOutlined />
            {date}
          </Space>
        ) : '-';
      },
    },
    {
      title: '最終更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      sorter: (a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
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
        <h1 className="text-2xl font-bold text-gray-800">エンジニア一覧</h1>
        <p className="text-gray-600 mt-2">登録されているエンジニアの管理</p>
      </div>

      {/* 検索・フィルター */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="名前、スキルで検索"
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
              <Option value="available">稼働可能</Option>
              <Option value="assigned">アサイン中</Option>
              <Option value="waiting">待機中</Option>
              <Option value="waiting_scheduled">待機予定</Option>
              <Option value="leave">休職中</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker
              placeholder={['稼働開始可能日から', '稼働開始可能日まで']}
              style={{ width: '100%' }}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                size="large"
              >
                新規登録
              </Button>
              <Button
                icon={<DownloadOutlined />}
                size="large"
              >
                エクスポート
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

      {/* 統計情報 */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {engineers.length}
              </div>
              <div className="text-gray-600 text-sm">総エンジニア数</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {engineers.filter(e => e.status === 'available').length}
              </div>
              <div className="text-gray-600 text-sm">稼働可能</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {engineers.filter(e => e.status === 'assigned').length}
              </div>
              <div className="text-gray-600 text-sm">アサイン中</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {engineers.filter(e => e.status === 'waiting').length}
              </div>
              <div className="text-gray-600 text-sm">待機中</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {engineers.filter(e => e.status === 'waiting_scheduled').length}
              </div>
              <div className="text-gray-600 text-sm">待機予定</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {engineers.filter(e => e.status === 'leave').length}
              </div>
              <div className="text-gray-600 text-sm">休職中</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* テーブル */}
      <Card className="overflow-hidden">
        <div className="mb-4">
          {selectedRowKeys.length > 0 && (
            <Space wrap>
              <span>{selectedRowKeys.length}件選択中</span>
              <Button icon={<MailOutlined />}>一括メール送信</Button>
              <Button icon={<DownloadOutlined />}>選択項目をエクスポート</Button>
              <Button danger>選択項目を削除</Button>
            </Space>
          )}
        </div>
        <ResponsiveTable
          rowSelection={!isMobile ? rowSelection : undefined}
          columns={columns}
          dataSource={engineers}
          scroll={{ x: 1500 }}
          pagination={{
            total: engineers.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
          }}
          mobileRenderItem={(engineer) => (
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <div className="font-semibold text-base">{engineer.name}</div>
                    <div className="text-gray-500 text-sm">{engineer.engineerId}</div>
                  </div>
                </Space>
                <Tag color={getStatusColor(engineer.status)}>
                  {getStatusText(engineer.status)}
                </Tag>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {engineer.skills.slice(0, 3).map((skill) => (
                  <Tag key={skill} color="blue" className="text-xs">
                    {skill}
                  </Tag>
                ))}
                {engineer.skills.length > 3 && (
                  <Tag className="text-xs">+{engineer.skills.length - 3}</Tag>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>経験: {engineer.experience}年</div>
                {engineer.availableDate && (
                  <div>稼働開始可能日: {engineer.availableDate}</div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Dropdown menu={{ items: actionMenu }} trigger={['click']}>
                  <Button size="small" icon={<MoreOutlined />} />
                </Dropdown>
              </div>
            </div>
          )}
        />
      </Card>
    </div>
  );
};

export default EngineerList;
import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  DatePicker,
  Row,
  Col,
  Avatar,
  Dropdown,
  Badge,
  Tooltip,
  Typography,
  Statistic,
  Select,
  Modal,
  Form,
  message,
  Tabs,
  Timeline,
  Empty,
  Alert,
  Progress,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  SendOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  ProjectOutlined,
  DownloadOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  ArrowUpOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface WaitingEngineer {
  key: string;
  engineerId: string;
  name: string;
  age: number;
  skills: string[];
  experience: number;
  currentProject?: string;
  projectEndDate?: string;
  availableDate: string;
  status: 'waiting' | 'waiting_soon';
  unitPrice: number;
  contractType: string;
  email: string;
  phone: string;
  lastApproach?: string;
  approachCount: number;
  matchingScore?: number;
}

interface ApproachHistory {
  id: string;
  date: string;
  company: string;
  result: 'pending' | 'accepted' | 'rejected';
  note?: string;
}

const WaitingEngineers: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isApproachModalVisible, setIsApproachModalVisible] = useState(false);
  const [selectedEngineers, setSelectedEngineers] = useState<WaitingEngineer[]>([]);
  const [activeTab, setActiveTab] = useState('waiting');
  const [form] = Form.useForm();

  // ダミーデータ：待機中エンジニア
  const waitingEngineers: WaitingEngineer[] = [
    {
      key: '1',
      engineerId: 'ENG001',
      name: '田中太郎',
      age: 32,
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      experience: 8,
      availableDate: '2024/02/01',
      status: 'waiting',
      unitPrice: 650000,
      contractType: 'SES契約',
      email: 'tanaka@example.com',
      phone: '090-1234-5678',
      lastApproach: '2024/01/10',
      approachCount: 3,
      matchingScore: 95,
    },
    {
      key: '2',
      engineerId: 'ENG005',
      name: '伊藤美咲',
      age: 26,
      skills: ['Vue.js', 'Nuxt.js', 'Firebase', 'GraphQL'],
      experience: 4,
      availableDate: '2024/01/20',
      status: 'waiting',
      unitPrice: 520000,
      contractType: 'SES契約',
      email: 'ito@example.com',
      phone: '090-5678-9012',
      lastApproach: '2024/01/05',
      approachCount: 2,
      matchingScore: 88,
    },
    {
      key: '3',
      engineerId: 'ENG007',
      name: '高橋健太',
      age: 29,
      skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL'],
      experience: 6,
      availableDate: '2024/01/25',
      status: 'waiting',
      unitPrice: 600000,
      contractType: 'SES契約',
      email: 'takahashi@example.com',
      phone: '090-3456-7890',
      approachCount: 1,
      matchingScore: 82,
    },
  ];

  // ダミーデータ：待機予定エンジニア
  const waitingSoonEngineers: WaitingEngineer[] = [
    {
      key: '4',
      engineerId: 'ENG003',
      name: '鈴木一郎',
      age: 35,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
      experience: 10,
      currentProject: 'ECサイトリニューアル',
      projectEndDate: '2024/02/28',
      availableDate: '2024/03/01',
      status: 'waiting_soon',
      unitPrice: 720000,
      contractType: 'SES契約',
      email: 'suzuki@example.com',
      phone: '090-3456-7890',
      lastApproach: '2024/01/12',
      approachCount: 4,
      matchingScore: 91,
    },
    {
      key: '5',
      engineerId: 'ENG004',
      name: '山田次郎',
      age: 30,
      skills: ['C#', '.NET Core', 'Azure', 'SQL Server'],
      experience: 7,
      currentProject: '在庫管理システム',
      projectEndDate: '2024/03/31',
      availableDate: '2024/04/01',
      status: 'waiting_soon',
      unitPrice: 680000,
      contractType: 'SES契約',
      email: 'yamada@example.com',
      phone: '090-4567-8901',
      approachCount: 2,
      matchingScore: 85,
    },
    {
      key: '6',
      engineerId: 'ENG008',
      name: '中村優子',
      age: 28,
      skills: ['React Native', 'Flutter', 'Firebase', 'TypeScript'],
      experience: 5,
      currentProject: 'モバイルアプリ開発',
      projectEndDate: '2024/04/30',
      availableDate: '2024/05/01',
      status: 'waiting_soon',
      unitPrice: 580000,
      contractType: 'SES契約',
      email: 'nakamura@example.com',
      phone: '090-6789-0123',
      approachCount: 0,
      matchingScore: 78,
    },
  ];

  // アプローチ履歴ダミーデータ
  const approachHistory: ApproachHistory[] = [
    {
      id: '1',
      date: '2024/01/10',
      company: 'ABC商事株式会社',
      result: 'pending',
      note: 'React案件での提案',
    },
    {
      id: '2',
      date: '2024/01/05',
      company: 'XYZ物流株式会社',
      result: 'rejected',
      note: '予算が合わず',
    },
    {
      id: '3',
      date: '2023/12/20',
      company: 'DEF製造株式会社',
      result: 'accepted',
      note: '2024年2月から参画予定',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'orange';
      case 'waiting_soon':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return '待機中';
      case 'waiting_soon':
        return '待機予定';
      default:
        return status;
    }
  };

  const getMatchingScoreColor = (score?: number) => {
    if (!score) return '#d9d9d9';
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#1890ff';
    if (score >= 50) return '#faad14';
    return '#f5222d';
  };

  // アプローチモーダルを開く
  const showApproachModal = (engineers: WaitingEngineer[]) => {
    setSelectedEngineers(engineers);
    setIsApproachModalVisible(true);
  };

  // アプローチ送信
  const handleApproachSubmit = async (values: any) => {
    try {
      console.log('Approach values:', values);
      message.success(`${selectedEngineers.length}名へのアプローチを送信しました`);
      setIsApproachModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('アプローチの送信に失敗しました');
    }
  };

  const columns: ColumnsType<WaitingEngineer> = [
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
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div className="font-medium">{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.experience}年経験
            </Text>
          </div>
        </Space>
      ),
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
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '待機中', value: 'waiting' },
        { text: '待機予定', value: 'waiting_soon' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
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
      render: (project, record) => project ? (
        <div>
          <Text>{project}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            終了: {record.projectEndDate}
          </Text>
        </div>
      ) : '-',
    },
    {
      title: '稼働可能日',
      dataIndex: 'availableDate',
      key: 'availableDate',
      width: 120,
      sorter: (a, b) => dayjs(a.availableDate).unix() - dayjs(b.availableDate).unix(),
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {date}
        </Space>
      ),
    },
    {
      title: '単価',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (price) => `¥${price.toLocaleString()}`,
    },
    {
      title: 'マッチング',
      dataIndex: 'matchingScore',
      key: 'matchingScore',
      width: 100,
      sorter: (a, b) => (a.matchingScore || 0) - (b.matchingScore || 0),
      render: (score) => score ? (
        <Progress
          percent={score}
          size="small"
          strokeColor={getMatchingScoreColor(score)}
          format={(percent) => `${percent}%`}
        />
      ) : '-',
    },
    {
      title: 'アプローチ',
      key: 'approach',
      width: 150,
      render: (_, record) => (
        <div>
          <Badge count={record.approachCount} showZero color="#1890ff">
            <Button
              size="small"
              icon={<SendOutlined />}
              onClick={() => showApproachModal([record])}
            >
              送信
            </Button>
          </Badge>
          {record.lastApproach && (
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
              最終: {record.lastApproach}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'アクション',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
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
                key: 'skillsheet',
                icon: <FileTextOutlined />,
                label: 'スキルシート',
              },
              {
                key: 'contact',
                icon: <PhoneOutlined />,
                label: '連絡',
              },
              {
                type: 'divider',
              },
              {
                key: 'approach',
                icon: <SendOutlined />,
                label: 'アプローチ送信',
                onClick: () => showApproachModal([record]),
              },
            ],
          }}
          trigger={['click']}
        >
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

  const tabItems: TabsProps['items'] = [
    {
      key: 'waiting',
      label: (
        <span>
          <ClockCircleOutlined />
          待機中 ({waitingEngineers.length})
        </span>
      ),
      children: (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={waitingEngineers}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
          }}
        />
      ),
    },
    {
      key: 'waiting_soon',
      label: (
        <span>
          <CalendarOutlined />
          待機予定 ({waitingSoonEngineers.length})
        </span>
      ),
      children: (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={waitingSoonEngineers}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
          }}
        />
      ),
    },
    {
      key: 'calendar',
      label: (
        <span>
          <CalendarOutlined />
          カレンダービュー
        </span>
      ),
      children: (
        <div className="p-4">
          <Alert
            message="待機予定カレンダー"
            description="エンジニアの待機開始日を月間カレンダーで確認できます"
            type="info"
            showIcon
            className="mb-4"
          />
          <Card>
            <Timeline mode="left">
              <Timeline.Item
                label="2024/01/20"
                color="orange"
                dot={<ClockCircleOutlined />}
              >
                <Text strong>伊藤美咲</Text> - 待機開始
                <br />
                <Text type="secondary">Vue.js, Nuxt.js</Text>
              </Timeline.Item>
              <Timeline.Item
                label="2024/01/25"
                color="orange"
                dot={<ClockCircleOutlined />}
              >
                <Text strong>高橋健太</Text> - 待機開始
                <br />
                <Text type="secondary">Python, Django</Text>
              </Timeline.Item>
              <Timeline.Item
                label="2024/02/01"
                color="orange"
                dot={<ClockCircleOutlined />}
              >
                <Text strong>田中太郎</Text> - 待機開始
                <br />
                <Text type="secondary">JavaScript, React</Text>
              </Timeline.Item>
              <Timeline.Item
                label="2024/03/01"
                color="cyan"
                dot={<CalendarOutlined />}
              >
                <Text strong>鈴木一郎</Text> - 待機予定
                <br />
                <Text type="secondary">Java, Spring Boot</Text>
              </Timeline.Item>
              <Timeline.Item
                label="2024/04/01"
                color="cyan"
                dot={<CalendarOutlined />}
              >
                <Text strong>山田次郎</Text> - 待機予定
                <br />
                <Text type="secondary">C#, .NET Core</Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Title level={2}>待機中エンジニア管理</Title>
        <Paragraph type="secondary">
          現在待機中および待機予定のエンジニアを管理し、取引先へのアプローチを行います
        </Paragraph>
      </div>

      {/* 統計カード */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待機中エンジニア"
              value={waitingEngineers.length}
              prefix={<TeamOutlined />}
              suffix="名"
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary">即日稼働可能</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待機予定エンジニア"
              value={waitingSoonEngineers.length}
              prefix={<CalendarOutlined />}
              suffix="名"
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">3ヶ月以内</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今月のアプローチ"
              value={25}
              prefix={<SendOutlined />}
              suffix="件"
            />
            <div className="mt-2">
              <Text type="success">
                <ArrowUpOutlined /> 8件増加
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均待機期間"
              value={12}
              prefix={<ClockCircleOutlined />}
              suffix="日"
            />
            <Progress percent={30} size="small" showInfo={false} />
          </Card>
        </Col>
      </Row>

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
              <Option value="waiting">待機中のみ</Option>
              <Option value="waiting_soon">待機予定のみ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <RangePicker
              placeholder={['稼働開始日', '稼働終了日']}
              style={{ width: '100%' }}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="large"
                  onClick={() => {
                    const selected = [...waitingEngineers, ...waitingSoonEngineers]
                      .filter(e => selectedRowKeys.includes(e.key));
                    showApproachModal(selected);
                  }}
                >
                  一括アプローチ ({selectedRowKeys.length})
                </Button>
              )}
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

      {/* アラート */}
      <Alert
        message="おすすめアクション"
        description={
          <Space direction="vertical" size="small">
            <div>
              <InfoCircleOutlined className="mr-2" />
              待機期間が14日を超えているエンジニアが3名います。優先的にアプローチすることをお勧めします。
            </div>
            <div>
              <ExclamationCircleOutlined className="mr-2" />
              来月末までに5名のエンジニアが待機予定です。事前にアプローチリストを準備しましょう。
            </div>
          </Space>
        }
        type="warning"
        showIcon
        closable
        className="mb-4"
      />

      {/* メインテーブル */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* アプローチ送信モーダル */}
      <Modal
        title={
          <Space>
            <SendOutlined />
            アプローチ送信
          </Space>
        }
        open={isApproachModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsApproachModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText="送信"
        cancelText="キャンセル"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApproachSubmit}
        >
          <Alert
            message={`${selectedEngineers.length}名のエンジニアにアプローチを送信します`}
            type="info"
            showIcon
            className="mb-4"
          />
          
          <div className="mb-4">
            <Text strong>対象エンジニア：</Text>
            <div className="mt-2">
              {selectedEngineers.map((engineer) => (
                <Tag key={engineer.key} color="blue">
                  {engineer.name} ({engineer.skills.slice(0, 2).join(', ')})
                </Tag>
              ))}
            </div>
          </div>

          <Form.Item
            name="companies"
            label="送信先企業"
            rules={[{ required: true, message: '送信先企業を選択してください' }]}
          >
            <Select
              mode="multiple"
              placeholder="アプローチ先の企業を選択"
              style={{ width: '100%' }}
            >
              <Option value="1">ABC商事株式会社</Option>
              <Option value="2">XYZ物流株式会社</Option>
              <Option value="3">DEF製造株式会社</Option>
              <Option value="4">GHI小売株式会社</Option>
              <Option value="5">JKLサービス株式会社</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="template"
            label="テンプレート選択"
            rules={[{ required: true, message: 'テンプレートを選択してください' }]}
          >
            <Select placeholder="使用するテンプレートを選択">
              <Option value="standard">標準アプローチ</Option>
              <Option value="urgent">至急案件用</Option>
              <Option value="longterm">長期案件用</Option>
              <Option value="custom">カスタム</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="メッセージ"
            rules={[{ required: true, message: 'メッセージを入力してください' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="アプローチメッセージを入力してください"
            />
          </Form.Item>

          <Form.Item
            name="attachSkillSheet"
            valuePropName="checked"
          >
            <Space>
              <input type="checkbox" />
              <Text>スキルシートを添付する</Text>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WaitingEngineers;
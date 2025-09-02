import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Modal,
  Form,
  message,
  Badge,
  Tooltip,
  Drawer,
  Descriptions,
  Alert,
  Avatar,
  List,
  Statistic,
  Tabs,
} from 'antd';
import {
  HistoryOutlined,
  SendOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PaperClipOutlined,
  EyeOutlined,
  MessageOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface ApproachRecord {
  id: string;
  date: string;
  companyName: string;
  companyId: string;
  type: 'email' | 'phone' | 'meeting' | 'proposal' | 'other';
  subject: string;
  content?: string;
  engineerCount?: number;
  engineers?: string[];
  status: 'sent' | 'replied' | 'pending' | 'accepted' | 'rejected' | 'scheduled';
  contactPerson: string;
  contactEmail?: string;
  attachments?: string[];
  responseDate?: string;
  responseContent?: string;
  nextAction?: string;
  nextActionDate?: string;
  createdBy: string;
  tags?: string[];
}

interface FilterState {
  companyName?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
  type?: string;
  status?: string;
  hasResponse?: boolean;
}

const ApproachHistory: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [approaches, setApproaches] = useState<ApproachRecord[]>([]);
  const [selectedApproach, setSelectedApproach] = useState<ApproachRecord | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  // 統計データ
  const [statistics, setStatistics] = useState({
    total: 0,
    sent: 0,
    replied: 0,
    accepted: 0,
    rejected: 0,
    successRate: 0,
  });

  useEffect(() => {
    loadApproachHistory();
  }, []);

  const loadApproachHistory = () => {
    setLoading(true);
    // モックデータの生成
    setTimeout(() => {
      const mockData: ApproachRecord[] = [
        {
          id: '1',
          date: '2024-11-28 10:30',
          companyName: '株式会社ABC商事',
          companyId: '1',
          type: 'email',
          subject: 'Reactエンジニア3名のご提案',
          content: `お世話になっております。
優秀なReactエンジニア3名をご提案させていただきます。
全員がTypeScript、Next.jsの実務経験を持っており、
貴社のプロジェクトに即戦力として貢献できます。`,
          engineerCount: 3,
          engineers: ['田中太郎', '佐藤花子', '鈴木一郎'],
          status: 'sent',
          contactPerson: '山田部長',
          contactEmail: 'yamada@abc-shoji.co.jp',
          attachments: ['スキルシート_田中.pdf', 'スキルシート_佐藤.pdf', 'スキルシート_鈴木.pdf'],
          createdBy: '営業部 高橋',
          tags: ['React', 'フロントエンド'],
        },
        {
          id: '2',
          date: '2024-11-27 14:00',
          companyName: 'XYZ株式会社',
          companyId: '2',
          type: 'meeting',
          subject: '定例ミーティング - 12月の体制について',
          content: '12月からの新規プロジェクトに向けた体制構築について打ち合わせ',
          status: 'accepted',
          contactPerson: '鈴木部長',
          responseDate: '2024-11-27 16:00',
          responseContent: 'ミーティングで2名の採用が決定しました。',
          engineerCount: 2,
          engineers: ['高橋次郎', '渡辺三郎'],
          createdBy: '営業部 田中',
          tags: ['定例', '採用決定'],
        },
        {
          id: '3',
          date: '2024-11-26 11:00',
          companyName: 'テックコーポレーション',
          companyId: '3',
          type: 'proposal',
          subject: 'Python/AIエンジニアのご提案',
          content: 'AI開発プロジェクト向けのPythonエンジニアをご提案',
          engineerCount: 2,
          engineers: ['加藤四郎', '山本五郎'],
          status: 'replied',
          contactPerson: '田中室長',
          contactEmail: 'tanaka@tech-corp.jp',
          responseDate: '2024-11-27 09:00',
          responseContent: 'ご提案ありがとうございます。社内で検討させていただきます。',
          nextAction: 'フォローアップメール送信',
          nextActionDate: '2024-12-03',
          attachments: ['提案書_AI開発.pdf', 'スキルシート_加藤.pdf', 'スキルシート_山本.pdf'],
          createdBy: '営業部 佐藤',
          tags: ['Python', 'AI', '検討中'],
        },
        {
          id: '4',
          date: '2024-11-25 15:30',
          companyName: 'グローバルシステムズ',
          companyId: '4',
          type: 'phone',
          subject: 'AWS構築案件についてのヒアリング',
          content: 'クラウド移行プロジェクトの要件ヒアリングを実施',
          status: 'pending',
          contactPerson: '伊藤マネージャー',
          nextAction: '提案書作成',
          nextActionDate: '2024-11-30',
          createdBy: '営業部 山田',
          tags: ['AWS', 'ヒアリング'],
        },
        {
          id: '5',
          date: '2024-11-24 09:00',
          companyName: '株式会社デジタルワークス',
          companyId: '5',
          type: 'email',
          subject: 'フルスタックエンジニア2名のご提案',
          engineerCount: 2,
          engineers: ['中村六郎', '小林七郎'],
          status: 'accepted',
          contactPerson: '木村課長',
          contactEmail: 'kimura@digital-works.jp',
          responseDate: '2024-11-25 14:00',
          responseContent: '2名とも採用させていただきます。契約書を送付してください。',
          attachments: ['スキルシート_中村.pdf', 'スキルシート_小林.pdf'],
          createdBy: '営業部 高橋',
          tags: ['フルスタック', '採用決定'],
        },
        {
          id: '6',
          date: '2024-11-23 13:00',
          companyName: '株式会社ABC商事',
          companyId: '1',
          type: 'email',
          subject: 'バックエンドエンジニアの追加提案',
          content: 'Node.js/Express経験者を追加でご提案',
          engineerCount: 1,
          engineers: ['斎藤八郎'],
          status: 'rejected',
          contactPerson: '山田部長',
          contactEmail: 'yamada@abc-shoji.co.jp',
          responseDate: '2024-11-24 10:00',
          responseContent: '現時点では追加の採用予定はありません。',
          attachments: ['スキルシート_斎藤.pdf'],
          createdBy: '営業部 高橋',
          tags: ['バックエンド', '不採用'],
        },
      ];

      setApproaches(mockData);
      
      // 統計データの計算
      const stats = {
        total: mockData.length,
        sent: mockData.filter(a => a.status === 'sent').length,
        replied: mockData.filter(a => a.status === 'replied').length,
        accepted: mockData.filter(a => a.status === 'accepted').length,
        rejected: mockData.filter(a => a.status === 'rejected').length,
        successRate: Math.round((mockData.filter(a => a.status === 'accepted').length / mockData.length) * 100),
      };
      setStatistics(stats);
      
      setLoading(false);
    }, 1000);
  };

  const handleCreateApproach = () => {
    navigate('approaches/create');
  };

  const handleFollowUp = (approach: ApproachRecord) => {
    setSelectedApproach(approach);
    setFollowUpModalVisible(true);
  };

  const handleSendFollowUp = () => {
    form.validateFields().then(values => {
      message.success('フォローアップを送信しました');
      setFollowUpModalVisible(false);
      form.resetFields();
    });
  };

  const handleExport = () => {
    message.info('CSV出力機能は準備中です');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MailOutlined />;
      case 'phone':
        return <PhoneOutlined />;
      case 'meeting':
        return <TeamOutlined />;
      case 'proposal':
        return <FileTextOutlined />;
      default:
        return <MessageOutlined />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'email':
        return 'メール';
      case 'phone':
        return '電話';
      case 'meeting':
        return 'ミーティング';
      case 'proposal':
        return '提案';
      default:
        return 'その他';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'processing';
      case 'replied':
        return 'cyan';
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'scheduled':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return '送信済み';
      case 'replied':
        return '返信あり';
      case 'pending':
        return '保留中';
      case 'accepted':
        return '承認';
      case 'rejected':
        return '却下';
      case 'scheduled':
        return '予定';
      default:
        return status;
    }
  };

  const columns: ColumnsType<ApproachRecord> = [
    {
      title: '日時',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('MM/DD')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format('HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: '取引先',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 200,
      render: (name: string, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => navigate(`/business-partners/${record.companyId}`)}
        >
          {name}
        </Button>
      ),
    },
    {
      title: '種別',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      filters: [
        { text: 'メール', value: 'email' },
        { text: '電話', value: 'phone' },
        { text: 'ミーティング', value: 'meeting' },
        { text: '提案', value: 'proposal' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type: string) => (
        <Space>
          {getTypeIcon(type)}
          <Text>{getTypeText(type)}</Text>
        </Space>
      ),
    },
    {
      title: '件名',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string, record) => (
        <Space direction="vertical" size={0}>
          <Text>{subject}</Text>
          {record.engineerCount && (
            <Space size={4}>
              <Badge count={record.engineerCount} style={{ backgroundColor: '#52c41a' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>名提案</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: '担当者',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 120,
      render: (person: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{person}</Text>
        </Space>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '送信済み', value: 'sent' },
        { text: '返信あり', value: 'replied' },
        { text: '保留中', value: 'pending' },
        { text: '承認', value: 'accepted' },
        { text: '却下', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '返信',
      key: 'response',
      width: 100,
      render: (_, record) => {
        if (record.responseDate) {
          return (
            <Tooltip title={`返信: ${dayjs(record.responseDate).format('MM/DD HH:mm')}`}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            </Tooltip>
          );
        }
        if (record.status === 'sent') {
          const daysSince = dayjs().diff(dayjs(record.date), 'day');
          if (daysSince > 3) {
            return (
              <Tooltip title="返信なし（3日以上経過）">
                <ClockCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />
              </Tooltip>
            );
          }
        }
        return null;
      },
    },
    {
      title: '次回アクション',
      key: 'nextAction',
      width: 150,
      render: (_, record) => {
        if (record.nextAction) {
          return (
            <Space direction="vertical" size={0}>
              <Text style={{ fontSize: 12 }}>{record.nextAction}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(record.nextActionDate).format('MM/DD')}
              </Text>
            </Space>
          );
        }
        return null;
      },
    },
    {
      title: '作成者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: 'アクション',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedApproach(record);
              setDetailDrawerVisible(true);
            }}
          >
            詳細
          </Button>
          {record.status === 'sent' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleFollowUp(record)}
            >
              フォロー
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredApproaches = approaches.filter(approach => {
    const matchesSearch = 
      approach.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
      approach.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      approach.contactPerson.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* ヘッダー */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <HistoryOutlined /> アプローチ履歴
            </Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => loadApproachHistory()}>
                更新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                エクスポート
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateApproach}>
                新規アプローチ
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 統計情報 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card size="small">
              <Statistic
                title="総アプローチ数"
                value={statistics.total}
                prefix={<SendOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small">
              <Statistic
                title="送信済み"
                value={statistics.sent}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small">
              <Statistic
                title="返信あり"
                value={statistics.replied}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small">
              <Statistic
                title="承認"
                value={statistics.accepted}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small">
              <Statistic
                title="却下"
                value={statistics.rejected}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card size="small">
              <Statistic
                title="成功率"
                value={statistics.successRate}
                suffix="%"
                valueStyle={{ color: statistics.successRate >= 50 ? '#52c41a' : '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 検索・フィルター */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="企業名、件名、担当者で検索"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space>
              <RangePicker placeholder={['開始日', '終了日']} />
              <Button icon={<FilterOutlined />} onClick={() => setFilterDrawerVisible(true)}>
                詳細フィルター
              </Button>
            </Space>
          </Col>
        </Row>

        {/* データテーブル */}
        <Table
          columns={columns}
          dataSource={filteredApproaches}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
            defaultPageSize: 10,
          }}
        />
      </Card>

      {/* 詳細ドロワー */}
      <Drawer
        title={
          <Space>
            <HistoryOutlined />
            アプローチ詳細
          </Space>
        }
        placement="right"
        width={720}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedApproach && (
          <div>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="日時">
                {dayjs(selectedApproach.date).format('YYYY年MM月DD日 HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="取引先">
                <Button
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => navigate(`/business-partners/${selectedApproach.companyId}`)}
                >
                  {selectedApproach.companyName}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="種別">
                <Space>
                  {getTypeIcon(selectedApproach.type)}
                  {getTypeText(selectedApproach.type)}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="件名">
                {selectedApproach.subject}
              </Descriptions.Item>
              <Descriptions.Item label="担当者">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  {selectedApproach.contactPerson}
                  {selectedApproach.contactEmail && (
                    <Text copyable>{selectedApproach.contactEmail}</Text>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="ステータス">
                <Tag color={getStatusColor(selectedApproach.status)}>
                  {getStatusText(selectedApproach.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="作成者">
                {selectedApproach.createdBy}
              </Descriptions.Item>
            </Descriptions>

            {selectedApproach.content && (
              <Card title="内容" size="small" style={{ marginBottom: 16 }}>
                <Paragraph>{selectedApproach.content}</Paragraph>
              </Card>
            )}

            {selectedApproach.engineers && selectedApproach.engineers.length > 0 && (
              <Card title="提案エンジニア" size="small" style={{ marginBottom: 16 }}>
                <Space wrap>
                  {selectedApproach.engineers.map(engineer => (
                    <Tag key={engineer} icon={<UserOutlined />}>
                      {engineer}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}

            {selectedApproach.attachments && selectedApproach.attachments.length > 0 && (
              <Card title="添付ファイル" size="small" style={{ marginBottom: 16 }}>
                <List
                  dataSource={selectedApproach.attachments}
                  renderItem={item => (
                    <List.Item>
                      <Space>
                        <PaperClipOutlined />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {selectedApproach.responseDate && (
              <Card title="返信内容" size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary">
                    返信日時: {dayjs(selectedApproach.responseDate).format('YYYY年MM月DD日 HH:mm')}
                  </Text>
                  <Paragraph>{selectedApproach.responseContent}</Paragraph>
                </Space>
              </Card>
            )}

            {selectedApproach.nextAction && (
              <Alert
                message="次回アクション"
                description={
                  <Space direction="vertical">
                    <Text>{selectedApproach.nextAction}</Text>
                    <Text type="secondary">
                      予定日: {dayjs(selectedApproach.nextActionDate).format('YYYY年MM月DD日')}
                    </Text>
                  </Space>
                }
                type="warning"
                showIcon
                icon={<CalendarOutlined />}
              />
            )}

            {selectedApproach.tags && selectedApproach.tags.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">タグ: </Text>
                <Space wrap>
                  {selectedApproach.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* フィルタードロワー */}
      <Drawer
        title="詳細フィルター"
        placement="right"
        width={400}
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
      >
        <Form layout="vertical">
          <Form.Item label="取引先">
            <Select placeholder="選択してください" allowClear>
              <Option value="1">株式会社ABC商事</Option>
              <Option value="2">XYZ株式会社</Option>
              <Option value="3">テックコーポレーション</Option>
            </Select>
          </Form.Item>
          <Form.Item label="アプローチ種別">
            <Select mode="multiple" placeholder="選択してください">
              <Option value="email">メール</Option>
              <Option value="phone">電話</Option>
              <Option value="meeting">ミーティング</Option>
              <Option value="proposal">提案</Option>
            </Select>
          </Form.Item>
          <Form.Item label="ステータス">
            <Select mode="multiple" placeholder="選択してください">
              <Option value="sent">送信済み</Option>
              <Option value="replied">返信あり</Option>
              <Option value="pending">保留中</Option>
              <Option value="accepted">承認</Option>
              <Option value="rejected">却下</Option>
            </Select>
          </Form.Item>
          <Form.Item label="返信有無">
            <Select placeholder="選択してください" allowClear>
              <Option value="true">返信あり</Option>
              <Option value="false">返信なし</Option>
            </Select>
          </Form.Item>
          <Form.Item label="作成者">
            <Input placeholder="作成者名を入力" />
          </Form.Item>
          <Form.Item label="タグ">
            <Select mode="tags" placeholder="タグを入力">
              <Option value="React">React</Option>
              <Option value="Python">Python</Option>
              <Option value="AWS">AWS</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={() => {
                setFilterDrawerVisible(false);
                message.success('フィルターを適用しました');
              }}>
                適用
              </Button>
              <Button onClick={() => {
                setFilters({});
                message.info('フィルターをリセットしました');
              }}>
                リセット
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* フォローアップモーダル */}
      <Modal
        title="フォローアップ送信"
        open={followUpModalVisible}
        onOk={handleSendFollowUp}
        onCancel={() => {
          setFollowUpModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="送信"
        cancelText="キャンセル"
      >
        {selectedApproach && (
          <Form form={form} layout="vertical">
            <Alert
              message={`${selectedApproach.companyName} - ${selectedApproach.contactPerson}様へのフォローアップ`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form.Item
              name="type"
              label="フォローアップ方法"
              initialValue="email"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="email">メール</Option>
                <Option value="phone">電話</Option>
                <Option value="meeting">ミーティング設定</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="subject"
              label="件名"
              rules={[{ required: true, message: '件名を入力してください' }]}
            >
              <Input placeholder="例: 先日ご提案の件について" />
            </Form.Item>
            <Form.Item
              name="content"
              label="内容"
              rules={[{ required: true, message: '内容を入力してください' }]}
            >
              <TextArea
                rows={6}
                placeholder="フォローアップの内容を入力してください"
              />
            </Form.Item>
            <Form.Item name="scheduledDate" label="送信予定日時">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ApproachHistory;
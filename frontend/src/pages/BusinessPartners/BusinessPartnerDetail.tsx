import { debugLog } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import { useBusinessPartnerDetail } from '../../hooks/useBusinessPartners';
import type { BusinessPartner as BusinessPartnerType, ProposedEngineer, Project, ApproachHistory, ContactPerson } from '../../types/businessPartner';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tabs,
  Descriptions,
  Tag,
  Timeline,
  Table,
  Badge,
  Avatar,
  Empty,
  Statistic,
  Alert,
  Modal,
  message,
  Tooltip,
  List,
  Form,
  Input,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  BankOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  SendOutlined,
  EnvironmentOutlined,
  StarOutlined,
  StarFilled,
  PlusOutlined,
  ProjectOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// Types are imported from businessPartner.ts
type BusinessPartnerDetail = BusinessPartnerType;

const BusinessPartnerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<BusinessPartnerDetail | null>(null);
  const [proposalModalVisible, setProposalModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [form] = Form.useForm();
  const [noteForm] = Form.useForm();

  // TanStack Queryカスタムフックを使用してAPIからデータ取得
  const { data: partnerData, isLoading, error } = useBusinessPartnerDetail(id || '');

  useEffect(() => {
    if (partnerData) {
      setPartner(partnerData);
    }
  }, [partnerData]);


  const handleProposal = () => {
    setProposalModalVisible(true);
  };

  const handleSendProposal = () => {
    form.validateFields().then(values => {
      debugLog('Proposal data:', values);
      message.success('エンジニアの提案を送信しました');
      setProposalModalVisible(false);
      form.resetFields();
    });
  };

  const handleAddNote = () => {
    noteForm.validateFields().then(values => {
      debugLog('Note data:', values);
      message.success('メモを追加しました');
      setNoteModalVisible(false);
      noteForm.resetFields();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'prospective':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '取引中';
      case 'inactive':
        return '休止中';
      case 'prospective':
        return '見込み';
      default:
        return status;
    }
  };

  const proposedEngineersColumns: ColumnsType<ProposedEngineer> = [
    {
      title: 'エンジニア',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'スキル',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: string[]) => (
        <Space wrap>
          {skills.map(skill => (
            <Tag key={skill} color="blue">{skill}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '経験年数',
      dataIndex: 'experience',
      key: 'experience',
      render: (years: number) => `${years}年`,
    },
    {
      title: '単価',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `¥${price.toLocaleString()}`,
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = {
          proposed: { color: 'processing', text: '提案中' },
          accepted: { color: 'success', text: '採用' },
          rejected: { color: 'error', text: '不採用' },
          pending: { color: 'warning', text: '検討中' },
        };
        return <Tag color={config[status as keyof typeof config].color}>{config[status as keyof typeof config].text}</Tag>;
      },
    },
    {
      title: '提案日',
      dataIndex: 'proposedDate',
      key: 'proposedDate',
      render: (date: string) => dayjs(date).format('YYYY/MM/DD'),
    },
    {
      title: 'プロジェクト',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (name?: string) => name || '-',
    },
  ];

  const projectsColumns: ColumnsType<Project> = [
    {
      title: 'プロジェクト名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <ProjectOutlined />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: '期間',
      key: 'period',
      render: (_, record) => (
        <Text>
          {dayjs(record.startDate).format('YYYY/MM')} 〜 {record.endDate ? dayjs(record.endDate).format('YYYY/MM') : '継続中'}
        </Text>
      ),
    },
    {
      title: 'エンジニア数',
      dataIndex: 'engineerCount',
      key: 'engineerCount',
      align: 'center',
      render: (count: number) => <Badge count={count} style={{ backgroundColor: '#52c41a' }} />,
    },
    {
      title: '売上',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      render: (revenue: number) => <Text strong>¥{revenue.toLocaleString()}</Text>,
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = {
          active: { color: 'success', text: '進行中' },
          completed: { color: 'default', text: '完了' },
          paused: { color: 'warning', text: '一時停止' },
        };
        return <Badge status={config[status as keyof typeof config].color as any} text={config[status as keyof typeof config].text} />;
      },
    },
  ];

  if (isLoading) {
    return (
      <Card loading={isLoading}>
        <div style={{ height: 400 }} />
      </Card>
    );
  }

  if (!partner) {
    return (
      <Card>
        <Empty description="取引先情報が見つかりません" />
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* ヘッダー */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="top">
          <Col>
            <Space direction="vertical" size={0}>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('business-partners/list')}
                style={{ marginLeft: -8 }}
              >
                一覧に戻る
              </Button>
              <Space align="center" size="large">
                <Avatar size={64} icon={<BankOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <div>
                  <Space align="baseline">
                    <Title level={2} style={{ margin: 0 }}>{partner.companyName}</Title>
                    <Badge status={getStatusColor(partner.status) as any} text={getStatusText(partner.status)} />
                  </Space>
                  <Space style={{ marginTop: 8 }}>
                    {partner.tags?.map(tag => (
                      <Tag key={tag} color={tag === '優良顧客' ? 'gold' : 'default'}>{tag}</Tag>
                    ))}
                    <Tooltip title={`評価: ${partner.rating || 0}`}>
                      <Space>
                        {[...Array(5)].map((_, i) => (
                          i < Math.floor(partner.rating || 0) ? 
                            <StarFilled key={i} style={{ color: '#faad14' }} /> : 
                            <StarOutlined key={i} style={{ color: '#d9d9d9' }} />
                        ))}
                      </Space>
                    </Tooltip>
                  </Space>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<MailOutlined />}>メール送信</Button>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/business-partners/edit/${partner.id}`)}>
                編集
              </Button>
              <Button type="primary" icon={<SendOutlined />} onClick={handleProposal}>
                エンジニアを提案
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 統計情報 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="稼働エンジニア"
              value={partner.currentEngineers}
              suffix="名"
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="月間売上"
              value={(partner.monthlyRevenue || 0) / 10000}
              suffix="万円"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="提案成功率"
              value={partner.totalProposals > 0 ? Math.round((partner.acceptedProposals / partner.totalProposals) * 100) : 0}
              suffix="%"
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="累計売上"
              value={(partner.totalRevenue || 0) / 10000}
              suffix="万円"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* メインコンテンツ */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="概要" key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="基本情報" size="small">
                  <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    <Descriptions.Item label="企業名カナ">{partner.companyNameKana}</Descriptions.Item>
                    <Descriptions.Item label="業界">{partner.industry}</Descriptions.Item>
                    <Descriptions.Item label="従業員規模">{partner.employeeSize}</Descriptions.Item>
                    <Descriptions.Item label="電話番号">
                      <Space>
                        <PhoneOutlined />
                        {partner.phone}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Webサイト" span={2}>
                      {partner.website && (
                        <a href={partner.website} target="_blank" rel="noopener noreferrer">
                          <Space>
                            <GlobalOutlined />
                            {partner.website}
                          </Space>
                        </a>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="所在地" span={2}>
                      <Space>
                        <EnvironmentOutlined />
                        {partner.address}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="事業内容" span={2}>
                      {partner.businessDescription}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="取引条件" size="small" style={{ marginTop: 16 }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="契約形態">
                      {partner.contractTypes.join(', ')}
                    </Descriptions.Item>
                    <Descriptions.Item label="予算範囲">
                      ¥{partner.budgetMin?.toLocaleString()} 〜 ¥{partner.budgetMax?.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="支払条件">
                      {partner.paymentTerms || '月末締め翌月末払い'}
                    </Descriptions.Item>
                    <Descriptions.Item label="求めるスキル">
                      <Space wrap>
                        {partner.preferredSkills?.map(skill => (
                          <Tag key={skill}>{skill}</Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="要件">
                      {partner.requirements}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="担当者" size="small">
                  <List
                    dataSource={partner.contacts}
                    renderItem={contact => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={
                            <Space>
                              {contact.name}
                              {contact.isPrimary && <Tag color="blue">主担当</Tag>}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">{contact.department} {contact.position}</Text>
                              <Text copyable>{contact.email}</Text>
                              <Text>{contact.phone}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>

                <Card
                  title="メモ"
                  size="small"
                  style={{ marginTop: 16 }}
                  extra={
                    <Button size="small" icon={<PlusOutlined />} onClick={() => setNoteModalVisible(true)}>
                      追加
                    </Button>
                  }
                >
                  <Paragraph>{partner.notes || 'メモはありません'}</Paragraph>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="提案エンジニア" key="engineers">
            <Table
              columns={proposedEngineersColumns}
              dataSource={partner.proposedEngineers}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="プロジェクト" key="projects">
            <Table
              columns={projectsColumns}
              dataSource={partner.projects}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="アプローチ履歴" key="approaches">
            <Timeline mode="left">
              {partner.approaches.map(approach => (
                <Timeline.Item
                  key={approach.id}
                  label={dayjs(approach.date).format('YYYY/MM/DD')}
                  color={
                    approach.status === 'accepted' ? 'green' :
                    approach.status === 'rejected' ? 'red' :
                    approach.status === 'replied' ? 'blue' : 'gray'
                  }
                >
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row justify="space-between">
                        <Col>
                          <Space>
                            <Text strong>{approach.subject}</Text>
                            {approach.type === 'email' && <MailOutlined />}
                            {approach.type === 'phone' && <PhoneOutlined />}
                            {approach.type === 'meeting' && <TeamOutlined />}
                            {approach.engineerCount && (
                              <Tag>{approach.engineerCount}名提案</Tag>
                            )}
                          </Space>
                        </Col>
                        <Col>
                          <Tag color={
                            approach.status === 'accepted' ? 'success' :
                            approach.status === 'rejected' ? 'error' :
                            approach.status === 'replied' ? 'processing' : 'default'
                          }>
                            {approach.status === 'sent' ? '送信済' :
                             approach.status === 'replied' ? '返信あり' :
                             approach.status === 'accepted' ? '承認' :
                             approach.status === 'rejected' ? '却下' : '保留'}
                          </Tag>
                        </Col>
                      </Row>
                      {approach.note && <Paragraph>{approach.note}</Paragraph>}
                      {approach.attachments && (
                        <Space wrap>
                          {approach.attachments.map(file => (
                            <Tag key={file} icon={<FileTextOutlined />}>{file}</Tag>
                          ))}
                        </Space>
                      )}
                      {approach.responseDate && (
                        <Alert
                          message={`返信: ${dayjs(approach.responseDate).format('YYYY/MM/DD')}`}
                          description={approach.responseNote}
                          type="info"
                          showIcon
                        />
                      )}
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* エンジニア提案モーダル */}
      <Modal
        title="エンジニア提案"
        open={proposalModalVisible}
        onOk={handleSendProposal}
        onCancel={() => setProposalModalVisible(false)}
        width={600}
        okText="送信"
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="engineers"
            label="提案エンジニア"
            rules={[{ required: true, message: 'エンジニアを選択してください' }]}
          >
            <Select mode="multiple" placeholder="エンジニアを選択">
              <Option value="1">田中一郎 (React, TypeScript)</Option>
              <Option value="2">佐藤二郎 (AWS, Docker)</Option>
              <Option value="3">鈴木三郎 (Vue.js, Node.js)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="subject"
            label="件名"
            rules={[{ required: true, message: '件名を入力してください' }]}
          >
            <Input placeholder="例: Reactエンジニア2名のご提案" />
          </Form.Item>
          <Form.Item
            name="message"
            label="メッセージ"
            rules={[{ required: true, message: 'メッセージを入力してください' }]}
          >
            <TextArea rows={6} placeholder="提案内容を入力してください" />
          </Form.Item>
          <Form.Item name="attachments" label="添付ファイル">
            <Select mode="multiple" placeholder="スキルシートを選択">
              <Option value="1">田中一郎_スキルシート.pdf</Option>
              <Option value="2">佐藤二郎_スキルシート.pdf</Option>
              <Option value="3">鈴木三郎_スキルシート.pdf</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* メモ追加モーダル */}
      <Modal
        title="メモ追加"
        open={noteModalVisible}
        onOk={handleAddNote}
        onCancel={() => setNoteModalVisible(false)}
        okText="保存"
        cancelText="キャンセル"
      >
        <Form form={noteForm} layout="vertical">
          <Form.Item
            name="note"
            label="メモ内容"
            rules={[{ required: true, message: 'メモを入力してください' }]}
          >
            <TextArea rows={4} placeholder="メモを入力してください" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BusinessPartnerDetail;
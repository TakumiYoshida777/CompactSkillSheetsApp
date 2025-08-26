import React, { useState } from 'react';
import { 
  useBusinessPartners,
  useDeleteBusinessPartner 
} from '../../hooks/useBusinessPartners';
import type { BusinessPartner } from '../../types/businessPartner';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Dropdown,
  Modal,
  message,
  Badge,
  Tooltip,
  Drawer,
  Descriptions,
  Timeline,
  Empty,
  Avatar,
  Statistic,
  Alert,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  BankOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  SendOutlined,
  TeamOutlined,
  ExportOutlined,
  ReloadOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

// Types are imported from businessPartner.ts

const BusinessPartnerList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    canViewPartner, 
    canCreatePartner, 
    canEditPartner, 
    canDeletePartner,
    canManagePartner 
  } = usePermissionCheck();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPartner, setSelectedPartner] = useState<BusinessPartner | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // TanStack Queryカスタムフックを使用してAPIからデータ取得
  const { data: partnersData, isLoading, refetch } = useBusinessPartners({
    search: searchText || undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    // industry: selectedIndustries.length > 0 ? selectedIndustries[0] : undefined,
    page: currentPage,
    limit: pageSize,
  });

  // 削除用のmutationフック
  const deletePartnerMutation = useDeleteBusinessPartner();

  // APIレスポンスの型を正しく処理
  const partners = partnersData?.data || [];
  const total = partnersData?.pagination?.total || 0;


  const filteredPartners = partners.filter((partner: BusinessPartner) => {
    // companyNameが存在しない場合はフィルタリング対象外
    if (!partner || !partner.companyName) {
      return false;
    }
    
    const matchesSearch = partner.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
                         (partner.companyNameKana?.toLowerCase().includes(searchText.toLowerCase()) || false);
    const matchesStatus = selectedStatus === 'all' || partner.status === selectedStatus;
    const matchesIndustry = selectedIndustries.length === 0 || (partner.industry && selectedIndustries.includes(partner.industry));
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });


  const handleBulkEmail = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('送信先を選択してください');
      return;
    }
    setEmailModalVisible(true);
  };

  const handleDelete = async (partner: BusinessPartner) => {
    Modal.confirm({
      title: '取引先削除の確認',
      content: `${partner.companyName}を削除してもよろしいですか？`,
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk: () => {
        deletePartnerMutation.mutate(partner.id);
      },
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

  const moreActions: MenuProps['items'] = [
    {
      key: 'email',
      icon: <MailOutlined />,
      label: 'メール送信',
    },
    {
      key: 'export',
      icon: <ExportOutlined />,
      label: 'エクスポート',
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

  const columns: ColumnsType<BusinessPartner> = [
    {
      title: <StarOutlined />,
      dataIndex: 'rating',
      key: 'rating',
      width: 60,
      render: (rating: number) => (
        <Tooltip title={`評価: ${rating || 0}`}>
          {rating >= 4.5 ? (
            <StarFilled style={{ color: '#faad14', fontSize: 18 }} />
          ) : rating >= 3.5 ? (
            <StarOutlined style={{ color: '#faad14', fontSize: 18 }} />
          ) : null}
        </Tooltip>
      ),
    },
    {
      title: '企業名',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => (a.companyName || '').localeCompare(b.companyName || ''),
      render: (name: string, record: BusinessPartner) => (
        <Space direction="vertical" size={0}>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto', fontWeight: 500 }}
            onClick={() => {
              setSelectedPartner(record);
              setDetailDrawerVisible(true);
            }}
          >
            {name}
          </Button>
          <Space size={4}>
            {record.tags?.map(tag => (
              <Tag key={tag} color={tag === '最重要顧客' ? 'red' : tag === '優良顧客' ? 'gold' : 'default'}>
                {tag}
              </Tag>
            ))}
          </Space>
        </Space>
      ),
    },
    {
      title: '業界',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
      filters: [
        { text: 'IT・通信', value: 'IT・通信' },
        { text: '金融・保険', value: '金融・保険' },
        { text: '製造業', value: '製造業' },
        { text: 'コンサルティング', value: 'コンサルティング' },
      ],
      onFilter: (value, record) => record.industry === value,
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={getStatusColor(status) as 'success' | 'processing' | 'default' | 'error' | 'warning'}
          text={getStatusText(status)}
        />
      ),
      filters: [
        { text: '取引中', value: 'active' },
        { text: '見込み', value: 'prospective' },
        { text: '休止中', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '主担当者',
      key: 'primaryContact',
      width: 200,
      render: (_, record) => {
        const primary = record.contacts?.find(c => c.isPrimary);
        return primary ? (
          <Space direction="vertical" size={0}>
            <Text>{primary.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {primary.department} {primary.position}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: '稼働エンジニア',
      dataIndex: 'currentEngineers',
      key: 'currentEngineers',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.currentEngineers - b.currentEngineers,
      render: (count: number) => (
        <Badge
          count={count}
          style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
          overflowCount={99}
        />
      ),
    },
    {
      title: '月間売上',
      dataIndex: 'monthlyRevenue',
      key: 'monthlyRevenue',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.monthlyRevenue || 0) - (b.monthlyRevenue || 0),
      render: (revenue: number) => (
        <Text strong>
          {revenue ? `¥${(revenue / 10000).toFixed(0)}万` : '-'}
        </Text>
      ),
    },
    {
      title: '提案実績',
      key: 'proposals',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Text>{record.acceptedProposals}</Text>
          <Text type="secondary">/</Text>
          <Text type="secondary">{record.totalProposals}</Text>
          {record.totalProposals > 0 && (
            <Text type="success">
              ({Math.round((record.acceptedProposals / record.totalProposals) * 100)}%)
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '最終連絡',
      dataIndex: 'lastContactDate',
      key: 'lastContactDate',
      width: 110,
      sorter: (a, b) => dayjs(a.lastContactDate).unix() - dayjs(b.lastContactDate).unix(),
      render: (date: string) => {
        if (!date) return <Text type="secondary">-</Text>;
        const days = dayjs().diff(dayjs(date), 'day');
        return (
          <Tooltip title={dayjs(date).format('YYYY/MM/DD')}>
            <Text type={days > 30 ? 'warning' : undefined}>
              {days === 0 ? '今日' : days === 1 ? '昨日' : `${days}日前`}
            </Text>
          </Tooltip>
        );
      },
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
            icon={<EditOutlined />}
            onClick={() => navigate(`/business-partners/edit/${record.id}`)}
          >
            編集
          </Button>
          <Dropdown
            menu={{
              items: moreActions,
              onClick: ({ key }) => {
                if (key === 'delete') {
                  handleDelete(record);
                } else if (key === 'email') {
                  message.info('メール送信機能は準備中です');
                }
              },
            }}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };


  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* ヘッダー */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <BankOutlined /> 取引先管理
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  refetch();
                  message.success('データを更新しました');
                }}
              >
                更新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('business-partners/new')}
              >
                新規登録
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 統計情報 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="取引先企業数"
                value={partners.filter(p => p && p.status === 'active').length}
                suffix={`/ ${partners.length}`}
                prefix={<BankOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="稼働エンジニア"
                value={partners.reduce((sum, p) => sum + (p?.currentEngineers || 0), 0)}
                suffix="名"
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="月間売上"
                value={partners.reduce((sum, p) => sum + (p?.monthlyRevenue || 0), 0) / 10000}
                suffix="万円"
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="提案成功率"
                value={
                  partners.length > 0 && partners.reduce((sum, p) => sum + (p?.totalProposals || 0), 0) > 0
                    ? Math.round(
                        (partners.reduce((sum, p) => sum + (p?.acceptedProposals || 0), 0) /
                         partners.reduce((sum, p) => sum + (p?.totalProposals || 0), 0)) * 100
                      )
                    : 0
                }
                suffix="%"
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 検索・フィルター */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="企業名で検索"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space>
              <Select
                style={{ width: 150 }}
                placeholder="ステータス"
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="all">すべて</Option>
                <Option value="active">取引中</Option>
                <Option value="prospective">見込み</Option>
                <Option value="inactive">休止中</Option>
              </Select>
              <Select
                mode="multiple"
                style={{ minWidth: 200 }}
                placeholder="業界で絞り込み"
                value={selectedIndustries}
                onChange={setSelectedIndustries}
              >
                <Option value="IT・通信">IT・通信</Option>
                <Option value="金融・保険">金融・保険</Option>
                <Option value="製造業">製造業</Option>
                <Option value="コンサルティング">コンサルティング</Option>
              </Select>
              <Button
                icon={<MailOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={handleBulkEmail}
              >
                一括メール送信 ({selectedRowKeys.length})
              </Button>
            </Space>
          </Col>
        </Row>

        {/* データテーブル */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredPartners}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1500 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) setPageSize(size);
            },
          }}
        />
      </Card>

      {/* 詳細ドロワー */}
      <Drawer
        title={
          <Space>
            <BankOutlined />
            {selectedPartner?.companyName}
          </Space>
        }
        placement="right"
        width={720}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                navigate(`/business-partners/edit/${selectedPartner?.id}`);
                setDetailDrawerVisible(false);
              }}
            >
              編集
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => message.info('エンジニア提案機能は準備中です')}
            >
              エンジニアを提案
            </Button>
          </Space>
        }
      >
        {selectedPartner && (
          <Tabs defaultActiveKey="basic">
            <TabPane tab="基本情報" key="basic">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="企業名">
                  {selectedPartner.companyName}
                </Descriptions.Item>
                <Descriptions.Item label="企業名（カナ）">
                  {selectedPartner.companyNameKana}
                </Descriptions.Item>
                <Descriptions.Item label="業界">
                  {selectedPartner.industry}
                </Descriptions.Item>
                <Descriptions.Item label="従業員規模">
                  {selectedPartner.employeeSize || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="所在地">
                  {selectedPartner.address}
                </Descriptions.Item>
                <Descriptions.Item label="電話番号">
                  {selectedPartner.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Webサイト">
                  {selectedPartner.website ? (
                    <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer">
                      {selectedPartner.website}
                    </a>
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="事業内容">
                  {selectedPartner.businessDescription || '-'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="担当者" key="contacts">
              <Space direction="vertical" style={{ width: '100%' }}>
                {(selectedPartner.contacts || []).map(contact => (
                  <Card key={contact.id} size="small">
                    <Row justify="space-between">
                      <Col>
                        <Space>
                          <Avatar icon={<UserOutlined />} />
                          <div>
                            <div>
                              <Text strong>{contact.name}</Text>
                              {contact.isPrimary && (
                                <Tag color="blue" style={{ marginLeft: 8 }}>主担当</Tag>
                              )}
                            </div>
                            <Text type="secondary">
                              {contact.department} {contact.position}
                            </Text>
                          </div>
                        </Space>
                      </Col>
                      <Col>
                        <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                          <Space>
                            <MailOutlined />
                            <Text copyable>{contact.email}</Text>
                          </Space>
                          <Space>
                            <PhoneOutlined />
                            <Text>{contact.phone}</Text>
                          </Space>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </TabPane>

            <TabPane tab="取引条件" key="terms">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="契約形態">
                  {selectedPartner.contractTypes?.join(', ') || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="予算範囲">
                  {selectedPartner.budgetMin && selectedPartner.budgetMax
                    ? `¥${selectedPartner.budgetMin.toLocaleString()} 〜 ¥${selectedPartner.budgetMax.toLocaleString()}`
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="求めるスキル">
                  {selectedPartner.preferredSkills?.map(skill => (
                    <Tag key={skill}>{skill}</Tag>
                  )) || '-'}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab="アプローチ履歴" key="approaches">
              {selectedPartner.approaches && selectedPartner.approaches.length > 0 ? (
                <Timeline>
                  {selectedPartner.approaches.map(approach => (
                    <Timeline.Item
                      key={approach.id}
                      color={approach.status === 'accepted' ? 'green' : approach.status === 'rejected' ? 'red' : 'blue'}
                    >
                      <Space direction="vertical" size={0}>
                        <Space>
                          <Text strong>{approach.subject}</Text>
                          {approach.engineerCount && (
                            <Tag>{approach.engineerCount}名提案</Tag>
                          )}
                        </Space>
                        <Text type="secondary">
                          {dayjs(approach.date).format('YYYY/MM/DD')} - {approach.type === 'email' ? 'メール' : approach.type === 'meeting' ? 'ミーティング' : approach.type}
                        </Text>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="アプローチ履歴はありません" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Drawer>

      {/* 一括メール送信モーダル */}
      <Modal
        title="一括営業メール送信"
        open={emailModalVisible}
        onCancel={() => setEmailModalVisible(false)}
        onOk={() => {
          message.success(`${selectedRowKeys.length}社へメールを送信しました`);
          setEmailModalVisible(false);
          setSelectedRowKeys([]);
        }}
        okText="送信"
        cancelText="キャンセル"
        width={600}
      >
        <Alert
          message={`選択された${selectedRowKeys.length}社に営業メールを送信します`}
          description="各企業の主担当者宛てに、最新のエンジニア情報を含む営業メールが送信されます。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Card size="small" title="送信先企業">
          <Space direction="vertical" style={{ width: '100%' }}>
            {partners
              .filter((p: BusinessPartner) => selectedRowKeys.includes(p.id))
              .map((partner: BusinessPartner) => (
                <div key={partner.id}>
                  <Text>{partner.companyName}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({partner.contacts.find(c => c.isPrimary)?.email})
                  </Text>
                </div>
              ))}
          </Space>
        </Card>
      </Modal>
    </div>
  );
};

export default BusinessPartnerList;
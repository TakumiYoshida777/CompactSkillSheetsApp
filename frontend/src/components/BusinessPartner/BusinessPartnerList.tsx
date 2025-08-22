import React, { Suspense } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Spin,
  Card,
  Row,
  Col,
  Statistic,
  message
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  useBusinessPartnersSuspense,
  useBusinessPartnerStats,
  useDeleteBusinessPartner,
  useToggleBusinessPartnerStatus
} from '../../hooks/useBusinessPartners';
import { QueryErrorBoundary } from '../ErrorBoundary/QueryErrorBoundary';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface BusinessPartner {
  id: string;
  clientCompany: {
    name: string;
    email: string;
    phone: string;
  };
  contractType: string;
  contractStartDate: string;
  contractEndDate?: string;
  monthlyFee?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 統計情報コンポーネント
 */
const PartnerStatistics: React.FC = () => {
  const { data: stats, isLoading } = useBusinessPartnerStats();

  if (isLoading) {
    return <Spin />;
  }

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic
            title="取引先企業数"
            value={stats?.total || 0}
            suffix="社"
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="アクティブ"
            value={stats?.active || 0}
            suffix="社"
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="非アクティブ"
            value={stats?.inactive || 0}
            suffix="社"
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="今月の新規"
            value={stats?.thisMonth || 0}
            suffix="社"
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

/**
 * 取引先企業テーブルコンポーネント（Suspense対応）
 */
const BusinessPartnerTableContent: React.FC<{
  filters: any;
  onFiltersChange: (filters: any) => void;
}> = ({ filters, onFiltersChange }) => {
  const navigate = useNavigate();
  const { data, refetch } = useBusinessPartnersSuspense(filters);
  const deleteMutation = useDeleteBusinessPartner();
  const toggleStatusMutation = useToggleBusinessPartnerStatus();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // エラーハンドリングはmutation内で実施
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({
        id,
        isActive: !currentStatus,
      });
    } catch (error) {
      // エラーハンドリングはmutation内で実施
    }
  };

  const columns: ColumnsType<BusinessPartner> = [
    {
      title: '企業名',
      dataIndex: ['clientCompany', 'name'],
      key: 'name',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/business-partners/${record.id}`)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'メールアドレス',
      dataIndex: ['clientCompany', 'email'],
      key: 'email',
    },
    {
      title: '電話番号',
      dataIndex: ['clientCompany', 'phone'],
      key: 'phone',
    },
    {
      title: '契約形態',
      dataIndex: 'contractType',
      key: 'contractType',
      render: (type) => {
        const color = type === 'SES' ? 'blue' : 'green';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: '月額料金',
      dataIndex: 'monthlyFee',
      key: 'monthlyFee',
      render: (fee) => fee ? `¥${fee.toLocaleString()}` : '-',
    },
    {
      title: 'ステータス',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'アクティブ' : '非アクティブ'}
        </Tag>
      ),
    },
    {
      title: '契約開始日',
      dataIndex: 'contractStartDate',
      key: 'contractStartDate',
      render: (date) => new Date(date).toLocaleDateString('ja-JP'),
    },
    {
      title: 'アクション',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/business-partners/${record.id}`)}
            size="small"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/business-partners/${record.id}/edit`)}
            size="small"
          />
          <Button
            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record.id, record.isActive)}
            size="small"
            loading={toggleStatusMutation.isPending}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
            loading={deleteMutation.isPending}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data?.data || []}
      rowKey="id"
      pagination={{
        current: data?.pagination.page,
        pageSize: data?.pagination.limit,
        total: data?.pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `全 ${total} 件`,
        onChange: (page, pageSize) => {
          onFiltersChange({
            ...filters,
            page,
            limit: pageSize,
          });
        },
      }}
    />
  );
};

/**
 * 取引先企業一覧コンポーネント
 */
const BusinessPartnerList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all' as 'active' | 'inactive' | 'all',
    contractType: '',
    page: 1,
    limit: 20,
  });

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value as any, page: 1 }));
  };

  const handleContractTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, contractType: value, page: 1 }));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>取引先企業管理</h1>

      {/* 統計情報 */}
      <PartnerStatistics />

      {/* フィルターバー */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="企業名で検索"
              onSearch={handleSearch}
              allowClear
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="ステータス"
              onChange={handleStatusChange}
              value={filters.status}
              allowClear
            >
              <Option value="all">すべて</Option>
              <Option value="active">アクティブ</Option>
              <Option value="inactive">非アクティブ</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="契約形態"
              onChange={handleContractTypeChange}
              value={filters.contractType}
              allowClear
            >
              <Option value="">すべて</Option>
              <Option value="SES">SES</Option>
              <Option value="受託">受託</Option>
              <Option value="派遣">派遣</Option>
            </Select>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                更新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/business-partners/new')}
              >
                新規登録
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* テーブル（エラーバウンダリーとSuspenseでラップ） */}
      <QueryErrorBoundary>
        <Suspense 
          fallback={
            <Card>
              <div style={{ textAlign: 'center', padding: 50 }}>
                <Spin size="large" tip="データを読み込んでいます..." />
              </div>
            </Card>
          }
        >
          <Card>
            <BusinessPartnerTableContent 
              filters={filters} 
              onFiltersChange={setFilters}
            />
          </Card>
        </Suspense>
      </QueryErrorBoundary>
    </div>
  );
};

export default BusinessPartnerList;
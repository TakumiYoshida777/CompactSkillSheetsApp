import { debugLog } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Row,
  Col,
  Statistic,
  Badge,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBusinessPartnerStore } from '../../stores/useBusinessPartnerStore';
import SearchFilter from '../../components/BusinessPartner/SearchFilter';
import EnhancedTable from '../../components/BusinessPartner/EnhancedTable';
import type { BusinessPartner, BusinessPartnerSearchParams } from '../../services/businessPartnerService';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const BusinessPartnerListEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const {
    partners,
    totalCount,
    isLoading,
    error,
    fetchBusinessPartners,
    deleteBusinessPartner,
    clearError,
  } = useBusinessPartnerStore();

  const [searchParams, setSearchParams] = useState<BusinessPartnerSearchParams>({});
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
  });

  // データ読み込み
  useEffect(() => {
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      await fetchBusinessPartners(searchParams);
    } catch (error) {
      message.error('データの読み込みに失敗しました');
    }
  };

  // 統計情報の計算
  useEffect(() => {
    if (partners) {
      setStatistics({
        total: partners.length,
        active: partners.filter(p => p.status === 'active').length,
        inactive: partners.filter(p => p.status === 'inactive').length,
        pending: partners.filter(p => p.status === 'pending').length,
      });
    }
  }, [partners]);

  // エラー表示
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error]);

  // 検索処理
  const handleSearch = (params: BusinessPartnerSearchParams) => {
    setSearchParams(params);
  };

  // 検索リセット
  const handleSearchReset = () => {
    setSearchParams({});
  };

  // 一括操作
  const handleBulkAction = async (action: string, selectedRows: BusinessPartner[]) => {
    try {
      switch (action) {
        case 'activate':
          // 選択した取引先をアクティブ化
          for (const partner of selectedRows) {
            // API呼び出し（実装済みの場合）
            debugLog('Activating:', partner.id);
          }
          message.success(`${selectedRows.length}件をアクティブ化しました`);
          break;
          
        case 'deactivate':
          // 選択した取引先を非アクティブ化
          for (const partner of selectedRows) {
            debugLog('Deactivating:', partner.id);
          }
          message.success(`${selectedRows.length}件を非アクティブ化しました`);
          break;
          
        case 'sendEmail':
          // メール送信画面へ遷移など
          message.info('メール送信機能は実装予定です');
          break;
          
        case 'delete':
          // 選択した取引先を削除
          for (const partner of selectedRows) {
            await deleteBusinessPartner(partner.id);
          }
          message.success(`${selectedRows.length}件を削除しました`);
          loadData();
          break;
          
        default:
          debugLog('Unknown action:', action);
      }
    } catch (error) {
      message.error('操作に失敗しました');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      active: { color: 'success', text: 'アクティブ', icon: <CheckCircleOutlined /> },
      inactive: { color: 'default', text: '非アクティブ', icon: <CloseCircleOutlined /> },
      pending: { color: 'processing', text: '審査中', icon: <ClockCircleOutlined /> },
      suspended: { color: 'error', text: '停止中', icon: <CloseCircleOutlined /> },
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns: ColumnsType<BusinessPartner> = [
    {
      title: '会社名',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => a.companyName.localeCompare(b.companyName),
      render: (text: string, record: BusinessPartner) => (
        <a onClick={() => navigate(`/business-partners/${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: '業界',
      dataIndex: 'industry',
      key: 'industry',
      filters: [
        { text: 'IT・通信', value: 'it' },
        { text: '金融・保険', value: 'finance' },
        { text: '製造業', value: 'manufacturing' },
        { text: 'その他', value: 'other' },
      ],
      onFilter: (value, record) => record.industry === value,
    },
    {
      title: '代表者',
      dataIndex: 'representativeName',
      key: 'representativeName',
      render: (text: string) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '契約タイプ',
      dataIndex: 'contractType',
      key: 'contractType',
      render: (type: string) => {
        const typeLabels: Record<string, string> = {
          ses: 'SES契約',
          contract: '請負契約',
          dispatch: '派遣契約',
          outsourcing: '業務委託',
        };
        return <Tag>{typeLabels[type] || type}</Tag>;
      },
    },
    {
      title: '稼働エンジニア',
      dataIndex: 'activeEngineersCount',
      key: 'activeEngineersCount',
      sorter: (a, b) => (a.activeEngineersCount || 0) - (b.activeEngineersCount || 0),
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }}>
          <TeamOutlined style={{ fontSize: 20 }} />
        </Badge>
      ),
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'アクティブ', value: 'active' },
        { text: '非アクティブ', value: 'inactive' },
        { text: '審査中', value: 'pending' },
        { text: '停止中', value: 'suspended' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '登録日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString('ja-JP'),
    },
    {
      title: 'アクション',
      key: 'action',
      fixed: 'right',
      render: (_, record: BusinessPartner) => (
        <Space>
          <Button
            size="small"
            onClick={() => navigate(`/business-partners/${record.id}`)}
          >
            詳細
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/business-partners/${record.id}/edit`)}
          >
            編集
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* ヘッダー */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined /> 取引先管理
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/business-partners/new')}
          >
            新規取引先登録
          </Button>
        </Col>
      </Row>

      {/* 統計情報 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="全取引先"
              value={statistics.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="アクティブ"
              value={statistics.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="非アクティブ"
              value={statistics.inactive}
              valueStyle={{ color: '#999' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="審査中"
              value={statistics.pending}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 検索フィルター */}
      <div style={{ marginBottom: 24 }}>
        <SearchFilter
          onSearch={handleSearch}
          onReset={handleSearchReset}
          loading={isLoading}
        />
      </div>

      {/* テーブル */}
      <Card>
        <EnhancedTable
          columns={columns}
          dataSource={partners}
          loading={isLoading}
          rowKey="id"
          onRefresh={loadData}
          onBulkAction={handleBulkAction}
          exportFileName="business_partners"
          showBulkActions={true}
        />
      </Card>
    </div>
  );
};

export default BusinessPartnerListEnhanced;
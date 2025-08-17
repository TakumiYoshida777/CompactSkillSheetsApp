import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Checkbox,
  Badge,
  Space,
  Spin,
  Alert,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Typography,
} from 'antd';
import {
  SendOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useOfferBoard } from '@/hooks/useOfferBoard';
import { useOfferStore } from '@/stores/offerStore';
import { OfferDialog } from './OfferDialog';
import { OfferSummary } from './OfferSummary';
import { EngineerCard } from './EngineerCard';
import type { ColumnsType } from 'antd/es/table';
import type { Engineer, OfferStatus } from '@/types/offer';
import styles from './OfferBoard.module.css';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

export const OfferBoard: React.FC = () => {
  const { data: boardData, isLoading, error } = useOfferBoard();
  const {
    selectedEngineers,
    toggleEngineer,
    selectAllEngineers,
    clearSelection,
  } = useOfferStore();

  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OfferStatus | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('ascend');

  // レスポンシブ対応
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 576;
  const isTablet = windowWidth >= 576 && windowWidth < 992;
  const isDesktop = windowWidth >= 992;

  // フィルタリング処理
  const filteredEngineers = useMemo(() => {
    if (!boardData?.engineers) return [];

    let filtered = [...boardData.engineers];

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.offerStatus === statusFilter);
    }

    // スキルフィルター
    if (skillFilter) {
      filtered = filtered.filter(e =>
        e.skills.some(skill =>
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }

    // 稼働可能時期フィルター
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(e => {
        if (availabilityFilter === 'immediate') {
          return e.availability === '即日';
        } else if (availabilityFilter === 'within2weeks') {
          return e.availability === '即日' || e.availability === '2週間後';
        } else if (availabilityFilter === 'within1month') {
          return e.availability !== '1ヶ月以上';
        }
        return true;
      });
    }

    // ソート処理
    if (sortField) {
      filtered.sort((a, b) => {
        let compareResult = 0;
        switch (sortField) {
          case 'name':
            compareResult = a.name.localeCompare(b.name);
            break;
          case 'experience':
            compareResult = a.experience - b.experience;
            break;
          case 'hourlyRate':
            compareResult = a.hourlyRate - b.hourlyRate;
            break;
          default:
            break;
        }
        return sortOrder === 'ascend' ? compareResult : -compareResult;
      });
    }

    return filtered;
  }, [boardData?.engineers, statusFilter, skillFilter, availabilityFilter, sortField, sortOrder]);

  const handleSelectAll = () => {
    const allIds = filteredEngineers.map(e => e.id);
    selectAllEngineers(allIds);
  };

  const getStatusColor = (status: OfferStatus) => {
    switch (status) {
      case 'none':
        return 'default';
      case 'sent':
        return 'processing';
      case 'opened':
        return 'warning';
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'declined':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: OfferStatus) => {
    switch (status) {
      case 'none':
        return '未送信';
      case 'sent':
        return '送信済み';
      case 'opened':
        return '開封済み';
      case 'pending':
        return '検討中';
      case 'accepted':
        return '承諾';
      case 'declined':
        return '辞退';
      default:
        return '-';
    }
  };

  const columns: ColumnsType<Engineer> = [
    {
      title: '',
      dataIndex: 'select',
      key: 'select',
      width: 50,
      fixed: 'left',
      render: (_, record) => (
        <Checkbox
          checked={selectedEngineers.includes(record.id)}
          onChange={() => toggleEngineer(record.id)}
        />
      ),
    },
    {
      title: 'エンジニア名',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (name, record) => (
        <div data-testid="engineer-name">
          <strong>{name}</strong>
          <div className="text-gray-500 text-sm">
            {record.skills.slice(0, 3).join(', ')}
          </div>
        </div>
      ),
    },
    {
      title: '経験年数',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
      sorter: true,
      render: (exp) => <span data-testid="engineer-experience">{exp}年</span>,
    },
    {
      title: '単価',
      dataIndex: 'hourlyRate',
      key: 'hourlyRate',
      width: 120,
      sorter: true,
      render: (rate) => (
        <span data-testid="engineer-rate">¥{rate.toLocaleString()}</span>
      ),
    },
    {
      title: '稼働可能時期',
      dataIndex: 'availability',
      key: 'availability',
      width: 120,
    },
    {
      title: 'オファー状況',
      dataIndex: 'offerStatus',
      key: 'offerStatus',
      width: 120,
      render: (status) => (
        <Badge
          status={getStatusColor(status)}
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: '最終オファー日',
      dataIndex: 'lastOfferDate',
      key: 'lastOfferDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('ja-JP') : '-',
    },
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order || 'ascend');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" data-testid="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="エラー"
        description="データの取得に失敗しました"
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className={styles.offerBoard}>
      {/* サマリーカード */}
      <OfferSummary data={boardData?.summary} />

      {/* フィルターバー */}
      <Card className={styles.filterBar}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="オファーステータス"
              value={statusFilter}
              onChange={setStatusFilter}
              data-testid="status-filter"
            >
              <Option value="all">すべて</Option>
              <Option value="none">未送信</Option>
              <Option value="sent">送信済み</Option>
              <Option value="opened">開封済み</Option>
              <Option value="pending">検討中</Option>
              <Option value="accepted">承諾</Option>
              <Option value="declined">辞退</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="スキルで検索"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="稼働可能時期"
              value={availabilityFilter}
              onChange={setAvailabilityFilter}
              data-testid="availability-filter"
            >
              <Option value="all">すべて</Option>
              <Option value="immediate">即日</Option>
              <Option value="within2weeks">2週間以内</Option>
              <Option value="within1month">1ヶ月以内</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button icon={<FilterOutlined />}>
                詳細フィルター
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* エンジニア一覧 */}
      <Card
        title={
          <div className={styles.cardHeader}>
            <Title level={4}>オファー可能エンジニア一覧</Title>
            {selectedEngineers.length > 0 && (
              <span className={styles.selectedCount}>
                {selectedEngineers.length}名選択中
              </span>
            )}
          </div>
        }
        extra={
          <Space>
            <Button onClick={handleSelectAll}>全て選択</Button>
            <Button onClick={clearSelection} disabled={selectedEngineers.length === 0}>
              選択をクリア
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              disabled={selectedEngineers.length === 0}
              onClick={() => setShowOfferDialog(true)}
            >
              選択したエンジニアにオファー送信
            </Button>
          </Space>
        }
      >
        {/* デスクトップビュー */}
        {isDesktop && (
          <div data-testid="desktop-view">
            <Table
              columns={columns}
              dataSource={filteredEngineers}
              rowKey="id"
              onChange={handleTableChange}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `全${total}件`,
              }}
              scroll={{ x: 1200 }}
            />
          </div>
        )}

        {/* タブレットビュー */}
        {isTablet && (
          <div data-testid="tablet-view">
            <Table
              columns={columns.filter(col => 
                ['select', 'name', 'experience', 'offerStatus'].includes(col.key as string)
              )}
              dataSource={filteredEngineers}
              rowKey="id"
              pagination={{
                pageSize: 10,
                simple: true,
              }}
            />
          </div>
        )}

        {/* モバイルビュー */}
        {isMobile && (
          <div data-testid="mobile-view">
            {filteredEngineers.map((engineer) => (
              <EngineerCard
                key={engineer.id}
                engineer={engineer}
                selected={selectedEngineers.includes(engineer.id)}
                onToggle={() => toggleEngineer(engineer.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* オファー送信ダイアログ */}
      <OfferDialog
        visible={showOfferDialog}
        onClose={() => setShowOfferDialog(false)}
        selectedEngineers={selectedEngineers}
        engineers={filteredEngineers.filter(e => selectedEngineers.includes(e.id))}
      />
    </div>
  );
};

export default OfferBoard;
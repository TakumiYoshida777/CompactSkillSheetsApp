import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  DatePicker,
  Select,
  Input,
  Row,
  Col,
  Typography,
  Timeline,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import styles from './OfferHistory.module.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const OfferHistory: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  // モックデータ
  const mockData = [
    {
      id: '1',
      offerNumber: 'OFF-2024-087',
      projectName: 'AIチャットボット開発',
      engineerCount: 2,
      status: 'accepted',
      sentDate: '2024-12-01',
      responseDate: '2024-12-05',
      startDate: '2025-01-01',
      company: 'XYZテック株式会社',
    },
    {
      id: '2',
      offerNumber: 'OFF-2024-086',
      projectName: 'モバイルアプリ開発',
      engineerCount: 3,
      status: 'declined',
      sentDate: '2024-11-28',
      responseDate: '2024-11-30',
      startDate: '-',
      company: 'ABCソフト株式会社',
    },
    {
      id: '3',
      offerNumber: 'OFF-2024-085',
      projectName: 'データ分析基盤構築',
      engineerCount: 1,
      status: 'accepted',
      sentDate: '2024-11-20',
      responseDate: '2024-11-25',
      startDate: '2024-12-15',
      company: 'データサイエンス株式会社',
    },
  ];

  const columns = [
    {
      title: 'オファー番号',
      dataIndex: 'offerNumber',
      key: 'offerNumber',
    },
    {
      title: '案件名',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'SES企業',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: '対象人数',
      dataIndex: 'engineerCount',
      key: 'engineerCount',
      render: (count: number) => `${count}名`,
    },
    {
      title: '結果',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
          accepted: { 
            color: 'green', 
            text: '成約',
            icon: <CheckCircleOutlined />
          },
          declined: { 
            color: 'red', 
            text: '辞退',
            icon: <CloseCircleOutlined />
          },
          withdrawn: { 
            color: 'gray', 
            text: '取下げ',
            icon: <ClockCircleOutlined />
          },
        };
        return (
          <Tag color={statusMap[status]?.color} icon={statusMap[status]?.icon}>
            {statusMap[status]?.text}
          </Tag>
        );
      },
    },
    {
      title: '送信日',
      dataIndex: 'sentDate',
      key: 'sentDate',
    },
    {
      title: '返答日',
      dataIndex: 'responseDate',
      key: 'responseDate',
    },
    {
      title: '開始日',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'アクション',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<FileTextOutlined />} size="small">
            詳細
          </Button>
        </Space>
      ),
    },
  ];

  // 成約率の計算
  const acceptedCount = mockData.filter(item => item.status === 'accepted').length;
  const totalCount = mockData.length;
  const acceptanceRate = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

  return (
    <div className={styles.container}>
      <Title level={2}>オファー履歴</Title>

      {/* 統計情報 */}
      <Row gutter={[16, 16]} className={styles.statistics}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="総オファー数"
              value={mockData.length}
              suffix="件"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="成約数"
              value={acceptedCount}
              suffix="件"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="成約率"
              value={acceptanceRate}
              suffix="%"
              valueStyle={{ color: acceptanceRate > 50 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* フィルター */}
      <Card className={styles.filterCard}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['開始日', '終了日']}
              prefix={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="ステータス"
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">すべて</Option>
              <Option value="accepted">成約</Option>
              <Option value="declined">辞退</Option>
              <Option value="withdrawn">取下げ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="案件名で検索"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />}>
                検索
              </Button>
              <Button icon={<DownloadOutlined />}>
                エクスポート
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 履歴テーブル */}
      <Card title="オファー履歴一覧">
        <Table 
          columns={columns} 
          dataSource={mockData} 
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `全${total}件`,
          }}
        />
      </Card>

      {/* タイムライン表示（オプション） */}
      <Card title="最近のオファー活動" className={styles.timelineCard}>
        <Timeline
          items={[
            {
              color: 'green',
              children: (
                <>
                  <p>AIチャットボット開発案件が成約しました</p>
                  <p className={styles.timelineDate}>2024-12-05</p>
                </>
              ),
            },
            {
              color: 'red',
              children: (
                <>
                  <p>モバイルアプリ開発案件が辞退されました</p>
                  <p className={styles.timelineDate}>2024-11-30</p>
                </>
              ),
            },
            {
              color: 'green',
              children: (
                <>
                  <p>データ分析基盤構築案件が成約しました</p>
                  <p className={styles.timelineDate}>2024-11-25</p>
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default OfferHistory;
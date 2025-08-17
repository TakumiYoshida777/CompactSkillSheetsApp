import React from 'react';
import { Card, Table, Tag, Space, Button, Badge, Statistic, Row, Col, Typography } from 'antd';
import {
  EyeOutlined,
  MailOutlined,
  StopOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import styles from './OfferManagement.module.css';

const { Title } = Typography;

const OfferManagement: React.FC = () => {
  // モックデータ
  const mockData = [
    {
      id: '1',
      offerNumber: 'OFF-2025-001',
      projectName: 'ECサイトリニューアル',
      engineerCount: 3,
      status: 'pending',
      sentDate: '2025-01-15',
      responseRate: 67,
      acceptedCount: 1,
      pendingCount: 1,
      declinedCount: 1,
    },
    {
      id: '2',
      offerNumber: 'OFF-2025-002',
      projectName: '基幹システム改修',
      engineerCount: 5,
      status: 'sent',
      sentDate: '2025-01-17',
      responseRate: 0,
      acceptedCount: 0,
      pendingCount: 0,
      declinedCount: 0,
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
      title: '対象人数',
      dataIndex: 'engineerCount',
      key: 'engineerCount',
      render: (count: number) => `${count}名`,
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          sent: { color: 'blue', text: '送信済み' },
          pending: { color: 'orange', text: '返答待ち' },
          accepted: { color: 'green', text: '承諾' },
          declined: { color: 'red', text: '辞退' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
    {
      title: '送信日',
      dataIndex: 'sentDate',
      key: 'sentDate',
    },
    {
      title: '返答率',
      dataIndex: 'responseRate',
      key: 'responseRate',
      render: (rate: number) => (
        <Badge
          count={`${rate}%`}
          style={{ backgroundColor: rate > 50 ? '#52c41a' : '#faad14' }}
        />
      ),
    },
    {
      title: 'アクション',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} size="small">
            詳細
          </Button>
          <Button icon={<MailOutlined />} size="small">
            リマインド
          </Button>
          <Button icon={<StopOutlined />} size="small" danger>
            取下げ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Title level={2}>オファー管理</Title>

      {/* 統計カード */}
      <Row gutter={[16, 16]} className={styles.statistics}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="アクティブオファー"
              value={12}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="返答待ち"
              value={8}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今週の承諾"
              value={3}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均返答率"
              value={65}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* オファー一覧 */}
      <Card
        title="アクティブオファー一覧"
        extra={
          <Button type="primary" icon={<ReloadOutlined />}>
            更新
          </Button>
        }
      >
        <Table columns={columns} dataSource={mockData} rowKey="id" />
      </Card>
    </div>
  );
};

export default OfferManagement;
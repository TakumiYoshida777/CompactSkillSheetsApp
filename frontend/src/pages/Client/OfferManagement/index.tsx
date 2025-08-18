import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, Badge, Statistic, Row, Col, Typography, Alert, List } from 'antd';
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
  // レスポンシブ対応
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ブレークポイント（要件定義書準拠）
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1366;
  const isDesktop = windowWidth >= 1366;

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
        title={<Title level={isMobile ? 5 : 4}>アクティブオファー一覧</Title>}
        extra={
          !isMobile && (
            <Button type="primary" icon={<ReloadOutlined />}>
              更新
            </Button>
          )
        }
      >
        {/* タブレット警告 */}
        {isTablet && (
          <Alert
            message="タブレット表示"
            description="タブレットでは参照機能のみ利用可能です。編集はPC版をご利用ください。"
            type="info"
            showIcon
            className={styles.tabletAlert}
          />
        )}

        {/* デスクトップビュー */}
        {isDesktop && (
          <Table 
            columns={columns} 
            dataSource={mockData} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `全${total}件`,
            }}
            scroll={{ x: 'max-content' }}
          />
        )}

        {/* タブレットビュー */}
        {isTablet && (
          <Table 
            columns={columns.filter(col => 
              ['offerNumber', 'projectName', 'status', 'responseRate'].includes(col.key as string)
            )} 
            dataSource={mockData} 
            rowKey="id"
            pagination={{
              pageSize: 10,
              simple: true,
            }}
            scroll={{ x: 'max-content' }}
          />
        )}

        {/* モバイルビュー */}
        {isMobile && (
          <List
            dataSource={mockData}
            renderItem={(item) => (
              <Card className={styles.mobileCard}>
                <div className={styles.mobileHeader}>
                  <Tag color={item.status === 'pending' ? 'orange' : 'blue'}>
                    {item.status === 'pending' ? '返答待ち' : '送信済み'}
                  </Tag>
                  <span className={styles.offerNumber}>{item.offerNumber}</span>
                </div>
                <div className={styles.mobileBody}>
                  <h4>{item.projectName}</h4>
                  <div className={styles.mobileInfo}>
                    <span>対象: {item.engineerCount}名</span>
                    <span>送信日: {item.sentDate}</span>
                  </div>
                  <div className={styles.mobileStats}>
                    <Badge
                      count={`返答率 ${item.responseRate}%`}
                      style={{ backgroundColor: item.responseRate > 50 ? '#52c41a' : '#faad14' }}
                    />
                  </div>
                  <div className={styles.mobileActions}>
                    <Button icon={<EyeOutlined />} size="middle" block>
                      詳細を見る
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default OfferManagement;
import { Row, Col, Card, Statistic, Progress, Button, Space, Spin, Alert, Badge, List, Tag } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  SendOutlined,
  BellOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDashboardData, useEngineerStatistics, useApproachStatistics } from '../../hooks/queries/useDashboardQueries';
import { useUnreadCount } from '../../hooks/queries/useNotificationQueries';
import { useEffect } from 'react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // API連携フック
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useDashboardData();
  const { data: engineerStats, isLoading: engineerLoading } = useEngineerStatistics();
  const { data: approachStats, isLoading: approachLoading } = useApproachStatistics();
  const { data: unreadCount } = useUnreadCount();
  
  // 30秒ごとにデータを更新
  useEffect(() => {
    const interval = setInterval(() => {
      refetchDashboard();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetchDashboard]);
  
  const loading = dashboardLoading || engineerLoading || approachLoading;
  const error = dashboardError;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="エラー"
        description="データの取得に失敗しました。ページを更新してください。"
        type="error"
        showIcon
      />
    );
  }

  if (!dashboardData) {
    return null;
  }
  
  // パーセンテージ計算
  const engineerActivePercent = dashboardData.kpi.totalEngineers > 0 
    ? Math.round((dashboardData.kpi.activeEngineers / dashboardData.kpi.totalEngineers) * 100)
    : 0;
  const engineerWaitingPercent = dashboardData.kpi.totalEngineers > 0
    ? Math.round((dashboardData.kpi.waitingEngineers / dashboardData.kpi.totalEngineers) * 100)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">エンジニアスキルシート管理システムの概要</p>
      </div>

      {/* KPIカード */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="エンジニア総数"
              value={dashboardData.kpi.totalEngineers}
              prefix={<TeamOutlined />}
            />
            <Progress 
              percent={75} 
              strokeColor="#52c41a" 
              showInfo={false} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="稼働中"
              value={dashboardData.kpi.activeEngineers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={engineerActivePercent} 
              strokeColor="#52c41a" 
              showInfo={false} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待機中"
              value={dashboardData.kpi.waitingEngineers}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress 
              percent={engineerWaitingPercent} 
              strokeColor="#faad14" 
              showInfo={false} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="月間売上予測"
              value={dashboardData.kpi.monthlyRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
            />
            <div className="mt-2">
              <span className="text-gray-500 text-sm">成約率: </span>
              <span className="text-green-500 font-bold">{dashboardData.kpi.acceptanceRate}%</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* アプローチ統計 */}
        <Col xs={24} md={12}>
          <Card title="今月のアプローチ活動">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="アプローチ数"
                  value={dashboardData.approaches.current}
                  prefix={<SendOutlined />}
                  suffix={
                    dashboardData.approaches.growth > 0 && (
                      <span className="text-green-500 text-sm">
                        <ArrowUpOutlined /> {dashboardData.approaches.growth}%
                      </span>
                    )
                  }
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="先月比"
                  value={dashboardData.approaches.previous}
                  suffix="件"
                  valueStyle={{ color: dashboardData.approaches.growth >= 0 ? '#52c41a' : '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 最近のアクティビティ */}
        <Col xs={24} md={12}>
          <Card 
            title="最近のアクティビティ"
            extra={
              <Badge count={unreadCount || 0}>
                <BellOutlined style={{ fontSize: '18px' }} />
              </Badge>
            }
          >
            <List
              size="small"
              dataSource={dashboardData.recentActivities.slice(0, 5)}
              renderItem={(activity) => (
                <List.Item>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {activity.type === 'approach' ? (
                        <SendOutlined className="text-blue-500" />
                      ) : activity.type === 'project' ? (
                        <CheckCircleOutlined className="text-green-500" />
                      ) : (
                        <BellOutlined className="text-gray-500" />
                      )}
                      <span className="text-sm">{activity.title}</span>
                    </div>
                    <Tag color={activity.status === 'active' ? 'green' : 'orange'}>
                      {activity.status}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 統計情報 */}
      {engineerStats && approachStats && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={12}>
            <Card title="スキル分布TOP5">
              <List
                size="small"
                dataSource={engineerStats.skillDistribution.slice(0, 5)}
                renderItem={(skill) => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <span>{skill.skillName}</span>
                      <Badge count={skill.count} showZero color="blue" />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="取引先TOP3">
              <List
                size="small"
                dataSource={approachStats.topClients.slice(0, 3)}
                renderItem={(client, index) => (
                  <List.Item>
                    <div className="flex justify-between w-full">
                      <span>
                        <span className="font-bold mr-2">{index + 1}.</span>
                        {client.clientName}
                      </span>
                      <span className="text-blue-500 font-bold">{client.count}件</span>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}
      
      {/* クイックアクション */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card title="クイックアクション">
            <Space size="large" wrap>
              <Button 
                type="primary" 
                icon={<UserOutlined />} 
                size="large"
                onClick={() => navigate('engineers/register')}
              >
                エンジニア登録
              </Button>
              <Button 
                icon={<SendOutlined />} 
                size="large"
                onClick={() => navigate('approaches/create')}
              >
                アプローチ作成
              </Button>
              <Button 
                icon={<TeamOutlined />} 
                size="large"
                onClick={() => navigate('engineers')}
              >
                エンジニア一覧
              </Button>
              <Button
                icon={<SyncOutlined />}
                size="large"
                onClick={() => refetchDashboard()}
                loading={loading}
              >
                データ更新
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
import { Row, Col, Card, Statistic, Progress, Button, Space, Spin, Alert } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    stats,
    loading,
    error,
    engineerActivePercent,
    engineerWaitingPercent,
    engineerWaitingScheduledPercent,
  } = useDashboardStats();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="データを読み込み中..." />
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

  if (!stats) {
    return null;
  }

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
              value={stats.engineers.total}
              prefix={<TeamOutlined />}
              suffix={
                stats.engineers.totalChange > 0 && (
                  <span className="text-green-500 text-sm">
                    <ArrowUpOutlined /> {stats.engineers.totalChange}
                  </span>
                )
              }
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
              value={stats.engineers.active}
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
              value={stats.engineers.waiting}
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
              title="待機予定"
              value={stats.engineers.waitingScheduled}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress 
              percent={engineerWaitingScheduledPercent} 
              strokeColor="#1890ff" 
              showInfo={false} 
            />
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
                  value={stats.approaches.monthlyCount}
                  prefix={<SendOutlined />}
                  suffix={
                    stats.approaches.monthlyChange > 0 && (
                      <span className="text-green-500 text-sm">
                        <ArrowUpOutlined /> {stats.approaches.monthlyChange}
                      </span>
                    )
                  }
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="成約率"
                  value={stats.approaches.successRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* スキルシート更新状況 */}
        <Col xs={24} md={12}>
          <Card title="スキルシート更新状況">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="今月更新"
                  value={stats.skillSheets.monthlyUpdated}
                  suffix="件"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="要更新"
                  value={stats.skillSheets.needsUpdate}
                  suffix="件"
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* クイックアクション */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card title="クイックアクション">
            <Space size="large" wrap>
              <Button 
                type="primary" 
                icon={<UserOutlined />} 
                size="large"
                onClick={() => navigate('/engineers/new')}
              >
                エンジニア登録
              </Button>
              <Button 
                icon={<SendOutlined />} 
                size="large"
                onClick={() => navigate('/approaches/create')}
              >
                アプローチ作成
              </Button>
              <Button 
                icon={<TeamOutlined />} 
                size="large"
                onClick={() => navigate('/engineers/list')}
              >
                エンジニア一覧
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
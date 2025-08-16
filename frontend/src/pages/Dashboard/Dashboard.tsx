import React from 'react';
import { Row, Col, Card, Statistic, Progress, Button, Space } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

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
              value={120}
              prefix={<TeamOutlined />}
              suffix={
                <span className="text-green-500 text-sm">
                  <ArrowUpOutlined /> 5
                </span>
              }
            />
            <Progress percent={75} strokeColor="#52c41a" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="稼働中"
              value={105}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={87.5} strokeColor="#52c41a" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待機中"
              value={10}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress percent={8.3} strokeColor="#faad14" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待機予定"
              value={5}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={4.2} strokeColor="#1890ff" showInfo={false} />
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
                  value={25}
                  prefix={<SendOutlined />}
                  suffix={
                    <span className="text-green-500 text-sm">
                      <ArrowUpOutlined /> 8
                    </span>
                  }
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="成約率"
                  value={32}
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
                  value={45}
                  suffix="件"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="要更新"
                  value={12}
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
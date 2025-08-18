import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import {
  SendOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import styles from './OfferBoard.module.css';

interface OfferSummaryProps {
  data?: {
    totalOffers: number;
    monthlyOffers: number;
    weeklyOffers: number;
    todayOffers: number;
    pendingResponses: number;
    acceptanceRate: number;
  };
}

export const OfferSummary: React.FC<OfferSummaryProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className={styles.summarySection}>
      <Card title="オファー統計" className={styles.summaryCard}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="総オファー数"
              value={data.totalOffers}
              suffix="件"
              prefix={<SendOutlined />}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="今月"
              value={`今月: ${data.monthlyOffers}件`}
              valueStyle={{ fontSize: '16px' }}
              prefix={<CalendarOutlined />}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="今週"
              value={data.weeklyOffers}
              suffix="件"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="本日"
              value={data.todayOffers}
              suffix="件"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="返答待ち"
              value={data.pendingResponses}
              suffix="件"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <div className={styles.acceptanceRate}>
              <div className={styles.rateLabel}>承諾率: {data.acceptanceRate}%</div>
              <Progress
                percent={data.acceptanceRate}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                status="active"
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} className={styles.quickStats}>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="アクティブオファー"
              value={data.monthlyOffers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="今週の承諾"
              value={Math.floor(data.weeklyOffers * data.acceptanceRate / 100)}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="返答率"
              value={85}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="平均返答時間"
              value="2.5"
              suffix="日"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
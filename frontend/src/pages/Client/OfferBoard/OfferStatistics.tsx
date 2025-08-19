import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  TeamOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import type { OfferBoardData } from '@/types/offer';

interface OfferStatisticsProps {
  boardData: OfferBoardData | null;
  selectedCount: number;
  isMobile?: boolean;
}

/**
 * オファーボードの統計情報コンポーネント
 */
export const OfferStatistics: React.FC<OfferStatisticsProps> = ({
  boardData,
  selectedCount,
  isMobile = false,
}) => {
  if (!boardData) return null;

  const stats = boardData.statistics || {
    totalEngineers: 0,
    availableEngineers: 0,
    offeredEngineers: 0,
    acceptedOffers: 0,
    offerAcceptanceRate: 0,
  };

  const statisticsData = [
    {
      title: '全エンジニア',
      value: stats.totalEngineers,
      icon: <TeamOutlined />,
      color: '#1890ff',
    },
    {
      title: '利用可能',
      value: stats.availableEngineers,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: 'オファー済み',
      value: stats.offeredEngineers,
      icon: <SendOutlined />,
      color: '#faad14',
    },
    {
      title: '承諾率',
      value: `${Math.round(stats.offerAcceptanceRate)}%`,
      icon: <PercentageOutlined />,
      color: '#eb2f96',
    },
    {
      title: '選択中',
      value: selectedCount,
      icon: <ClockCircleOutlined />,
      color: '#722ed1',
    },
  ];

  if (isMobile) {
    // モバイル用の2列レイアウト
    return (
      <Row gutter={[8, 8]}>
        {statisticsData.map((stat, index) => (
          <Col key={index} span={12}>
            <Card size="small" bodyStyle={{ padding: '12px' }}>
              <Statistic
                title={<span style={{ fontSize: '12px' }}>{stat.title}</span>}
                value={stat.value}
                prefix={React.cloneElement(stat.icon, { 
                  style: { color: stat.color, fontSize: '16px' } 
                })}
                valueStyle={{ fontSize: '18px', color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  // デスクトップ用のレイアウト
  return (
    <Row gutter={16}>
      {statisticsData.map((stat, index) => (
        <Col key={index} xs={12} sm={8} md={4} lg={4} xl={4}>
          <Card bordered={false}>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={React.cloneElement(stat.icon, { 
                style: { color: stat.color } 
              })}
              valueStyle={{ color: stat.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};
import React from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Tabs,
  Timeline,
  Space,
  Typography,
  Badge,
  Avatar,
  Statistic,
  Row,
  Col,
  Button,
  Empty,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { BusinessPartner, ApproachHistory } from '../businessPartnerMockData';
import { getStatusColor, getStatusText } from '../businessPartnerMockData';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface BusinessPartnerDetailDrawerProps {
  visible: boolean;
  partner: BusinessPartner | null;
  onClose: () => void;
}

const BusinessPartnerDetailDrawer: React.FC<BusinessPartnerDetailDrawerProps> = ({
  visible,
  partner,
  onClose,
}) => {
  if (!partner) return null;

  const getApproachIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MailOutlined />;
      case 'phone':
        return <PhoneOutlined />;
      case 'meeting':
        return <TeamOutlined />;
      default:
        return <SendOutlined />;
    }
  };

  const getApproachStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'green';
      case 'rejected':
        return 'red';
      case 'replied':
        return 'blue';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <BankOutlined />
          {partner.name}
        </Space>
      }
      placement="right"
      width={720}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button type="primary">編集</Button>
          <Button>削除</Button>
        </Space>
      }
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="基本情報" key="1">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="会社名" span={2}>
              {partner.name}
            </Descriptions.Item>
            <Descriptions.Item label="業界">
              {partner.industry}
            </Descriptions.Item>
            <Descriptions.Item label="従業員数">
              {partner.employees}名
            </Descriptions.Item>
            <Descriptions.Item label="設立">
              {partner.established}
            </Descriptions.Item>
            <Descriptions.Item label="資本金">
              {partner.capital}
            </Descriptions.Item>
            <Descriptions.Item label="Webサイト" span={2}>
              <a href={partner.website} target="_blank" rel="noopener noreferrer">
                {partner.website}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="ステータス">
              <Tag color={getStatusColor(partner.status)}>
                {getStatusText(partner.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="アプローチ回数">
              {partner.approachCount}回
            </Descriptions.Item>
            <Descriptions.Item label="最終連絡">
              {partner.lastContact}
            </Descriptions.Item>
            <Descriptions.Item label="次回連絡">
              {partner.nextContact}
            </Descriptions.Item>
            <Descriptions.Item label="売上高">
              ¥{partner.salesAmount.toLocaleString()}万
            </Descriptions.Item>
            <Descriptions.Item label="タグ" span={2}>
              <Space wrap>
                {partner.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="備考" span={2}>
              {partner.notes}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
        
        <TabPane tab="担当者情報" key="2">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="担当者名">
              <Space>
                <Avatar icon={<UserOutlined />} />
                {partner.contact.name}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="部署">
              {partner.contact.department}
            </Descriptions.Item>
            <Descriptions.Item label="メールアドレス">
              <a href={`mailto:${partner.contact.email}`}>
                {partner.contact.email}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="電話番号">
              <a href={`tel:${partner.contact.phone}`}>
                {partner.contact.phone}
              </a>
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
        
        <TabPane tab="アプローチ履歴" key="3">
          {partner.approaches && partner.approaches.length > 0 ? (
            <Timeline>
              {partner.approaches.map((approach: ApproachHistory) => (
                <Timeline.Item
                  key={approach.id}
                  dot={getApproachIcon(approach.type)}
                  color={getApproachStatusColor(approach.status)}
                >
                  <Space direction="vertical" size="small">
                    <Space>
                      <Text strong>{approach.date}</Text>
                      <Tag color={getApproachStatusColor(approach.status)}>
                        {approach.status}
                      </Tag>
                    </Space>
                    <Text>{approach.subject}</Text>
                    {approach.engineerCount && (
                      <Text type="secondary">
                        提案エンジニア数: {approach.engineerCount}名
                      </Text>
                    )}
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="アプローチ履歴がありません" />
          )}
        </TabPane>
        
        <TabPane tab="統計" key="4">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="月間売上"
                value={partner.salesAmount || 0}
                prefix="¥"
                suffix="万"
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="アプローチ回数"
                value={partner.approachCount || 0}
                suffix="回"
              />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export default BusinessPartnerDetailDrawer;
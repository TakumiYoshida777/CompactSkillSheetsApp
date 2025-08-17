import React from 'react';
import { Card, Checkbox, Tag, Badge, Space, Typography } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { Engineer } from '@/types/offer';
import styles from './OfferBoard.module.css';

const { Text, Title } = Typography;

interface EngineerCardProps {
  engineer: Engineer;
  selected: boolean;
  onToggle: () => void;
}

export const EngineerCard: React.FC<EngineerCardProps> = ({
  engineer,
  selected,
  onToggle,
}) => {
  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <Card
      className={`${styles.engineerCard} ${selected ? styles.selected : ''}`}
      onClick={onToggle}
    >
      <div className={styles.cardHeader}>
        <Checkbox checked={selected} />
        <Title level={5} className={styles.engineerName}>
          <UserOutlined /> {engineer.name}
        </Title>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <Text type="secondary">経験年数:</Text>
          <Text strong>{engineer.experience}年</Text>
        </div>

        <div className={styles.infoRow}>
          <Text type="secondary">単価:</Text>
          <Text strong>
            <DollarOutlined /> ¥{engineer.hourlyRate.toLocaleString()}/時
          </Text>
        </div>

        <div className={styles.infoRow}>
          <Text type="secondary">稼働可能:</Text>
          <Text>
            <ClockCircleOutlined /> {engineer.availability}
          </Text>
        </div>

        <div className={styles.skillTags}>
          {engineer.skills.slice(0, 3).map((skill, index) => (
            <Tag key={index} color="blue">
              {skill}
            </Tag>
          ))}
          {engineer.skills.length > 3 && (
            <Tag>+{engineer.skills.length - 3}</Tag>
          )}
        </div>

        <div className={styles.statusSection}>
          <Badge
            status={getStatusColor(engineer.offerStatus)}
            text={getStatusText(engineer.offerStatus)}
          />
          {engineer.lastOfferDate && (
            <Text type="secondary" className={styles.lastOfferDate}>
              <CalendarOutlined /> 最終オファー: {new Date(engineer.lastOfferDate).toLocaleDateString('ja-JP')}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};
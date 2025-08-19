import React from 'react';
import { Row, Col, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { OfferStatus } from '@/types/offer';

const { Search } = Input;
const { Option } = Select;

interface OfferFiltersProps {
  statusFilter: OfferStatus | 'all';
  skillFilter: string;
  availabilityFilter: string;
  onStatusChange: (status: OfferStatus | 'all') => void;
  onSkillChange: (skill: string) => void;
  onAvailabilityChange: (availability: string) => void;
  onClearFilters?: () => void;
  isMobile?: boolean;
}

/**
 * オファーボードのフィルターコンポーネント
 */
export const OfferFilters: React.FC<OfferFiltersProps> = ({
  statusFilter,
  skillFilter,
  availabilityFilter,
  onStatusChange,
  onSkillChange,
  onAvailabilityChange,
  onClearFilters,
  isMobile = false,
}) => {
  const handleClearFilters = () => {
    onStatusChange('all');
    onSkillChange('');
    onAvailabilityChange('all');
    onClearFilters?.();
  };

  if (isMobile) {
    // モバイル用のコンパクトなレイアウト
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Search
          placeholder="スキルで検索"
          value={skillFilter}
          onChange={(e) => onSkillChange(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Row gutter={8}>
          <Col span={12}>
            <Select
              value={statusFilter}
              onChange={onStatusChange}
              style={{ width: '100%' }}
              placeholder="ステータス"
            >
              <Option value="all">全て</Option>
              <Option value="none">未送信</Option>
              <Option value="sent">送信済み</Option>
              <Option value="opened">開封済み</Option>
              <Option value="pending">検討中</Option>
              <Option value="accepted">承諾</Option>
              <Option value="declined">辞退</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Select
              value={availabilityFilter}
              onChange={onAvailabilityChange}
              style={{ width: '100%' }}
              placeholder="稼働時期"
            >
              <Option value="all">全て</Option>
              <Option value="immediate">即日</Option>
              <Option value="within2weeks">2週間以内</Option>
              <Option value="within1month">1ヶ月以内</Option>
            </Select>
          </Col>
        </Row>
      </Space>
    );
  }

  // デスクトップ用のレイアウト
  return (
    <Row gutter={[16, 16]} align="middle">
      <Col xs={24} sm={12} md={6}>
        <Search
          placeholder="スキルで検索"
          value={skillFilter}
          onChange={(e) => onSkillChange(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
        />
      </Col>
      <Col xs={24} sm={12} md={5}>
        <Select
          value={statusFilter}
          onChange={onStatusChange}
          style={{ width: '100%' }}
          placeholder="ステータスで絞り込み"
        >
          <Option value="all">全てのステータス</Option>
          <Option value="none">未送信</Option>
          <Option value="sent">送信済み</Option>
          <Option value="opened">開封済み</Option>
          <Option value="pending">検討中</Option>
          <Option value="accepted">承諾</Option>
          <Option value="declined">辞退</Option>
        </Select>
      </Col>
      <Col xs={24} sm={12} md={5}>
        <Select
          value={availabilityFilter}
          onChange={onAvailabilityChange}
          style={{ width: '100%' }}
          placeholder="稼働可能時期"
        >
          <Option value="all">全ての期間</Option>
          <Option value="immediate">即日</Option>
          <Option value="within2weeks">2週間以内</Option>
          <Option value="within1month">1ヶ月以内</Option>
        </Select>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Button
          icon={<FilterOutlined />}
          onClick={handleClearFilters}
          type="default"
        >
          フィルタをクリア
        </Button>
      </Col>
    </Row>
  );
};
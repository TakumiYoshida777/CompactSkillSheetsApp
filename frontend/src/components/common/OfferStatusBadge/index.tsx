import React from 'react';
import { Badge, Tag } from 'antd';
import type { OfferStatus } from '../../../stores/offerStore';

interface OfferStatusBadgeProps {
  status: OfferStatus;
  count?: number;
  className?: string;
}

const statusConfig: Record<OfferStatus, { text: string; status: 'success' | 'processing' | 'error' | 'default' | 'warning'; color: string }> = {
  SENT: { text: '送信済み', status: 'processing', color: 'blue' },
  OPENED: { text: '開封済み', status: 'default', color: 'cyan' },
  PENDING: { text: '検討中', status: 'warning', color: 'orange' },
  ACCEPTED: { text: '承諾', status: 'success', color: 'green' },
  DECLINED: { text: '辞退', status: 'error', color: 'red' },
  WITHDRAWN: { text: '撤回', status: 'default', color: 'gray' },
};

export const OfferStatusBadge: React.FC<OfferStatusBadgeProps> = ({ status, count, className }) => {
  const config = statusConfig[status];

  if (!config) {
    return null;
  }

  const badgeElement = (
    <Badge 
      status={config.status} 
      text={config.text}
      className={`ant-badge-status-${config.status}`}
    />
  );

  if (count !== undefined) {
    return (
      <div className={className}>
        {badgeElement}
        <Tag color={config.color} style={{ marginLeft: 8 }}>
          {count}
        </Tag>
      </div>
    );
  }

  return <div className={className}>{badgeElement}</div>;
};
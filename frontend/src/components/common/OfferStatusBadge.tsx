import React from 'react';
import { Badge } from 'antd';

type OfferStatus = 'SENT' | 'OPENED' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

interface OfferStatusBadgeProps {
  status: OfferStatus;
  className?: string;
  count?: number;
}

const statusConfig: Record<OfferStatus, { text: string; status: 'processing' | 'default' | 'warning' | 'success' | 'error' }> = {
  SENT: { text: '送信済み', status: 'processing' },
  OPENED: { text: '開封済み', status: 'default' },
  PENDING: { text: '検討中', status: 'warning' },
  ACCEPTED: { text: '承諾', status: 'success' },
  DECLINED: { text: '辞退', status: 'error' },
  WITHDRAWN: { text: '撤回', status: 'default' },
};

export const OfferStatusBadge: React.FC<OfferStatusBadgeProps> = ({ status, className, count }) => {
  const config = statusConfig[status];

  return (
    <Badge
      status={config.status}
      text={
        <span className={`ant-badge-status-${config.status} ant-badge-status-text`}>
          {config.text}
          {count !== undefined && ` ${count}`}
        </span>
      }
      className={className}
    />
  );
};
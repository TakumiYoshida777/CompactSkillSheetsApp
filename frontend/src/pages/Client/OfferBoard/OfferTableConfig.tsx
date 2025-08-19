import React from 'react';
import { Checkbox, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Engineer } from '@/types/offer';
import { getStatusColor, getStatusText } from '@/utils/offerStatusUtils';

interface OfferTableConfigProps {
  selectedEngineers: string[];
  toggleEngineer: (id: string) => void;
}

/**
 * オファーボードテーブルのカラム定義を生成
 */
export const createOfferTableColumns = ({
  selectedEngineers,
  toggleEngineer,
}: OfferTableConfigProps): ColumnsType<Engineer> => {
  return [
    {
      title: '',
      dataIndex: 'select',
      key: 'select',
      width: 50,
      fixed: 'left',
      render: (_, record) => (
        <Checkbox
          checked={selectedEngineers.includes(record.id)}
          onChange={() => toggleEngineer(record.id)}
        />
      ),
    },
    {
      title: 'エンジニア名',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (name, record) => (
        <div data-testid="engineer-name">
          <strong>{name}</strong>
          <div className="text-gray-500 text-sm">
            {record.skills.slice(0, 3).join(', ')}
          </div>
        </div>
      ),
    },
    {
      title: '経験年数',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
      sorter: true,
      render: (exp) => <span data-testid="engineer-experience">{exp}年</span>,
    },
    {
      title: '単価',
      dataIndex: 'rate',
      key: 'hourlyRate',
      width: 150,
      sorter: true,
      render: (rate) => (
        <span data-testid="engineer-rate">
          {rate && rate.min && rate.max 
            ? `¥${rate.min}〜${rate.max}万/月`
            : '-'}
        </span>
      ),
    },
    {
      title: '稼働可能時期',
      dataIndex: 'availability',
      key: 'availability',
      width: 120,
    },
    {
      title: 'オファー状況',
      dataIndex: 'lastOfferStatus',
      key: 'offerStatus',
      width: 120,
      render: (status) => (
        <Badge
          status={getStatusColor(status || 'none')}
          text={getStatusText(status || 'none')}
        />
      ),
    },
    {
      title: '最終オファー日',
      dataIndex: 'lastOfferDate',
      key: 'lastOfferDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('ja-JP') : '-',
    },
  ];
};
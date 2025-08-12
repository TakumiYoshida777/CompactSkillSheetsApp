import React from 'react';
import { Table, Card, Space, Tag, Avatar, Button } from 'antd';
import { UserOutlined, MoreOutlined, EyeOutlined } from '@ant-design/icons';
import useResponsive from '../hooks/useResponsive';
import type { TableProps } from 'antd';

interface ResponsiveTableProps<T> extends TableProps<T> {
  mobileRenderItem?: (record: T) => React.ReactNode;
}

function ResponsiveTable<T extends Record<string, any>>({
  dataSource,
  columns,
  mobileRenderItem,
  ...restProps
}: ResponsiveTableProps<T>) {
  const { isMobile } = useResponsive();

  if (isMobile && mobileRenderItem) {
    return (
      <div className="space-y-3">
        {dataSource?.map((record, index) => (
          <Card key={record.key || index} className="shadow-sm">
            {mobileRenderItem(record)}
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      scroll={{ x: 'max-content' }}
      {...restProps}
    />
  );
}

export default ResponsiveTable;
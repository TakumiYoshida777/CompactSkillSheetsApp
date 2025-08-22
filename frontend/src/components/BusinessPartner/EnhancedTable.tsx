import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Dropdown,
  Menu,
  Checkbox,
  Modal,
  message,
  Tag,
  Tooltip,
  Row,
  Col,
  Select,
  InputNumber,
  Typography,
  Alert,
} from 'antd';
import {
  ExportOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FilterOutlined,
  ColumnHeightOutlined,
  ReloadOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Text } = Typography;
const { Option } = Select;

interface EnhancedTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  rowKey: string | ((record: T) => string);
  onRefresh?: () => void;
  onBulkAction?: (action: string, selectedRows: T[]) => void;
  exportFileName?: string;
  showBulkActions?: boolean;
  customBulkActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    danger?: boolean;
    confirm?: boolean;
  }>;
}

function EnhancedTable<T extends Record<string, any>>({
  columns,
  dataSource,
  loading = false,
  rowKey,
  onRefresh,
  onBulkAction,
  exportFileName = 'export',
  showBulkActions = true,
  customBulkActions = [],
}: EnhancedTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map(col => col.key as string).filter(Boolean)
  );
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedInfo, setSortedInfo] = useState<SorterResult<T>>({});
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);

  // デフォルトの一括操作
  const defaultBulkActions = [
    {
      key: 'activate',
      label: 'アクティブ化',
      icon: <CheckCircleOutlined />,
    },
    {
      key: 'deactivate',
      label: '非アクティブ化',
      icon: <StopOutlined />,
    },
    {
      key: 'sendEmail',
      label: 'メール送信',
      icon: <MailOutlined />,
    },
    {
      key: 'delete',
      label: '削除',
      icon: <DeleteOutlined />,
      danger: true,
      confirm: true,
    },
  ];

  const bulkActions = showBulkActions 
    ? [...defaultBulkActions, ...customBulkActions]
    : customBulkActions;

  // 選択行の処理
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: T[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    getCheckboxProps: (record: T) => ({
      disabled: record.disabled === true,
    }),
  };

  // テーブル変更ハンドラ
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<T>);
    
    if (pagination.current) {
      setCurrentPage(pagination.current);
    }
    if (pagination.pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  // 一括操作の実行
  const handleBulkAction = (action: string) => {
    const actionConfig = bulkActions.find(a => a.key === action);
    
    if (actionConfig?.confirm) {
      Modal.confirm({
        title: '確認',
        content: `選択した${selectedRows.length}件に対して「${actionConfig.label}」を実行しますか？`,
        onOk: () => {
          if (onBulkAction) {
            onBulkAction(action, selectedRows);
          }
          setSelectedRowKeys([]);
          setSelectedRows([]);
          message.success(`${actionConfig.label}を実行しました`);
        },
      });
    } else {
      if (onBulkAction) {
        onBulkAction(action, selectedRows);
      }
      message.success(`${actionConfig?.label || action}を実行しました`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  };

  // CSVエクスポート
  const exportToCSV = () => {
    const csvData = dataSource.map(row => {
      const csvRow: any = {};
      columns.forEach(col => {
        if (col.dataIndex && visibleColumns.includes(col.key as string)) {
          csvRow[col.title as string] = row[col.dataIndex as keyof T];
        }
      });
      return csvRow;
    });

    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFileName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Excelエクスポート
  const exportToExcel = () => {
    const excelData = dataSource.map(row => {
      const excelRow: any = {};
      columns.forEach(col => {
        if (col.dataIndex && visibleColumns.includes(col.key as string)) {
          excelRow[col.title as string] = row[col.dataIndex as keyof T];
        }
      });
      return excelRow;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${exportFileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // PDFエクスポート
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // 日本語フォントの設定が必要な場合はここで設定
    doc.setFontSize(16);
    doc.text(exportFileName, 14, 15);
    
    const tableColumns = columns
      .filter(col => visibleColumns.includes(col.key as string))
      .map(col => col.title as string);
    
    const tableRows = dataSource.map(row => {
      return columns
        .filter(col => visibleColumns.includes(col.key as string))
        .map(col => {
          const value = row[col.dataIndex as keyof T];
          return value?.toString() || '';
        });
    });
    
    (doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 25,
      styles: { font: 'helvetica' }, // 日本語フォントがある場合は変更
    });
    
    doc.save(`${exportFileName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // エクスポートメニュー
  const exportMenu = (
    <Menu>
      <Menu.Item key="csv" icon={<FileTextOutlined />} onClick={exportToCSV}>
        CSV形式
      </Menu.Item>
      <Menu.Item key="excel" icon={<FileExcelOutlined />} onClick={exportToExcel}>
        Excel形式
      </Menu.Item>
      <Menu.Item key="pdf" icon={<FilePdfOutlined />} onClick={exportToPDF}>
        PDF形式
      </Menu.Item>
    </Menu>
  );

  // 一括操作メニュー
  const bulkActionMenu = (
    <Menu>
      {bulkActions.map(action => (
        <Menu.Item
          key={action.key}
          icon={action.icon}
          danger={action.danger}
          onClick={() => handleBulkAction(action.key)}
        >
          {action.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  // カラム表示設定
  const handleColumnVisibility = (columnKey: string, visible: boolean) => {
    if (visible) {
      setVisibleColumns([...visibleColumns, columnKey]);
    } else {
      setVisibleColumns(visibleColumns.filter(key => key !== columnKey));
    }
  };

  // 表示用のカラムをフィルタリング
  const displayColumns = columns.filter(col => 
    visibleColumns.includes(col.key as string)
  );

  return (
    <div>
      {/* ツールバー */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            {selectedRowKeys.length > 0 && (
              <>
                <Text>選択中: {selectedRowKeys.length}件</Text>
                <Dropdown overlay={bulkActionMenu} disabled={selectedRowKeys.length === 0}>
                  <Button>
                    一括操作 <FilterOutlined />
                  </Button>
                </Dropdown>
              </>
            )}
          </Space>
        </Col>
        
        <Col>
          <Space>
            <Tooltip title="更新">
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
              />
            </Tooltip>
            
            <Tooltip title="列設定">
              <Button
                icon={<SettingOutlined />}
                onClick={() => setColumnSettingsVisible(true)}
              />
            </Tooltip>
            
            <Dropdown overlay={exportMenu}>
              <Button icon={<ExportOutlined />}>
                エクスポート <DownloadOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      {/* ページサイズ選択 */}
      <Row justify="end" style={{ marginBottom: 8 }}>
        <Space>
          <Text>表示件数:</Text>
          <Select
            value={pageSize}
            onChange={setPageSize}
            style={{ width: 100 }}
          >
            <Option value={10}>10件</Option>
            <Option value={25}>25件</Option>
            <Option value={50}>50件</Option>
            <Option value={100}>100件</Option>
          </Select>
        </Space>
      </Row>

      {/* テーブル */}
      <Table
        rowSelection={showBulkActions ? rowSelection : undefined}
        columns={displayColumns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: dataSource.length,
          showSizeChanger: false, // 上部で制御
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / 全${total}件`,
        }}
        scroll={{ x: 'max-content' }}
      />

      {/* カラム設定モーダル */}
      <Modal
        title="表示列の設定"
        open={columnSettingsVisible}
        onOk={() => setColumnSettingsVisible(false)}
        onCancel={() => setColumnSettingsVisible(false)}
        width={400}
      >
        <Alert
          message="表示する列を選択してください"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Space direction="vertical" style={{ width: '100%' }}>
          {columns.map(col => (
            <Checkbox
              key={col.key}
              checked={visibleColumns.includes(col.key as string)}
              onChange={(e) => handleColumnVisibility(col.key as string, e.target.checked)}
            >
              {col.title as string}
            </Checkbox>
          ))}
        </Space>
      </Modal>
    </div>
  );
}

export default EnhancedTable;
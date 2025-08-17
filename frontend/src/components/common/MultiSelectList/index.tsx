import React, { useMemo, useCallback } from 'react';
import { Checkbox, List, Empty, Card } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import './styles.css';

export interface SelectableItem {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
  [key: string]: any;
}

interface MultiSelectListProps<T extends SelectableItem> {
  items: T[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  renderItem?: (item: T) => React.ReactNode;
  className?: string;
  showSelectAll?: boolean;
  emptyMessage?: string;
  title?: string;
}

export function MultiSelectList<T extends SelectableItem>({
  items,
  selectedIds,
  onSelectionChange,
  renderItem,
  className = '',
  showSelectAll = true,
  emptyMessage = 'アイテムがありません',
  title,
}: MultiSelectListProps<T>) {
  const enabledItems = useMemo(() => items.filter(item => !item.disabled), [items]);
  const enabledItemIds = useMemo(() => enabledItems.map(item => item.id), [enabledItems]);

  const isAllSelected = useMemo(() => {
    return enabledItemIds.length > 0 && enabledItemIds.every(id => selectedIds.includes(id));
  }, [enabledItemIds, selectedIds]);

  const isIndeterminate = useMemo(() => {
    const selectedEnabledIds = enabledItemIds.filter(id => selectedIds.includes(id));
    return selectedEnabledIds.length > 0 && selectedEnabledIds.length < enabledItemIds.length;
  }, [enabledItemIds, selectedIds]);

  const handleSelectAll = useCallback((e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      const newSelectedIds = [...new Set([...selectedIds, ...enabledItemIds])];
      onSelectionChange(newSelectedIds);
    } else {
      const newSelectedIds = selectedIds.filter(id => !enabledItemIds.includes(id));
      onSelectionChange(newSelectedIds);
    }
  }, [selectedIds, enabledItemIds, onSelectionChange]);

  const handleItemSelect = useCallback((itemId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, itemId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== itemId));
    }
  }, [selectedIds, onSelectionChange]);

  const defaultRenderItem = useCallback((item: T) => (
    <div className="multi-select-item-content">
      <div className="multi-select-item-name">{item.name}</div>
      {item.description && (
        <div className="multi-select-item-description">{item.description}</div>
      )}
    </div>
  ), []);

  if (items.length === 0) {
    return <Empty description={emptyMessage} />;
  }

  const listContent = (
    <>
      {showSelectAll && (
        <div className="multi-select-all">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={handleSelectAll}
            disabled={enabledItems.length === 0}
          >
            <span aria-label="全選択">全選択</span>
          </Checkbox>
        </div>
      )}
      <List
        dataSource={items}
        renderItem={(item) => (
          <List.Item className="multi-select-item">
            <Checkbox
              checked={selectedIds.includes(item.id)}
              onChange={(e) => handleItemSelect(item.id, e.target.checked)}
              disabled={item.disabled}
            >
              {renderItem ? renderItem(item) : defaultRenderItem(item)}
            </Checkbox>
          </List.Item>
        )}
      />
    </>
  );

  if (title) {
    return (
      <Card title={title} className={`multi-select-list ${className}`}>
        {listContent}
      </Card>
    );
  }

  return (
    <div className={`multi-select-list ${className}`}>
      {listContent}
    </div>
  );
}
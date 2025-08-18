import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultiSelectList } from '../MultiSelectList';

describe('MultiSelectList', () => {
  const mockItems = [
    { id: '1', name: '田中太郎', description: 'React/TypeScript 5年' },
    { id: '2', name: '佐藤花子', description: 'AWS/Node.js 3年' },
    { id: '3', name: '山田次郎', description: 'Java/Spring 7年' },
  ];

  const defaultProps = {
    items: mockItems,
    selectedIds: [],
    onSelectionChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('アイテムリストを表示する', () => {
    render(<MultiSelectList {...defaultProps} />);
    
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    expect(screen.getByText('山田次郎')).toBeInTheDocument();
  });

  it('個別アイテムを選択できる', () => {
    const onSelectionChange = jest.fn();
    render(
      <MultiSelectList
        {...defaultProps}
        onSelectionChange={onSelectionChange}
      />
    );

    const firstCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('複数アイテムを選択できる', () => {
    const onSelectionChange = jest.fn();
    const { rerender } = render(
      <MultiSelectList
        {...defaultProps}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox').slice(1);
    
    fireEvent.click(checkboxes[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);

    rerender(
      <MultiSelectList
        {...defaultProps}
        selectedIds={['1']}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.click(checkboxes[1]);
    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('選択済みアイテムを選択解除できる', () => {
    const onSelectionChange = jest.fn();
    render(
      <MultiSelectList
        {...defaultProps}
        selectedIds={['1', '2']}
        onSelectionChange={onSelectionChange}
      />
    );

    const firstCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(['2']);
  });

  it('全選択機能が動作する', () => {
    const onSelectionChange = jest.fn();
    render(
      <MultiSelectList
        {...defaultProps}
        onSelectionChange={onSelectionChange}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('全選択');
    fireEvent.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('全選択解除が動作する', () => {
    const onSelectionChange = jest.fn();
    render(
      <MultiSelectList
        {...defaultProps}
        selectedIds={['1', '2', '3']}
        onSelectionChange={onSelectionChange}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('全選択');
    fireEvent.click(selectAllCheckbox);

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('一部選択時に全選択チェックボックスがindeterminate状態になる', () => {
    render(
      <MultiSelectList
        {...defaultProps}
        selectedIds={['1', '2']}
        onSelectionChange={jest.fn()}
      />
    );

    const selectAllCheckbox = screen.getByLabelText('全選択') as HTMLInputElement;
    expect(selectAllCheckbox.indeterminate).toBe(true);
  });

  it('アイテムが0件の場合にメッセージを表示する', () => {
    render(
      <MultiSelectList
        items={[]}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
      />
    );

    expect(screen.getByText('アイテムがありません')).toBeInTheDocument();
  });

  it('カスタムレンダラーを使用できる', () => {
    const customRenderer = (item: any) => (
      <div>
        <strong>{item.name}</strong>
        <span> - カスタム表示</span>
      </div>
    );

    render(
      <MultiSelectList
        {...defaultProps}
        renderItem={customRenderer}
      />
    );

    expect(screen.getAllByText('カスタム表示')).toHaveLength(3);
  });

  it('無効化されたアイテムを選択できない', () => {
    const onSelectionChange = jest.fn();
    const itemsWithDisabled = [
      { id: '1', name: '田中太郎', description: 'React', disabled: true },
      { id: '2', name: '佐藤花子', description: 'AWS', disabled: false },
    ];

    render(
      <MultiSelectList
        items={itemsWithDisabled}
        selectedIds={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox').slice(1);
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).not.toBeDisabled();

    fireEvent.click(checkboxes[0]);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
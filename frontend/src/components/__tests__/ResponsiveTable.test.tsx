import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ResponsiveTable from '../ResponsiveTable';
import * as useResponsiveModule from '../../hooks/useResponsive';

vi.mock('../../hooks/useResponsive');

describe('ResponsiveTable', () => {
  const mockData = [
    { key: '1', name: 'テストユーザー1', age: 30, email: 'test1@example.com' },
    { key: '2', name: 'テストユーザー2', age: 25, email: 'test2@example.com' },
    { key: '3', name: 'テストユーザー3', age: 35, email: 'test3@example.com' },
  ];

  const mockColumns = [
    { title: '名前', dataIndex: 'name', key: 'name' },
    { title: '年齢', dataIndex: 'age', key: 'age' },
    { title: 'メール', dataIndex: 'email', key: 'email' },
  ];

  const mockMobileRenderItem = (record: typeof mockData[0]) => (
    <div data-testid={`mobile-item-${record.key}`}>
      <h3>{record.name}</h3>
      <p>{record.age}歳</p>
      <p>{record.email}</p>
    </div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('デスクトップ表示', () => {
    beforeEach(() => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'xl',
      });
    });

    it('通常のテーブルが表示される', () => {
      render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      expect(screen.getByText('名前')).toBeInTheDocument();
      expect(screen.getByText('年齢')).toBeInTheDocument();
      expect(screen.getByText('メール')).toBeInTheDocument();
      
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
      expect(screen.getByText('テストユーザー2')).toBeInTheDocument();
      expect(screen.getByText('テストユーザー3')).toBeInTheDocument();
    });

    it('scroll設定が適用される', () => {
      const { container } = render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      const table = container.querySelector('.ant-table');
      expect(table).toBeInTheDocument();
    });

    it('モバイルレンダリングが使用されない', () => {
      render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      expect(screen.queryByTestId('mobile-item-1')).not.toBeInTheDocument();
    });
  });

  describe('モバイル表示', () => {
    beforeEach(() => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'xs',
      });
    });

    it('カスタムモバイル表示が使用される', () => {
      render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      expect(screen.getByTestId('mobile-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-item-3')).toBeInTheDocument();
    });

    it('テーブルヘッダーが表示されない', () => {
      render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      expect(screen.queryByText('名前')).not.toBeInTheDocument();
      expect(screen.queryByText('年齢')).not.toBeInTheDocument();
      expect(screen.queryByText('メール')).not.toBeInTheDocument();
    });

    it('各アイテムがカードとして表示される', () => {
      const { container } = render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      const cards = container.querySelectorAll('.ant-card');
      expect(cards).toHaveLength(3);
    });

    it('mobileRenderItemが提供されない場合は通常のテーブルが表示される', () => {
      render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
        />
      );

      expect(screen.getByText('名前')).toBeInTheDocument();
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    });
  });

  describe('タブレット表示', () => {
    beforeEach(() => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        screenSize: 'md',
      });
    });

    it('通常のテーブルが表示される', () => {
      render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      expect(screen.getByText('名前')).toBeInTheDocument();
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    });
  });

  describe('プロパティの継承', () => {
    it('追加のプロパティが正しく渡される', () => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'xl',
      });

      const onRow = vi.fn();
      const { container } = render(
        <ResponsiveTable
          dataSource={mockData}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
          pagination={{ pageSize: 5 }}
          onRow={onRow}
          className="custom-table"
        />
      );

      const table = container.querySelector('.custom-table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('空データの処理', () => {
    it('データが空の場合の表示', () => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'xl',
      });

      render(
        <ResponsiveTable
          dataSource={[]}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      const emptyElement = screen.getByText('No data');
      expect(emptyElement).toBeInTheDocument();
    });

    it('モバイルで空データの場合', () => {
      vi.spyOn(useResponsiveModule, 'default').mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenSize: 'xs',
      });

      const { container } = render(
        <ResponsiveTable
          dataSource={[]}
          columns={mockColumns}
          mobileRenderItem={mockMobileRenderItem}
        />
      );

      const cards = container.querySelectorAll('.ant-card');
      expect(cards).toHaveLength(0);
    });
  });
});
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Spin,
  Alert,
  Typography,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useOfferBoard } from '@/hooks/useOfferBoard';
import { useOfferStore } from '@/stores/offerStore';
import { useOfferFilters } from '@/hooks/useOfferFilters';
import { useResponsive } from '@/hooks/useResponsive';
import { OfferDialog } from './OfferDialog';
import { OfferSummary } from './OfferSummary';
import { EngineerCard } from './EngineerCard';
import { OfferFilters } from './OfferFilters';
import { OfferStatistics } from './OfferStatistics';
import { createOfferTableColumns } from './OfferTableConfig';
import type { Engineer } from '@/types/offer';
import styles from './OfferBoard.module.css';

const { Title } = Typography;

/**
 * オファーボード - リファクタリング版
 * 責務を分割し、各コンポーネントを独立させた実装
 */
export const OfferBoard: React.FC = () => {
  // データ取得
  const { data: boardData, isLoading, error } = useOfferBoard();
  
  // 選択状態管理
  const {
    selectedEngineers,
    toggleEngineer,
    selectAllEngineers,
    clearSelection,
  } = useOfferStore();

  // フィルタリング機能
  const {
    filters,
    setStatusFilter,
    setSkillFilter,
    setAvailabilityFilter,
    applyFilters,
    handleTableChange,
  } = useOfferFilters();

  // レスポンシブ対応
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // ローカル状態
  const [showOfferDialog, setShowOfferDialog] = useState(false);

  // フィルタリング済みエンジニアリスト
  const filteredEngineers = useMemo(() => {
    if (!boardData?.engineers) return [];
    return applyFilters(boardData.engineers);
  }, [boardData?.engineers, applyFilters]);

  // 全選択ハンドラー
  const handleSelectAll = () => {
    const allIds = filteredEngineers.map(e => e.id);
    selectAllEngineers(allIds);
  };

  // テーブルカラム定義
  const columns = useMemo(() => 
    createOfferTableColumns({
      selectedEngineers,
      toggleEngineer,
    }), 
    [selectedEngineers, toggleEngineer]
  );

  // エラー処理
  if (error) {
    return (
      <Alert
        message="エラー"
        description="データの取得に失敗しました。再度お試しください。"
        type="error"
        showIcon
      />
    );
  }

  // ローディング処理
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="データを読み込んでいます..." />
      </div>
    );
  }

  return (
    <div className={styles.offerBoard}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <Title level={2}>オファーボード</Title>
        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setShowOfferDialog(true)}
            disabled={selectedEngineers.length === 0}
          >
            オファーを送信 ({selectedEngineers.length})
          </Button>
          {selectedEngineers.length > 0 && (
            <Button onClick={clearSelection}>
              選択をクリア
            </Button>
          )}
        </Space>
      </div>

      {/* 統計情報 */}
      <OfferStatistics
        boardData={boardData}
        selectedCount={selectedEngineers.length}
        isMobile={isMobile}
      />

      {/* フィルター */}
      <Card style={{ marginTop: 16 }}>
        <OfferFilters
          statusFilter={filters.statusFilter}
          skillFilter={filters.skillFilter}
          availabilityFilter={filters.availabilityFilter}
          onStatusChange={setStatusFilter}
          onSkillChange={setSkillFilter}
          onAvailabilityChange={setAvailabilityFilter}
          isMobile={isMobile}
        />
      </Card>

      {/* データテーブル / カードビュー */}
      <Card style={{ marginTop: 16 }}>
        {isMobile ? (
          // モバイル: カードビュー
          <div className={styles.mobileView}>
            <div style={{ marginBottom: 16 }}>
              <Button onClick={handleSelectAll} type="link">
                全て選択
              </Button>
              <span style={{ marginLeft: 16 }}>
                {filteredEngineers.length}件のエンジニア
              </span>
            </div>
            {filteredEngineers.map((engineer) => (
              <EngineerCard
                key={engineer.id}
                engineer={engineer}
                isSelected={selectedEngineers.includes(engineer.id)}
                onToggle={() => toggleEngineer(engineer.id)}
              />
            ))}
          </div>
        ) : (
          // デスクトップ/タブレット: テーブルビュー
          <>
            <div style={{ marginBottom: 16 }}>
              <Button onClick={handleSelectAll} type="link">
                全て選択
              </Button>
              <span style={{ marginLeft: 16 }}>
                {filteredEngineers.length}件のエンジニア
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={filteredEngineers}
              rowKey="id"
              onChange={handleTableChange}
              scroll={{ x: isTablet ? 800 : 1200 }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `全 ${total} 件`,
              }}
            />
          </>
        )}
      </Card>

      {/* オファーサマリー */}
      {selectedEngineers.length > 0 && (
        <OfferSummary
          selectedEngineers={selectedEngineers}
          engineers={filteredEngineers}
        />
      )}

      {/* オファーダイアログ */}
      <OfferDialog
        visible={showOfferDialog}
        onClose={() => setShowOfferDialog(false)}
        selectedEngineers={selectedEngineers}
        engineers={filteredEngineers}
      />
    </div>
  );
};

export default OfferBoard;
import type { OfferStatus } from '@/types/offer';

/**
 * オファーステータスに対応する色を取得
 */
export const getStatusColor = (status: OfferStatus): string => {
  const statusColorMap: Record<OfferStatus, string> = {
    none: 'default',
    sent: 'processing',
    opened: 'warning',
    pending: 'warning',
    accepted: 'success',
    declined: 'error',
    withdrawn: 'default',
  };
  
  return statusColorMap[status] || 'default';
};

/**
 * オファーステータスに対応する表示テキストを取得
 */
export const getStatusText = (status: OfferStatus): string => {
  const statusTextMap: Record<OfferStatus, string> = {
    none: '未送信',
    sent: '送信済み',
    opened: '開封済み',
    pending: '検討中',
    accepted: '承諾',
    declined: '辞退',
    withdrawn: '取り下げ',
  };
  
  return statusTextMap[status] || '-';
};

/**
 * オファーステータスの優先度を取得（ソート用）
 */
export const getStatusPriority = (status: OfferStatus): number => {
  const priorityMap: Record<OfferStatus, number> = {
    accepted: 1,
    pending: 2,
    opened: 3,
    sent: 4,
    declined: 5,
    none: 6,
    withdrawn: 7,
  };
  
  return priorityMap[status] || 999;
};

/**
 * オファーステータスが進行中かどうかを判定
 */
export const isStatusInProgress = (status: OfferStatus): boolean => {
  return ['sent', 'opened', 'pending'].includes(status);
};

/**
 * オファーステータスが完了済みかどうかを判定
 */
export const isStatusCompleted = (status: OfferStatus): boolean => {
  return ['accepted', 'declined'].includes(status);
};
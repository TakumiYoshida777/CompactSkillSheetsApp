import { describe, it, expect } from 'vitest';
import { OfferStatus } from '../OfferStatus';

describe('OfferStatus ValueObject', () => {
  describe('定義済みステータス', () => {
    it('すべての定義済みステータスが存在する', () => {
      expect(OfferStatus.PENDING).toBeDefined();
      expect(OfferStatus.ACCEPTED).toBeDefined();
      expect(OfferStatus.DECLINED).toBeDefined();
      expect(OfferStatus.WITHDRAWN).toBeDefined();
      expect(OfferStatus.EXPIRED).toBeDefined();
      expect(OfferStatus.SENT).toBeDefined();
    });

    it('ステータスの値が正しい', () => {
      expect(OfferStatus.PENDING.getValue()).toBe('PENDING');
      expect(OfferStatus.ACCEPTED.getValue()).toBe('ACCEPTED');
      expect(OfferStatus.DECLINED.getValue()).toBe('DECLINED');
    });

    it('表示名が正しい', () => {
      expect(OfferStatus.PENDING.getDisplayName()).toBe('検討中');
      expect(OfferStatus.ACCEPTED.getDisplayName()).toBe('承諾');
      expect(OfferStatus.DECLINED.getDisplayName()).toBe('辞退');
    });

    it('色が正しい', () => {
      expect(OfferStatus.PENDING.getColor()).toBe('#faad14');
      expect(OfferStatus.ACCEPTED.getColor()).toBe('#52c41a');
      expect(OfferStatus.DECLINED.getColor()).toBe('#ff4d4f');
    });
  });

  describe('fromString', () => {
    it('文字列から正しいステータスを取得する', () => {
      const status = OfferStatus.fromString('PENDING');
      expect(status).toBe(OfferStatus.PENDING);
      expect(status.getValue()).toBe('PENDING');
    });

    it('無効な文字列はエラーを投げる', () => {
      expect(() => OfferStatus.fromString('INVALID')).toThrow('Invalid offer status: INVALID');
    });
  });

  describe('isValid', () => {
    it('有効なステータス値を判定する', () => {
      expect(OfferStatus.isValid('PENDING')).toBe(true);
      expect(OfferStatus.isValid('ACCEPTED')).toBe(true);
      expect(OfferStatus.isValid('INVALID')).toBe(false);
    });
  });

  describe('getAllValues', () => {
    it('すべてのステータスを取得する', () => {
      const allStatuses = OfferStatus.getAllValues();
      expect(allStatuses).toHaveLength(6);
      expect(allStatuses).toContain(OfferStatus.PENDING);
      expect(allStatuses).toContain(OfferStatus.ACCEPTED);
    });
  });

  describe('ステータス判定メソッド', () => {
    it('アクティブなステータスを判定する', () => {
      expect(OfferStatus.PENDING.isActive()).toBe(true);
      expect(OfferStatus.SENT.isActive()).toBe(true);
      expect(OfferStatus.ACCEPTED.isActive()).toBe(false);
      expect(OfferStatus.DECLINED.isActive()).toBe(false);
    });

    it('最終ステータスを判定する', () => {
      expect(OfferStatus.ACCEPTED.isFinal()).toBe(true);
      expect(OfferStatus.DECLINED.isFinal()).toBe(true);
      expect(OfferStatus.WITHDRAWN.isFinal()).toBe(true);
      expect(OfferStatus.EXPIRED.isFinal()).toBe(true);
      expect(OfferStatus.PENDING.isFinal()).toBe(false);
      expect(OfferStatus.SENT.isFinal()).toBe(false);
    });
  });

  describe('ステータス遷移', () => {
    it('SENTからの遷移可能なステータス', () => {
      const nextStatuses = OfferStatus.SENT.getNextPossibleStatuses();
      expect(nextStatuses).toHaveLength(2);
      expect(nextStatuses).toContain(OfferStatus.PENDING);
      expect(nextStatuses).toContain(OfferStatus.WITHDRAWN);
    });

    it('PENDINGからの遷移可能なステータス', () => {
      const nextStatuses = OfferStatus.PENDING.getNextPossibleStatuses();
      expect(nextStatuses).toHaveLength(3);
      expect(nextStatuses).toContain(OfferStatus.ACCEPTED);
      expect(nextStatuses).toContain(OfferStatus.DECLINED);
      expect(nextStatuses).toContain(OfferStatus.WITHDRAWN);
    });

    it('最終ステータスからは遷移できない', () => {
      expect(OfferStatus.ACCEPTED.getNextPossibleStatuses()).toHaveLength(0);
      expect(OfferStatus.DECLINED.getNextPossibleStatuses()).toHaveLength(0);
    });

    it('遷移可能性をチェックする', () => {
      expect(OfferStatus.SENT.canTransitionTo(OfferStatus.PENDING)).toBe(true);
      expect(OfferStatus.SENT.canTransitionTo(OfferStatus.ACCEPTED)).toBe(false);
      expect(OfferStatus.PENDING.canTransitionTo(OfferStatus.ACCEPTED)).toBe(true);
      expect(OfferStatus.ACCEPTED.canTransitionTo(OfferStatus.PENDING)).toBe(false);
    });
  });

  describe('Ant Design Tag用のステータス', () => {
    it('正しいタグステータスを返す', () => {
      expect(OfferStatus.ACCEPTED.getTagStatus()).toBe('success');
      expect(OfferStatus.PENDING.getTagStatus()).toBe('processing');
      expect(OfferStatus.SENT.getTagStatus()).toBe('processing');
      expect(OfferStatus.DECLINED.getTagStatus()).toBe('error');
      expect(OfferStatus.EXPIRED.getTagStatus()).toBe('warning');
      expect(OfferStatus.WITHDRAWN.getTagStatus()).toBe('default');
    });
  });

  describe('equals', () => {
    it('同じステータスは等しい', () => {
      expect(OfferStatus.PENDING.equals(OfferStatus.PENDING)).toBe(true);
      const status1 = OfferStatus.fromString('ACCEPTED');
      const status2 = OfferStatus.fromString('ACCEPTED');
      expect(status1.equals(status2)).toBe(true);
    });

    it('異なるステータスは等しくない', () => {
      expect(OfferStatus.PENDING.equals(OfferStatus.ACCEPTED)).toBe(false);
    });
  });
});
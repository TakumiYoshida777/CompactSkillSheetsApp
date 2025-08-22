import { describe, it, expect, beforeEach } from '@jest/globals';
import { SkillSheetUrlUtil } from '../utils/skillsheet-url.util';

describe('SkillSheetUrlUtil', () => {
  describe('generateSkillSheetUrl', () => {
    it('複数エンジニアのスキルシート閲覧URLを生成できる', () => {
      const engineerIds = [1, 2, 3];
      const companyId = 100;
      const expiresIn = 7 * 24 * 60 * 60; // 7日間

      const url = SkillSheetUrlUtil.generateSkillSheetUrl(engineerIds, companyId, expiresIn);

      expect(url).toBeTruthy();
      expect(url).toContain('/skill-sheets/view?token=');
    });

    it('個別エンジニアのスキルシート閲覧URLを生成できる', () => {
      const engineerId = 1;
      const companyId = 100;

      const url = SkillSheetUrlUtil.generateIndividualSkillSheetUrl(engineerId, companyId);

      expect(url).toBeTruthy();
      expect(url).toContain('/skill-sheets/view?token=');
    });
  });

  describe('validateAccessToken', () => {
    it('有効なトークンを検証できる', () => {
      const engineerIds = [1, 2, 3];
      const companyId = 100;
      const expiresIn = 7 * 24 * 60 * 60;

      const url = SkillSheetUrlUtil.generateSkillSheetUrl(engineerIds, companyId, expiresIn);
      const token = url.split('token=')[1];

      const payload = SkillSheetUrlUtil.validateAccessToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.engineerIds).toEqual(engineerIds);
      expect(payload?.companyId).toEqual(companyId);
    });

    it('期限切れのトークンはnullを返す', () => {
      const engineerIds = [1];
      const companyId = 100;
      const expiresIn = -1; // すでに期限切れ

      const url = SkillSheetUrlUtil.generateSkillSheetUrl(engineerIds, companyId, expiresIn);
      const token = url.split('token=')[1];

      const payload = SkillSheetUrlUtil.validateAccessToken(token);

      expect(payload).toBeNull();
    });

    it('無効なトークンはnullを返す', () => {
      const invalidToken = 'invalid-token-string';

      const payload = SkillSheetUrlUtil.validateAccessToken(invalidToken);

      expect(payload).toBeNull();
    });
  });

  describe('generateBatchSkillSheetUrls', () => {
    it('複数グループのURLをバッチ生成できる', () => {
      const engineerGroups = [
        [1, 2],
        [3, 4, 5],
        [6]
      ];
      const companyId = 100;

      const urls = SkillSheetUrlUtil.generateBatchSkillSheetUrls(engineerGroups, companyId);

      expect(urls).toHaveLength(3);
      urls.forEach(url => {
        expect(url).toContain('/skill-sheets/view?token=');
      });
    });
  });
});
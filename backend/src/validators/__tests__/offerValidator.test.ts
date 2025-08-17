import { offerValidator } from '../offerValidator';

describe('OfferValidator', () => {
  describe('validate', () => {
    it('有効なオファーデータを検証する', async () => {
      const validData = {
        engineer_ids: ['1', '2', '3'],
        project_details: {
          name: 'ECサイトリニューアル',
          period_start: '2024-03-01',
          period_end: '2024-12-31',
          required_skills: ['React', 'TypeScript'],
          description: 'フロントエンド開発プロジェクト',
          location: '東京都港区',
          rate_min: 600000,
          rate_max: 800000,
          remarks: '長期案件'
        },
        send_email: true
      };

      const result = await offerValidator.validate(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('エンジニアIDが空の場合エラーを返す', async () => {
      const invalidData = {
        engineer_ids: [],
        project_details: {
          name: 'テストプロジェクト',
          period_start: '2024-03-01',
          period_end: '2024-12-31',
          required_skills: ['React'],
          description: 'テスト'
        },
        send_email: false
      };

      const result = await offerValidator.validate(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('engineer_ids は必須です');
    });

    it('プロジェクト名が空の場合エラーを返す', async () => {
      const invalidData = {
        engineer_ids: ['1'],
        project_details: {
          name: '',
          period_start: '2024-03-01',
          period_end: '2024-12-31',
          required_skills: ['React'],
          description: 'テスト'
        },
        send_email: false
      };

      const result = await offerValidator.validate(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('プロジェクト名は必須です');
    });

    it('期間の開始日が終了日より後の場合エラーを返す', async () => {
      const invalidData = {
        engineer_ids: ['1'],
        project_details: {
          name: 'テストプロジェクト',
          period_start: '2024-12-31',
          period_end: '2024-03-01',
          required_skills: ['React'],
          description: 'テスト'
        },
        send_email: false
      };

      const result = await offerValidator.validate(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('期間の開始日は終了日より前である必要があります');
    });

    it('必要スキルが空の場合エラーを返す', async () => {
      const invalidData = {
        engineer_ids: ['1'],
        project_details: {
          name: 'テストプロジェクト',
          period_start: '2024-03-01',
          period_end: '2024-12-31',
          required_skills: [],
          description: 'テスト'
        },
        send_email: false
      };

      const result = await offerValidator.validate(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('必要スキルを1つ以上指定してください');
    });

    it('案件詳細が空の場合エラーを返す', async () => {
      const invalidData = {
        engineer_ids: ['1'],
        project_details: {
          name: 'テストプロジェクト',
          period_start: '2024-03-01',
          period_end: '2024-12-31',
          required_skills: ['React'],
          description: ''
        },
        send_email: false
      };

      const result = await offerValidator.validate(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('案件詳細は必須です');
    });

    it('単価の最小値が最大値より大きい場合エラーを返す', async () => {
      const invalidData = {
        engineer_ids: ['1'],
        project_details: {
          name: 'テストプロジェクト',
          period_start: '2024-03-01',
          period_end: '2024-12-31',
          required_skills: ['React'],
          description: 'テスト',
          rate_min: 800000,
          rate_max: 600000
        },
        send_email: false
      };

      const result = await offerValidator.validate(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('最低単価は最高単価以下である必要があります');
    });

    it('複数のエラーを返す', async () => {
      const invalidData = {
        engineer_ids: [],
        project_details: {
          name: '',
          period_start: '2024-12-31',
          period_end: '2024-03-01',
          required_skills: [],
          description: ''
        },
        send_email: false
      };

      const result = await offerValidator.validate(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(5);
      expect(result.errors).toContain('engineer_ids は必須です');
      expect(result.errors).toContain('プロジェクト名は必須です');
      expect(result.errors).toContain('期間の開始日は終了日より前である必要があります');
      expect(result.errors).toContain('必要スキルを1つ以上指定してください');
      expect(result.errors).toContain('案件詳細は必須です');
    });

    it('オプションフィールドは省略可能', async () => {
      const validData = {
        engineer_ids: ['1'],
        project_details: {
          name: 'テストプロジェクト',
          period_start: '2024-03-01',
          period_end: '2024-12-31',
          required_skills: ['React'],
          description: 'テストプロジェクトの詳細'
        },
        send_email: false
      };

      const result = await offerValidator.validate(validData);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateBulkAction', () => {
    it('有効な一括操作データを検証する', () => {
      const validData = {
        offer_ids: ['1', '2', '3'],
        action: 'remind'
      };

      const result = offerValidator.validateBulkAction(validData);

      expect(result.valid).toBe(true);
    });

    it('オファーIDが空の場合エラーを返す', () => {
      const invalidData = {
        offer_ids: [],
        action: 'remind'
      };

      const result = offerValidator.validateBulkAction(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('オファーIDを1つ以上指定してください');
    });

    it('無効なアクションの場合エラーを返す', () => {
      const invalidData = {
        offer_ids: ['1'],
        action: 'invalid_action'
      };

      const result = offerValidator.validateBulkAction(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('無効なアクションです');
    });
  });
});
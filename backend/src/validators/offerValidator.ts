interface OfferValidationData {
  engineer_ids: string[];
  project_details: {
    name: string;
    period_start: string;
    period_end: string;
    required_skills: string[];
    description: string;
    location?: string;
    rate_min?: number;
    rate_max?: number;
    remarks?: string;
  };
  send_email: boolean;
}

interface BulkActionData {
  offer_ids: string[];
  action: string;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

class OfferValidator {
  /**
   * オファー作成データのバリデーション
   */
  async validate(data: OfferValidationData): Promise<ValidationResult> {
    const errors: string[] = [];

    // エンジニアIDの検証
    if (!data.engineer_ids || data.engineer_ids.length === 0) {
      errors.push('engineer_ids は必須です');
    }

    // プロジェクト詳細の検証
    if (!data.project_details) {
      errors.push('プロジェクト詳細は必須です');
    } else {
      const details = data.project_details;

      // プロジェクト名
      if (!details.name || details.name.trim() === '') {
        errors.push('プロジェクト名は必須です');
      }

      // 期間
      if (!details.period_start) {
        errors.push('開始日は必須です');
      }
      if (!details.period_end) {
        errors.push('終了日は必須です');
      }
      if (details.period_start && details.period_end) {
        const startDate = new Date(details.period_start);
        const endDate = new Date(details.period_end);
        if (startDate > endDate) {
          errors.push('期間の開始日は終了日より前である必要があります');
        }
      }

      // 必要スキル
      if (!details.required_skills || details.required_skills.length === 0) {
        errors.push('必要スキルを1つ以上指定してください');
      }

      // 案件詳細
      if (!details.description || details.description.trim() === '') {
        errors.push('案件詳細は必須です');
      }

      // 単価
      if (details.rate_min !== undefined && details.rate_max !== undefined) {
        if (details.rate_min > details.rate_max) {
          errors.push('最低単価は最高単価以下である必要があります');
        }
        if (details.rate_min < 0) {
          errors.push('単価は0以上である必要があります');
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * 一括操作データのバリデーション
   */
  validateBulkAction(data: BulkActionData): ValidationResult {
    const errors: string[] = [];

    // オファーIDの検証
    if (!data.offer_ids || data.offer_ids.length === 0) {
      errors.push('オファーIDを1つ以上指定してください');
    }

    // アクションの検証
    const validActions = ['remind', 'withdraw'];
    if (!data.action || !validActions.includes(data.action)) {
      errors.push('無効なアクションです');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * ステータス更新データのバリデーション
   */
  validateStatusUpdate(status: string): ValidationResult {
    const validStatuses = ['withdrawn', 'reminder_sent'];
    
    if (!validStatuses.includes(status)) {
      return {
        valid: false,
        errors: ['無効なステータスです']
      };
    }

    return { valid: true };
  }

  /**
   * 検索パラメータのバリデーション
   */
  validateSearchParams(params: any): ValidationResult {
    const errors: string[] = [];

    if (params.page && (isNaN(params.page) || params.page < 1)) {
      errors.push('ページ番号は1以上の数値である必要があります');
    }

    if (params.limit && (isNaN(params.limit) || params.limit < 1 || params.limit > 100)) {
      errors.push('表示件数は1から100の間で指定してください');
    }

    if (params.status) {
      const validStatuses = ['SENT', 'OPENED', 'PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'];
      if (!validStatuses.includes(params.status)) {
        errors.push('無効なステータスフィルターです');
      }
    }

    if (params.period) {
      const validPeriods = ['last_week', 'last_month', 'last_3_months', 'last_6_months', 'last_year'];
      if (!validPeriods.includes(params.period)) {
        errors.push('無効な期間フィルターです');
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }
}

export const offerValidator = new OfferValidator();
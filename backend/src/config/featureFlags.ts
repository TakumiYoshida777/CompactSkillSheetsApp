/**
 * Feature Flags 設定
 * 
 * 機能の段階的なロールアウトや切り替えを制御
 */

export interface FeatureFlags {
  // 新しいBusinessPartner APIを使用するか
  useNewBusinessPartnerAPI: boolean;
  
  // 詳細なログ出力を有効にするか
  enableDetailedLogging: boolean;
  
  // キャッシュを使用するか
  enableCaching: boolean;
  
  // データマイグレーションモード
  dataMigrationMode: boolean;
}

/**
 * 環境変数からFeature Flagsを取得
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    useNewBusinessPartnerAPI: process.env.USE_NEW_BP_API === 'true',
    enableDetailedLogging: process.env.ENABLE_DETAILED_LOGGING === 'true',
    enableCaching: process.env.ENABLE_CACHING !== 'false', // デフォルトはtrue
    dataMigrationMode: process.env.DATA_MIGRATION_MODE === 'true',
  };
}

/**
 * 特定のフィーチャーが有効かチェック
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * フィーチャーフラグのログ出力（デバッグ用）
 */
export function logFeatureFlags(): void {
  const flags = getFeatureFlags();
  console.log('=== Feature Flags Status ===');
  Object.entries(flags).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('===========================');
}
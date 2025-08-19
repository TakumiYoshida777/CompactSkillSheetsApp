import crypto from 'crypto';
import { config } from '../config/environment';

export class SkillSheetUrlUtil {
  /**
   * エンジニアのスキルシート閲覧用URLを生成
   * @param engineerIds エンジニアIDのリスト
   * @param companyId アクセス元企業ID
   * @param expiresIn 有効期限（秒）デフォルト7日間
   * @returns スキルシート閲覧用URL
   */
  static generateSkillSheetUrl(
    engineerIds: number[],
    companyId: number,
    expiresIn: number = 7 * 24 * 60 * 60
  ): string {
    // アクセストークンを生成
    const token = this.generateAccessToken(engineerIds, companyId, expiresIn);
    
    // URLを構築
    const baseUrl = config.frontendUrl || config.api.baseUrl;
    const url = `${baseUrl}/skill-sheets/view?token=${token}`;
    
    return url;
  }

  /**
   * 個別エンジニアのスキルシート閲覧用URLを生成
   * @param engineerId エンジニアID
   * @param companyId アクセス元企業ID
   * @param expiresIn 有効期限（秒）デフォルト7日間
   * @returns スキルシート閲覧用URL
   */
  static generateIndividualSkillSheetUrl(
    engineerId: number,
    companyId: number,
    expiresIn: number = 7 * 24 * 60 * 60
  ): string {
    return this.generateSkillSheetUrl([engineerId], companyId, expiresIn);
  }

  /**
   * アクセストークンを生成
   * @param engineerIds エンジニアIDのリスト
   * @param companyId アクセス元企業ID
   * @param expiresIn 有効期限（秒）
   * @returns アクセストークン
   */
  private static generateAccessToken(
    engineerIds: number[],
    companyId: number,
    expiresIn: number
  ): string {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    // トークンペイロード
    const payload = {
      engineerIds,
      companyId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // ペイロードを暗号化
    const secret = process.env.SKILL_SHEET_URL_SECRET || config.jwt.secret;
    const cipher = crypto.createCipher('aes-256-cbc', secret);
    
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // URLセーフなBase64エンコード
    const token = Buffer.from(encrypted, 'hex')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return token;
  }

  /**
   * アクセストークンを検証してペイロードを取得
   * @param token アクセストークン
   * @returns デコードされたペイロード
   */
  static validateAccessToken(token: string): {
    engineerIds: number[];
    companyId: number;
    expiresAt: string;
    createdAt: string;
  } | null {
    try {
      // Base64デコード
      const base64 = token
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(token.length + (4 - token.length % 4) % 4, '=');
      
      const encrypted = Buffer.from(base64, 'base64').toString('hex');
      
      // 復号化
      const secret = process.env.SKILL_SHEET_URL_SECRET || config.jwt.secret;
      const decipher = crypto.createDecipher('aes-256-cbc', secret);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      const payload = JSON.parse(decrypted);
      
      // 有効期限チェック
      if (new Date(payload.expiresAt) < new Date()) {
        return null;
      }
      
      return payload;
    } catch (error) {
      console.error('トークン検証エラー:', error);
      return null;
    }
  }

  /**
   * 複数エンジニアのスキルシート閲覧用URLをバッチ生成
   * @param engineerGroups エンジニアIDグループのリスト
   * @param companyId アクセス元企業ID
   * @param expiresIn 有効期限（秒）
   * @returns エンジニアグループごとのURL
   */
  static generateBatchSkillSheetUrls(
    engineerGroups: number[][],
    companyId: number,
    expiresIn: number = 7 * 24 * 60 * 60
  ): string[] {
    return engineerGroups.map(engineerIds => 
      this.generateSkillSheetUrl(engineerIds, companyId, expiresIn)
    );
  }
}
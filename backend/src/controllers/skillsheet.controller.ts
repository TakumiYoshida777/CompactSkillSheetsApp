import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SkillSheetUrlUtil } from '../utils/skillsheet-url.util';
import logger from '../config/logger';

export class SkillSheetController {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * URLトークンによるスキルシート閲覧
   */
  async viewByToken(req: Request, res: Response) {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'トークンが必要です'
        });
      }
      
      // トークンを検証
      const payload = SkillSheetUrlUtil.validateAccessToken(token as string);
      
      if (!payload) {
        return res.status(401).json({
          success: false,
          message: '無効または期限切れのトークンです'
        });
      }
      
      const { engineerIds, companyId, expiresAt } = payload;
      
      // アクセスログを記録
      await this.logAccess(companyId, engineerIds, req);
      
      // エンジニア情報を取得
      const engineers = await this.getEngineersWithSkillSheets(engineerIds);
      
      // 閲覧権限のあるエンジニア情報のみ返す
      const filteredEngineers = await this.filterEngineersForCompany(engineers, companyId);
      
      return res.json({
        success: true,
        data: {
          engineers: filteredEngineers,
          expiresAt,
          companyId
        }
      });
    } catch (error: any) {
      logger.error('スキルシート閲覧エラー:', error);
      return res.status(500).json({
        success: false,
        message: 'スキルシートの閲覧中にエラーが発生しました'
      });
    }
  }

  /**
   * スキルシート閲覧URLの生成
   */
  async generateUrl(req: Request, res: Response) {
    try {
      const { engineerIds, targetCompanyId, expiresIn } = req.body;
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
      
      if (!engineerIds || !Array.isArray(engineerIds) || engineerIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'エンジニアIDリストが必要です'
        });
      }
      
      // 権限チェック
      const hasPermission = await this.checkGenerateUrlPermission(companyId, engineerIds);
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'URLを生成する権限がありません'
        });
      }
      
      // URL生成
      const url = SkillSheetUrlUtil.generateSkillSheetUrl(
        engineerIds,
        targetCompanyId || companyId,
        expiresIn || 7 * 24 * 60 * 60
      );
      
      return res.json({
        success: true,
        data: {
          url,
          engineerIds,
          expiresIn: expiresIn || 7 * 24 * 60 * 60
        }
      });
    } catch (error: any) {
      logger.error('URL生成エラー:', error);
      return res.status(500).json({
        success: false,
        message: 'URLの生成中にエラーが発生しました'
      });
    }
  }

  /**
   * エンジニア情報とスキルシートを取得
   */
  private async getEngineersWithSkillSheets(engineerIds: number[]) {
    const engineers = await this.prisma.$queryRawUnsafe(`
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.current_status,
        e.available_date,
        s.summary,
        s.technical_skills,
        s.business_skills,
        s.qualifications,
        s.project_history,
        s.self_pr,
        s.updated_at as skill_sheet_updated_at
      FROM engineers e
      LEFT JOIN skill_sheets s ON e.id = s.engineer_id
      WHERE e.id = ANY($1::int[])
      AND e.is_active = true
    `, engineerIds);
    
    return engineers;
  }

  /**
   * 企業の閲覧権限に基づいてエンジニアをフィルタリング
   */
  private async filterEngineersForCompany(engineers: any[], companyId: number) {
    // 企業の閲覧権限を確認
    const permissions = await this.prisma.$queryRawUnsafe(`
      SELECT engineer_id, permission_type
      FROM client_access_permissions
      WHERE business_partner_id = $1
      AND is_active = true
    `, companyId);
    
    const permissionMap = new Map((permissions as any[]).map(p => [p.engineer_id, p.permission_type]));
    
    // 権限に基づいてフィルタリング
    return engineers.filter(engineer => {
      const permission = permissionMap.get(engineer.id);
      // 明示的な権限がある、または公開設定のエンジニア
      return permission || engineer.is_public;
    });
  }

  /**
   * URL生成権限チェック
   */
  private async checkGenerateUrlPermission(companyId: number, engineerIds: number[]): Promise<boolean> {
    // 自社のエンジニアかチェック
    const ownEngineers = await this.prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM engineers
      WHERE company_id = $1
      AND id = ANY($2::int[])
    `, companyId, engineerIds);
    
    return (ownEngineers as any)[0].count === engineerIds.length;
  }

  /**
   * アクセスログを記録
   */
  private async logAccess(companyId: number, engineerIds: number[], req: Request) {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    
    for (const engineerId of engineerIds) {
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO access_logs (
          company_id,
          engineer_id,
          access_type,
          ip_address,
          user_agent,
          created_at
        ) VALUES ($1, $2, 'url_view', $3, $4, NOW())
      `, companyId, engineerId, ipAddress, userAgent);
    }
  }
}
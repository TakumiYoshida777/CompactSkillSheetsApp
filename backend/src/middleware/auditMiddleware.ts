import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AuditableRequest extends Request {
  auditLog?: {
    action: string;
    tableName?: string;
    recordId?: bigint;
    changes?: any;
    metadata?: any;
  };
}

/**
 * 監査ログミドルウェア
 * 重要な操作を自動的に記録
 */
export class AuditMiddleware {
  /**
   * 監査ログを記録
   */
  static async logAction(
    req: AuditableRequest,
    res: Response,
    next: NextFunction
  ) {
    // レスポンス送信後に監査ログを記録
    const originalSend = res.send;
    
    res.send = function(data: any) {
      res.send = originalSend;
      
      // 成功レスポンスの場合のみログを記録
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditMiddleware.createAuditLog(req, res, data)
          .catch(error => {
            logger.error('監査ログの記録に失敗:', error);
          });
      }
      
      return res.send(data);
    };
    
    next();
  }

  /**
   * 監査ログエントリを作成
   */
  private static async createAuditLog(
    req: AuditableRequest,
    res: Response,
    responseData: any
  ) {
    try {
      const userId = req.user?.id ? BigInt(req.user.id) : undefined;
      const action = AuditMiddleware.determineAction(req);
      const tableName = AuditMiddleware.determineTableName(req);
      const recordId = AuditMiddleware.extractRecordId(req, responseData);
      
      // リクエスト内容から変更内容を抽出
      const changes = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH'
        ? req.body
        : null;
      
      // メタデータを構築
      const metadata = {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };

      if (userId) {
        await prisma.auditLog.create({
          data: {
            userId,
            action,
            tableName,
            recordId,
            changes: changes ? JSON.stringify(changes) : null,
            metadata: JSON.stringify(metadata),
            createdAt: new Date()
          }
        });

        logger.info('監査ログ記録:', {
          userId: userId.toString(),
          action,
          tableName,
          recordId: recordId?.toString()
        });
      }
    } catch (error) {
      logger.error('監査ログ作成エラー:', error);
    }
  }

  /**
   * リクエストからアクションを判定
   */
  private static determineAction(req: AuditableRequest): string {
    if (req.auditLog?.action) {
      return req.auditLog.action;
    }

    const method = req.method;
    const path = req.path.toLowerCase();

    // 認証関連
    if (path.includes('/login')) return 'LOGIN';
    if (path.includes('/logout')) return 'LOGOUT';
    if (path.includes('/register')) return 'REGISTER';
    
    // CRUD操作
    if (method === 'POST') {
      if (path.includes('/business-partners')) return 'CREATE_PARTNER';
      if (path.includes('/permissions')) return 'UPDATE_PERMISSIONS';
      if (path.includes('/ng-list')) return 'UPDATE_NG_LIST';
      return 'CREATE';
    }
    
    if (method === 'PUT' || method === 'PATCH') {
      if (path.includes('/business-partners')) return 'UPDATE_PARTNER';
      if (path.includes('/status')) return 'UPDATE_STATUS';
      if (path.includes('/settings')) return 'UPDATE_SETTINGS';
      return 'UPDATE';
    }
    
    if (method === 'DELETE') {
      if (path.includes('/business-partners')) return 'DELETE_PARTNER';
      return 'DELETE';
    }
    
    if (method === 'GET') {
      if (path.includes('/engineers')) return 'VIEW_ENGINEERS';
      if (path.includes('/skill-sheet')) return 'VIEW_SKILL_SHEET';
      return 'VIEW';
    }
    
    return 'UNKNOWN';
  }

  /**
   * リクエストパスからテーブル名を判定
   */
  private static determineTableName(req: AuditableRequest): string | undefined {
    if (req.auditLog?.tableName) {
      return req.auditLog.tableName;
    }

    const path = req.path.toLowerCase();
    
    if (path.includes('/business-partners')) return 'business_partners';
    if (path.includes('/engineers')) return 'engineers';
    if (path.includes('/permissions')) return 'engineer_permissions';
    if (path.includes('/ng-list')) return 'engineer_ng_list';
    if (path.includes('/companies')) return 'companies';
    if (path.includes('/users')) return 'users';
    if (path.includes('/client-users')) return 'client_users';
    if (path.includes('/skill-sheet')) return 'skill_sheets';
    if (path.includes('/settings')) return 'business_partner_settings';
    
    return undefined;
  }

  /**
   * レコードIDを抽出
   */
  private static extractRecordId(
    req: AuditableRequest,
    responseData: any
  ): bigint | undefined {
    if (req.auditLog?.recordId) {
      return req.auditLog.recordId;
    }

    // URLパラメータから取得
    if (req.params.id) {
      return BigInt(req.params.id);
    }
    
    // レスポンスデータから取得
    if (responseData && typeof responseData === 'object') {
      if (responseData.id) {
        return BigInt(responseData.id);
      }
      if (responseData.partner?.id) {
        return BigInt(responseData.partner.id);
      }
      if (responseData.data?.id) {
        return BigInt(responseData.data.id);
      }
    }
    
    return undefined;
  }

  /**
   * 特定のアクションに対する監査ログを手動で記録
   */
  static async logCustomAction(
    userId: bigint,
    action: string,
    details: {
      tableName?: string;
      recordId?: bigint;
      changes?: any;
      metadata?: any;
    }
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          tableName: details.tableName,
          recordId: details.recordId,
          changes: details.changes ? JSON.stringify(details.changes) : null,
          metadata: details.metadata ? JSON.stringify(details.metadata) : null,
          createdAt: new Date()
        }
      });

      logger.info('カスタム監査ログ記録:', {
        userId: userId.toString(),
        action,
        tableName: details.tableName,
        recordId: details.recordId?.toString()
      });
    } catch (error) {
      logger.error('カスタム監査ログ記録エラー:', error);
      throw error;
    }
  }

  /**
   * 監査ログを検索
   */
  static async searchAuditLogs(params: {
    userId?: bigint;
    action?: string;
    tableName?: string;
    recordId?: bigint;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};
      
      if (params.userId) where.userId = params.userId;
      if (params.action) where.action = params.action;
      if (params.tableName) where.tableName = params.tableName;
      if (params.recordId) where.recordId = params.recordId;
      
      if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) where.createdAt.gte = params.startDate;
        if (params.endDate) where.createdAt.lte = params.endDate;
      }
      
      const logs = await prisma.auditLog.findMany({
        where,
        take: params.limit || 100,
        skip: params.offset || 0,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          }
        }
      });
      
      return logs.map(log => ({
        ...log,
        changes: log.changes ? JSON.parse(log.changes) : null,
        metadata: log.metadata ? JSON.parse(log.metadata) : null
      }));
    } catch (error) {
      logger.error('監査ログ検索エラー:', error);
      throw error;
    }
  }

  /**
   * 監査ログの定期クリーンアップ
   */
  static async cleanupOldLogs(retentionDays: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const result = await prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });
      
      logger.info(`古い監査ログを削除: ${result.count}件`);
      return result.count;
    } catch (error) {
      logger.error('監査ログクリーンアップエラー:', error);
      throw error;
    }
  }
}

export const auditMiddleware = AuditMiddleware.logAction;
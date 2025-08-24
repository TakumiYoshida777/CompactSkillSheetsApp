import { createClient, RedisClientType } from 'redis';
import logger from '../config/logger';

/**
 * 権限情報のキャッシュサービス
 * Redisを使用して権限情報をキャッシュし、パフォーマンスを向上させる
 */
class PermissionCacheService {
  private client: RedisClientType | null = null;
  private readonly TTL = 300; // 5分間のキャッシュ
  private readonly PREFIX = 'permissions:';
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  /**
   * Redis接続を初期化
   */
  private async initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 attempts');
              return new Error('Too many reconnection attempts');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Redisが利用できない場合でもアプリケーションは動作する
      this.isConnected = false;
    }
  }

  /**
   * ユーザーの権限をキャッシュから取得
   */
  async getUserPermissions(userId: string): Promise<string[] | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const key = `${this.PREFIX}user:${userId}`;
      const cached = await this.client.get(key);
      
      if (cached) {
        logger.debug(`Cache hit for user permissions: ${userId}`);
        return JSON.parse(cached);
      }
      
      logger.debug(`Cache miss for user permissions: ${userId}`);
      return null;
    } catch (error) {
      logger.error('Error getting permissions from cache:', error);
      return null;
    }
  }

  /**
   * ユーザーの権限をキャッシュに保存
   */
  async setUserPermissions(userId: string, permissions: string[]): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const key = `${this.PREFIX}user:${userId}`;
      await this.client.setEx(
        key,
        this.TTL,
        JSON.stringify(permissions)
      );
      logger.debug(`Cached permissions for user: ${userId}`);
    } catch (error) {
      logger.error('Error setting permissions in cache:', error);
    }
  }

  /**
   * ユーザーのロールをキャッシュから取得
   */
  async getUserRoles(userId: string): Promise<string[] | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const key = `${this.PREFIX}roles:${userId}`;
      const cached = await this.client.get(key);
      
      if (cached) {
        logger.debug(`Cache hit for user roles: ${userId}`);
        return JSON.parse(cached);
      }
      
      logger.debug(`Cache miss for user roles: ${userId}`);
      return null;
    } catch (error) {
      logger.error('Error getting roles from cache:', error);
      return null;
    }
  }

  /**
   * ユーザーのロールをキャッシュに保存
   */
  async setUserRoles(userId: string, roles: string[]): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const key = `${this.PREFIX}roles:${userId}`;
      await this.client.setEx(
        key,
        this.TTL,
        JSON.stringify(roles)
      );
      logger.debug(`Cached roles for user: ${userId}`);
    } catch (error) {
      logger.error('Error setting roles in cache:', error);
    }
  }

  /**
   * 特定ユーザーのキャッシュをクリア
   */
  async clearUserCache(userId: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const keys = [
        `${this.PREFIX}user:${userId}`,
        `${this.PREFIX}roles:${userId}`
      ];
      
      await Promise.all(keys.map(key => this.client!.del(key)));
      logger.debug(`Cleared cache for user: ${userId}`);
    } catch (error) {
      logger.error('Error clearing user cache:', error);
    }
  }

  /**
   * 全てのキャッシュをクリア
   */
  async clearAllCache(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(`${this.PREFIX}*`);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Cleared ${keys.length} cached entries`);
      }
    } catch (error) {
      logger.error('Error clearing all cache:', error);
    }
  }

  /**
   * Redis接続を閉じる
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    }
  }
}

// シングルトンインスタンス
export default new PermissionCacheService();
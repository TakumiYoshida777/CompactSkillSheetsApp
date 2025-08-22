import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class NotificationsService {
  // 通知一覧取得
  async getNotifications(userId: string, page: number, limit: number, unreadOnly: boolean) {
    const skip = (page - 1) * limit;
    
    const where = {
      userId,
      ...(unreadOnly && { isRead: false })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // 未読数取得
  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  // 通知を既読にする
  async markAsRead(userId: string, notificationIds: string[]) {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // すべての通知を既読にする
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // システムアナウンス取得
  async getAnnouncements() {
    const now = new Date();
    
    return await prisma.systemAnnouncement.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: {
        priority: 'desc'
      }
    });
  }

  // 通知作成（内部利用）
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    content: string;
    relatedId?: string;
    relatedType?: string;
  }) {
    return await prisma.notification.create({
      data: {
        ...data,
        isRead: false
      }
    });
  }

  // 複数ユーザーへの通知作成
  async createBulkNotifications(userIds: string[], notificationData: {
    type: string;
    title: string;
    content: string;
    relatedId?: string;
    relatedType?: string;
  }) {
    const notifications = userIds.map(userId => ({
      userId,
      ...notificationData,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return await prisma.notification.createMany({
      data: notifications
    });
  }
}

export const notificationsService = new NotificationsService();
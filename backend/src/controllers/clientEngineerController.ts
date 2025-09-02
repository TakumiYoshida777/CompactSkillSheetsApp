import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ClientEngineerController {
  // エンジニア一覧取得（アクセス権限に基づく）
  async getEngineers(req: Request, res: Response) {
    try {
      const clientUser = (req as any).clientUser;
      const { skills, availability, experience, minRate, maxRate } = req.query;
      
      // clientUserオブジェクトから正しいIDを取得
      const clientUserId = clientUser?.id;
      
      if (!clientUserId) {
        return res.status(400).json({ error: 'ユーザーIDが見つかりません' });
      }
      
      const clientUserData = await prisma.clientUser.findUnique({
        where: { id: BigInt(clientUserId) },
        include: {
          businessPartner: {
            include: {
              accessPermissions: true
            }
          }
        }
      });

      if (!clientUserData) {
        return res.status(404).json({ error: '取引先ユーザーが見つかりません' });
      }

      // 基本的なフィルタ条件
      let whereConditions: any = {};
      
      // アクセス権限に基づくフィルタリング
      const permissionType = clientUserData.businessPartner.accessPermissions[0]?.permissionType || 'WAITING_ONLY';
      
      switch (permissionType) {
        case 'FULL_ACCESS':
          // 全エンジニアアクセス可能
          break;
          
        case 'WAITING_ONLY':
          // 待機中のエンジニアのみ
          whereConditions.currentStatus = 'WAITING';
          break;
          
        case 'SELECTED_ONLY':
          // 指定されたエンジニアのみ
          const allowedEngineers = clientUserData.businessPartner.accessPermissions
            .filter(p => p.engineerId)
            .map(p => p.engineerId);
            
          if (allowedEngineers.length === 0) {
            return res.json({
              engineers: [],
              totalCount: 0,
              permissionType
            });
          }
          
          whereConditions.id = {
            in: allowedEngineers
          };
          break;
      }

      // クエリパラメータによるフィルタリング
      if (experience) {
        whereConditions.yearsOfExperience = {
          gte: parseInt(experience as string)
        };
      }

      if (minRate || maxRate) {
        whereConditions.hourlyRate = {};
        if (minRate) whereConditions.hourlyRate.gte = parseInt(minRate as string);
        if (maxRate) whereConditions.hourlyRate.lte = parseInt(maxRate as string);
      }

      // スキルフィルタ
      if (skills && typeof skills === 'string') {
        const skillArray = skills.split(',');
        whereConditions.skills = {
          some: {
            name: {
              in: skillArray
            }
          }
        };
      }

      const engineers = await prisma.engineer.findMany({
        where: whereConditions,
        include: {
          skillSheet: true,
          engineerProjects: {
            take: 3,
            orderBy: {
              startDate: 'desc'
            },
            include: {
              project: true
            }
          },
          offerEngineers: {
            where: {
              offer: {
                clientCompanyId: clientUserData.businessPartnerId
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5,
            include: {
              offer: true
            }
          }
        }
      });

      // 閲覧ログを記録
      await prisma.clientViewLog.create({
        data: {
          clientUserId: clientUserData.id,
          action: 'LIST_ENGINEERS'
        }
      });

      // レスポンスデータの整形
      const responseData = {
        engineers: engineers.map(eng => {
          // 経験年数の計算
          const yearsOfExperience = eng.yearsOfExperience || 
            (eng.skillSheet?.totalExperienceYears as number | null) || 
            0;

          // 最新のオファー状態を取得
          const latestOffer = eng.offerEngineers[0];
          const lastOfferStatus = latestOffer ? latestOffer.individualStatus : null;

          // オファー履歴
          const offerHistory = eng.offerEngineers.map(oe => ({
            offerId: oe.offerId.toString(),
            status: oe.individualStatus,
            projectName: oe.offer.projectName,
            sentAt: oe.offer.sentAt.toISOString(),
            respondedAt: oe.respondedAt?.toISOString() || null
          }));

          return {
            id: eng.id.toString(),
            name: eng.name,
            skills: eng.skillSheet?.technicalSkills || [],
            experience: yearsOfExperience,
            availability: eng.availableDate?.toISOString() || null,
            availabilityStatus: eng.currentStatus === 'WAITING' ? 'available' : 'unavailable',
            rate: {
              min: eng.hourlyRate ? Math.floor(eng.hourlyRate * 0.9) : 40,
              max: eng.hourlyRate ? Math.floor(eng.hourlyRate * 1.1) : 80
            },
            lastOfferStatus,
            offerHistory
          };
        }),
        totalCount: engineers.length,
        permissionType
      };

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching engineers:', error);
      res.status(500).json({ error: 'エンジニア情報の取得に失敗しました' });
    }
  }

  // エンジニア詳細取得
  async getEngineerDetail(req: Request, res: Response) {
    try {
      const clientUser = (req as any).clientUser;
      const { engineerId } = req.params;
      
      // clientUserオブジェクトから正しいIDを取得
      const clientUserId = clientUser?.id;
      
      if (!clientUserId) {
        return res.status(400).json({ error: 'ユーザーIDが見つかりません' });
      }
      
      const clientUserData = await prisma.clientUser.findUnique({
        where: { id: BigInt(clientUserId) },
        include: {
          businessPartner: {
            include: {
              accessPermissions: true
            }
          }
        }
      });

      if (!clientUserData) {
        return res.status(404).json({ error: '取引先ユーザーが見つかりません' });
      }

      // アクセス権限チェック
      const hasAccess = await this.checkEngineerAccess(
        clientUserData.id,
        BigInt(engineerId),
        clientUserData.businessPartner.accessPermissions[0]?.permissionType || 'WAITING_ONLY'
      );

      if (!hasAccess) {
        return res.status(403).json({ error: 'このエンジニアへのアクセス権限がありません' });
      }

      const engineer = await prisma.engineer.findUnique({
        where: { id: BigInt(engineerId) },
        include: {
          skills: true,
          projects: {
            orderBy: {
              startDate: 'desc'
            },
            include: {
              project: true
            }
          }
        }
      });

      if (!engineer) {
        return res.status(404).json({ error: 'エンジニアが見つかりません' });
      }

      // 閲覧ログを記録
      await prisma.clientViewLog.create({
        data: {
          clientUserId: clientUserData.id,
          engineerId: engineer.id,
          action: 'VIEW_ENGINEER_DETAIL'
        }
      });

      // レスポンスデータの整形
      const responseData = {
        id: engineer.id.toString(),
        name: engineer.name,
        skills: engineer.skills.map(s => ({
          name: s.name,
          level: s.level,
          yearsOfExperience: s.yearsOfExperience
        })),
        experience: engineer.yearsOfExperience || 0,
        availability: engineer.currentProjectEndDate?.toISOString() || null,
        isAvailable: engineer.isAvailable,
        rate: {
          min: engineer.hourlyRate ? engineer.hourlyRate * 0.9 : null,
          max: engineer.hourlyRate ? engineer.hourlyRate * 1.1 : null
        },
        projects: engineer.projects.map(p => ({
          name: p.project.name,
          role: p.role,
          startDate: p.startDate,
          endDate: p.endDate,
          description: p.project.description
        })),
        introduction: engineer.introduction || '',
        specialization: engineer.specialization || []
      };

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching engineer detail:', error);
      res.status(500).json({ error: 'エンジニア詳細の取得に失敗しました' });
    }
  }

  // エンジニア検索
  async searchEngineers(req: Request, res: Response) {
    try {
      const clientUser = (req as any).clientUser;
      const { keyword, skills, minExperience, maxExperience, isAvailable } = req.body;
      
      // clientUserオブジェクトから正しいIDを取得
      const clientUserId = clientUser?.id;
      
      if (!clientUserId) {
        return res.status(400).json({ error: 'ユーザーIDが見つかりません' });
      }
      
      const clientUserData = await prisma.clientUser.findUnique({
        where: { id: BigInt(clientUserId) },
        include: {
          businessPartner: {
            include: {
              accessPermissions: true
            }
          }
        }
      });

      if (!clientUserData) {
        return res.status(404).json({ error: '取引先ユーザーが見つかりません' });
      }

      // 検索条件の構築
      let whereConditions: any = {};
      
      // アクセス権限に基づく基本フィルタ
      const permissionType = clientUserData.businessPartner.accessPermissions[0]?.permissionType || 'WAITING_ONLY';
      
      switch (permissionType) {
        case 'FULL_ACCESS':
          break;
        case 'WAITING_ONLY':
          whereConditions.currentStatus = 'WAITING';
          break;
        case 'SELECTED_ONLY':
          const allowedEngineers = clientUserData.businessPartner.accessPermissions
            .filter(p => p.engineerId)
            .map(p => p.engineerId);
          whereConditions.id = { in: allowedEngineers };
          break;
      }

      // キーワード検索
      if (keyword) {
        whereConditions.OR = [
          { firstName: { contains: keyword, mode: 'insensitive' } },
          { lastName: { contains: keyword, mode: 'insensitive' } },
          { introduction: { contains: keyword, mode: 'insensitive' } }
        ];
      }

      // スキル検索
      if (skills && skills.length > 0) {
        whereConditions.skills = {
          some: {
            name: { in: skills }
          }
        };
      }

      // 経験年数
      if (minExperience || maxExperience) {
        whereConditions.yearsOfExperience = {};
        if (minExperience) whereConditions.yearsOfExperience.gte = minExperience;
        if (maxExperience) whereConditions.yearsOfExperience.lte = maxExperience;
      }

      // 稼働可否
      if (isAvailable !== undefined) {
        whereConditions.isAvailable = isAvailable;
      }

      const engineers = await prisma.engineer.findMany({
        where: whereConditions,
        include: {
          skills: true
        }
      });

      // 閲覧ログを記録
      await prisma.clientViewLog.create({
        data: {
          clientUserId: clientUserData.id,
          action: 'SEARCH_ENGINEERS'
        }
      });

      const responseData = {
        engineers: engineers.map(eng => ({
          id: eng.id.toString(),
          name: `${eng.lastName} ${eng.firstName}`,
          skills: eng.skills.map(s => s.name),
          experience: eng.yearsOfExperience || 0,
          availability: eng.currentProjectEndDate?.toISOString() || null,
          isAvailable: eng.isAvailable
        })),
        totalCount: engineers.length
      };

      res.json(responseData);
    } catch (error) {
      console.error('Error searching engineers:', error);
      res.status(500).json({ error: 'エンジニア検索に失敗しました' });
    }
  }

  // アクセス権限チェックヘルパー
  private async checkEngineerAccess(
    clientUserId: bigint,
    engineerId: bigint,
    permissionType: string
  ): Promise<boolean> {
    switch (permissionType) {
      case 'FULL_ACCESS':
        return true;
        
      case 'WAITING_ONLY':
        const engineer = await prisma.engineer.findUnique({
          where: { id: engineerId }
        });
        return engineer?.isAvailable || false;
        
      case 'SELECTED_ONLY':
        const permission = await prisma.clientAccessPermission.findFirst({
          where: {
            clientUserId,
            engineerId
          }
        });
        return !!permission;
        
      default:
        return false;
    }
  }

  // オファーボードデータ取得
  async getOfferBoard(req: Request, res: Response) {
    try {
      const clientUser = (req as any).clientUser;
      
      // clientUserオブジェクトから正しいIDを取得
      const clientUserId = clientUser?.id;
      
      if (!clientUserId) {
        return res.status(400).json({ error: 'ユーザーIDが見つかりません' });
      }
      
      const clientUserData = await prisma.clientUser.findUnique({
        where: { id: BigInt(clientUserId) },
        include: {
          businessPartner: {
            include: {
              accessPermissions: true
            }
          }
        }
      });

      if (!clientUserData) {
        return res.status(404).json({ error: '取引先ユーザーが見つかりません' });
      }

      // エンジニア一覧を取得（権限に基づく）
      const engineersResponse = await this.getEngineersForOfferBoard(clientUserData);
      
      // 現在時刻と時間範囲を定義
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // オファー関連の統計を取得
      const offers = await prisma.offer.findMany({
        where: {
          clientCompanyId: clientUserData.businessPartnerId
        },
        include: {
          offerEngineers: true
        }
      });

      // オファー統計の計算
      const totalOffers = offers.length;
      const monthlyOffers = offers.filter(o => o.sentAt >= monthAgo).length;
      const weeklyOffers = offers.filter(o => o.sentAt >= weekAgo).length;
      const todayOffers = offers.filter(o => o.sentAt >= today).length;

      // オファーエンジニアの統計を計算
      const allOfferEngineers = offers.flatMap(o => o.offerEngineers);
      const offeredEngineers = new Set(allOfferEngineers.map(oe => oe.engineerId.toString())).size;
      const acceptedOffers = allOfferEngineers.filter(oe => oe.individualStatus === 'ACCEPTED').length;
      const pendingResponses = allOfferEngineers.filter(oe => 
        oe.individualStatus === 'SENT' || oe.individualStatus === 'OPENED'
      ).length;

      // 承諾率の計算
      const respondedOffers = allOfferEngineers.filter(oe => 
        oe.individualStatus === 'ACCEPTED' || oe.individualStatus === 'DECLINED'
      ).length;
      const offerAcceptanceRate = respondedOffers > 0 
        ? Math.round((acceptedOffers / respondedOffers) * 100) 
        : 0;

      // 統計情報
      const statistics = {
        totalEngineers: engineersResponse.engineers.length,
        availableEngineers: engineersResponse.engineers.filter(e => e.availabilityStatus === 'available').length,
        offeredEngineers,
        acceptedOffers,
        offerAcceptanceRate
      };

      const summary = {
        totalOffers,
        monthlyOffers,
        weeklyOffers,
        todayOffers,
        pendingResponses,
        acceptanceRate: offerAcceptanceRate
      };

      // 最近のオファーを取得
      const recentOffers = await prisma.offer.findMany({
        where: {
          clientCompanyId: clientUserData.businessPartnerId
        },
        orderBy: {
          sentAt: 'desc'
        },
        take: 10,
        include: {
          offerEngineers: {
            include: {
              engineer: true
            }
          }
        }
      });

      const formattedRecentOffers = recentOffers.map(offer => ({
        id: offer.id.toString(),
        offerNumber: offer.offerNumber,
        projectName: offer.projectName,
        status: offer.status,
        sentAt: offer.sentAt.toISOString(),
        engineerCount: offer.offerEngineers.length,
        acceptedCount: offer.offerEngineers.filter(oe => oe.individualStatus === 'ACCEPTED').length,
        pendingCount: offer.offerEngineers.filter(oe => 
          oe.individualStatus === 'SENT' || oe.individualStatus === 'OPENED'
        ).length,
        engineers: offer.offerEngineers.map(oe => ({
          id: oe.engineerId.toString(),
          name: oe.engineer.name,
          status: oe.individualStatus,
          respondedAt: oe.respondedAt?.toISOString() || null
        }))
      }));

      // 閲覧ログを記録
      await prisma.clientViewLog.create({
        data: {
          clientUserId: clientUserData.id,
          action: 'VIEW_OFFER_BOARD'
        }
      });

      res.json({
        statistics,
        summary,
        engineers: engineersResponse.engineers,
        recentOffers: formattedRecentOffers
      });
    } catch (error) {
      console.error('Error fetching offer board:', error);
      res.status(500).json({ error: 'オファーボードデータの取得に失敗しました' });
    }
  }

  // オファーボード用のエンジニアデータ取得
  private async getEngineersForOfferBoard(clientUser: any) {
    const permissionType = clientUser.businessPartner.accessPermissions[0]?.permissionType || 'WAITING_ONLY';
    let whereConditions: any = {};
    
    switch (permissionType) {
      case 'FULL_ACCESS':
        break;
      case 'WAITING_ONLY':
        whereConditions.currentStatus = 'WAITING';
        break;
      case 'SELECTED_ONLY':
        const allowedEngineers = clientUser.businessPartner.accessPermissions
          .filter((p: any) => p.engineerId)
          .map((p: any) => p.engineerId);
        whereConditions.id = { in: allowedEngineers };
        break;
    }

    const engineers = await prisma.engineer.findMany({
      where: whereConditions,
      include: {
        skillSheet: true,
        offerEngineers: {
          where: {
            offer: {
              clientCompanyId: clientUser.businessPartnerId
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            offer: true
          }
        }
      }
    });

    return {
      engineers: engineers.map(eng => {
        // スキルシートからスキル情報を取得（JSON形式）
        const programmingLanguages = eng.skillSheet?.programmingLanguages as any[] || [];
        const frameworks = eng.skillSheet?.frameworks as any[] || [];
        const databases = eng.skillSheet?.databases as any[] || [];
        
        // スキルを統合
        const skills = [
          ...programmingLanguages.map((lang: any) => lang.name || lang),
          ...frameworks.map((fw: any) => fw.name || fw),
          ...databases.map((db: any) => db.name || db)
        ].filter(Boolean);

        // 最新のオファー情報を取得
        const latestOffer = eng.offerEngineers[0];
        const lastOfferStatus = latestOffer ? latestOffer.individualStatus : null;
        const offerHistory = eng.offerEngineers.map(oe => ({
          offerId: oe.offerId.toString(),
          status: oe.individualStatus,
          projectName: oe.offer.projectName,
          sentAt: oe.offer.sentAt.toISOString()
        }));
        
        return {
          id: eng.id.toString(),
          name: eng.name,
          skills: skills,
          experience: eng.skillSheet?.totalExperienceYears || 0,
          availability: eng.availableDate?.toISOString() || '即日',
          availabilityStatus: eng.currentStatus === 'WAITING' ? 'available' : 'unavailable',
          rate: {
            min: eng.hourlyRate ? Math.floor(eng.hourlyRate * 0.9) : 40,
            max: eng.hourlyRate ? Math.floor(eng.hourlyRate * 1.1) : 60
          },
          lastOfferStatus,
          offerHistory
        };
      })
    };
  }
}

export const clientEngineerController = new ClientEngineerController();
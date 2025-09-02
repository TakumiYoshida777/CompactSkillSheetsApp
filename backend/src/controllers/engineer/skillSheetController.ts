import { errorLog } from '../../utils/logger';
import { Request, Response } from 'express';
import { engineerService } from '../../services/engineerService';
import { authService } from '../../services/authService';

/**
 * スキルシート管理コントローラー
 */
class SkillSheetController {
  /**
   * 自分のスキルシート取得
   */
  async getMySkillSheet(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      // ユーザー情報取得
      const user = await authService.getUserById(userId);
      if (!user || !user.engineerId) {
        return res.status(404).json({
          success: false,
          message: 'エンジニアプロフィールが見つかりません',
        });
      }

      // スキルシート取得
      const skillSheet = await engineerService.getSkillSheet(user.engineerId);

      res.status(200).json({
        success: true,
        data: skillSheet,
      });
    } catch (error) {
      errorLog('Get skill sheet error:', error);
      res.status(500).json({
        success: false,
        message: 'スキルシート取得中にエラーが発生しました',
      });
    }
  }

  /**
   * 自分のスキルシート更新
   */
  async updateMySkillSheet(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      // ユーザー情報取得
      const user = await authService.getUserById(userId);
      if (!user || !user.engineerId) {
        return res.status(404).json({
          success: false,
          message: 'エンジニアプロフィールが見つかりません',
        });
      }

      // スキルシート更新
      const updatedSkillSheet = await engineerService.updateSkillSheet(
        user.engineerId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'スキルシートを更新しました',
        data: updatedSkillSheet,
      });
    } catch (error) {
      errorLog('Update skill sheet error:', error);
      res.status(500).json({
        success: false,
        message: 'スキルシート更新中にエラーが発生しました',
      });
    }
  }

  /**
   * スキルシートプレビュー
   */
  async previewMySkillSheet(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      // ユーザー情報取得
      const user = await authService.getUserById(userId);
      if (!user || !user.engineerId) {
        return res.status(404).json({
          success: false,
          message: 'エンジニアプロフィールが見つかりません',
        });
      }

      // スキルシート取得（プレビュー用フォーマット）
      const skillSheet = await engineerService.getSkillSheet(user.engineerId);
      
      // プレビュー用に整形
      const preview = {
        ...skillSheet,
        format: 'preview',
        generatedAt: new Date(),
      };

      res.status(200).json({
        success: true,
        data: preview,
      });
    } catch (error) {
      errorLog('Preview skill sheet error:', error);
      res.status(500).json({
        success: false,
        message: 'プレビュー生成中にエラーが発生しました',
      });
    }
  }

  /**
   * プロジェクト履歴取得
   */
  async getMyProjects(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      // ユーザー情報取得
      const user = await authService.getUserById(userId);
      if (!user || !user.engineerId) {
        return res.status(404).json({
          success: false,
          message: 'エンジニアプロフィールが見つかりません',
        });
      }

      // プロジェクト履歴取得（モック）
      const projects = [
        {
          id: 'project-1',
          name: 'ECサイトリニューアル',
          client: 'A社',
          period: {
            start: '2023-01',
            end: '2023-12',
          },
          role: 'PL',
          team_size: 5,
          technologies: ['React', 'Node.js', 'PostgreSQL'],
          phases: ['詳細設計', '開発', 'テスト'],
          description: 'ECサイトのフルリニューアルプロジェクト。フロントエンドの設計・開発を担当。',
        },
        {
          id: 'project-2',
          name: '在庫管理システム開発',
          client: 'B社',
          period: {
            start: '2022-04',
            end: '2022-12',
          },
          role: 'PG',
          team_size: 8,
          technologies: ['Vue.js', 'Python', 'MySQL'],
          phases: ['開発', 'テスト'],
          description: '在庫管理システムの新規開発。バックエンドAPIの実装を担当。',
        },
      ];

      res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      errorLog('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'プロジェクト履歴取得中にエラーが発生しました',
      });
    }
  }

  /**
   * プロジェクト追加
   */
  async addProject(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      // ユーザー情報取得
      const user = await authService.getUserById(userId);
      if (!user || !user.engineerId) {
        return res.status(404).json({
          success: false,
          message: 'エンジニアプロフィールが見つかりません',
        });
      }

      // プロジェクト追加（モック）
      const newProject = {
        id: `project-${Date.now()}`,
        ...req.body,
        engineerId: user.engineerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json({
        success: true,
        message: 'プロジェクトを追加しました',
        data: newProject,
      });
    } catch (error) {
      errorLog('Add project error:', error);
      res.status(500).json({
        success: false,
        message: 'プロジェクト追加中にエラーが発生しました',
      });
    }
  }

  /**
   * プロジェクト更新
   */
  async updateProject(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { projectId } = req.params;
      
      // ユーザー情報取得
      const user = await authService.getUserById(userId);
      if (!user || !user.engineerId) {
        return res.status(404).json({
          success: false,
          message: 'エンジニアプロフィールが見つかりません',
        });
      }

      // プロジェクト更新（モック）
      const updatedProject = {
        id: projectId,
        ...req.body,
        engineerId: user.engineerId,
        updatedAt: new Date(),
      };

      res.status(200).json({
        success: true,
        message: 'プロジェクトを更新しました',
        data: updatedProject,
      });
    } catch (error) {
      errorLog('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'プロジェクト更新中にエラーが発生しました',
      });
    }
  }

  /**
   * プロジェクト削除
   */
  async deleteProject(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { projectId } = req.params;
      
      // ユーザー情報取得
      const user = await authService.getUserById(userId);
      if (!user || !user.engineerId) {
        return res.status(404).json({
          success: false,
          message: 'エンジニアプロフィールが見つかりません',
        });
      }

      // プロジェクト削除（モック）
      // 実際にはデータベースから削除

      res.status(200).json({
        success: true,
        message: 'プロジェクトを削除しました',
      });
    } catch (error) {
      errorLog('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'プロジェクト削除中にエラーが発生しました',
      });
    }
  }
}

export const skillSheetController = new SkillSheetController();
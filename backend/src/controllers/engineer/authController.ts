import { Request, Response } from 'express';
import { authService } from '../../services/authService';
import { engineerService } from '../../services/engineerService';
import { LoginRequest, RegisterRequest, User } from '../../types/auth';
import { validationResult } from 'express-validator';

/**
 * エンジニア用認証コントローラー
 */
class EngineerAuthController {
  /**
   * エンジニアログイン
   */
  async login(req: Request, res: Response) {
    try {
      // バリデーションエラーチェック
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'バリデーションエラー',
          errors: errors.array(),
        });
      }

      const loginRequest: LoginRequest = req.body;
      
      // ロール指定してログイン
      const result = await authService.loginWithRole(loginRequest, 'engineer');

      // レスポンス送信
      res.status(200).json({
        success: true,
        message: 'ログインに成功しました',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            engineerId: result.user.engineerId,
          },
          tokens: result.tokens,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message === 'メールアドレスまたはパスワードが正しくありません') {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === 'このアカウントはエンジニア権限を持っていません') {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'ログイン処理中にエラーが発生しました',
      });
    }
  }

  /**
   * エンジニア新規登録
   */
  async register(req: Request, res: Response) {
    try {
      // バリデーションエラーチェック
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'バリデーションエラー',
          errors: errors.array(),
        });
      }

      const registerRequest: RegisterRequest = {
        ...req.body,
        role: 'engineer', // エンジニアロールを固定
      };

      const result = await authService.register(registerRequest);

      // エンジニアプロフィール作成
      await engineerService.createEngineerProfile(result.user.id, {
        name: result.user.name,
        email: result.user.email,
        phoneNumber: req.body.phoneNumber,
        experienceYears: req.body.experienceYears || 0,
        skills: [],
        availability: 'available',
      });

      res.status(201).json({
        success: true,
        message: 'エンジニア登録に成功しました',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
          tokens: result.tokens,
        },
      });
    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.message === 'このメールアドレスは既に登録されています') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: '登録処理中にエラーが発生しました',
      });
    }
  }

  /**
   * リフレッシュトークン
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'リフレッシュトークンが必要です',
        });
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'トークンを更新しました',
        data: { tokens },
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      
      if (error.message === '無効なリフレッシュトークンです' ||
          error.message === 'リフレッシュトークンの有効期限が切れています') {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'トークン更新中にエラーが発生しました',
      });
    }
  }

  /**
   * ログアウト
   */
  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.status(200).json({
        success: true,
        message: 'ログアウトしました',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'ログアウト処理中にエラーが発生しました',
      });
    }
  }

  /**
   * プロフィール取得
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      const user = await authService.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'ユーザーが見つかりません',
        });
      }

      const engineerProfile = await engineerService.getEngineerProfile(user.engineerId!);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          profile: engineerProfile,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'プロフィール取得中にエラーが発生しました',
      });
    }
  }

  /**
   * プロフィール更新
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      const user = await authService.getUserById(userId);
      if (!user || !user.engineerId) {
        return res.status(404).json({
          success: false,
          message: 'エンジニアプロフィールが見つかりません',
        });
      }

      const updatedProfile = await engineerService.updateEngineerProfile(
        user.engineerId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'プロフィールを更新しました',
        data: {
          profile: updatedProfile,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'プロフィール更新中にエラーが発生しました',
      });
    }
  }

  /**
   * パスワード変更
   */
  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '現在のパスワードと新しいパスワードが必要です',
        });
      }

      await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'パスワードを変更しました',
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      
      if (error.message === '現在のパスワードが正しくありません') {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'パスワード変更中にエラーが発生しました',
      });
    }
  }

}

export const engineerAuthController = new EngineerAuthController();
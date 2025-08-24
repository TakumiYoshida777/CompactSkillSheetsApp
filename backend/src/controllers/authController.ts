import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { LoginRequest, RegisterRequest } from '../types/auth';
import { validationResult } from 'express-validator';

/**
 * 認証コントローラー
 */
export class AuthController {
  /**
   * ログイン処理
   */
  async login(req: Request, res: Response) {
    try {
      // バリデーションエラーチェック
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値にエラーがあります',
            details: errors.array()
          }
        });
      }

      const loginRequest: LoginRequest = req.body;
      const result = await AuthService.login(loginRequest);

      // ログイン成功
      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn
        },
        message: 'ログインに成功しました'
      });
    } catch (error: any) {
      console.error('ログインエラー:', error);
      
      // 認証エラーの場合
      if (error.statusCode === 401) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: error.message
          }
        });
      }

      // その他のエラー
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'ログイン処理中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 新規登録処理
   */
  async register(req: Request, res: Response) {
    try {
      // バリデーションエラーチェック
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力値にエラーがあります',
            details: errors.array()
          }
        });
      }

      const registerRequest: RegisterRequest = req.body;
      const result = await AuthService.register(registerRequest);

      // 登録成功
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn
        },
        message: 'アカウント登録に成功しました'
      });
    } catch (error: any) {
      console.error('登録エラー:', error);

      // 既存ユーザーエラー
      if (error.message.includes('既に使用されています')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_EMAIL',
            message: error.message
          }
        });
      }

      // その他のエラー
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'アカウント登録処理中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * トークンリフレッシュ処理
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'リフレッシュトークンが必要です'
          }
        });
      }

      const tokens = await AuthService.refreshToken({ refreshToken });

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        },
        message: 'トークンを更新しました'
      });
    } catch (error: any) {
      console.error('トークンリフレッシュエラー:', error);

      if (error.statusCode === 401) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'トークン更新処理中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * ログアウト処理
   */
  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.json({
        success: true,
        message: 'ログアウトしました'
      });
    } catch (error) {
      console.error('ログアウトエラー:', error);

      // ログアウトは失敗してもエラーにしない
      res.json({
        success: true,
        message: 'ログアウトしました'
      });
    }
  }

  /**
   * 現在のユーザー情報取得
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です'
          }
        });
      }

      const user = await AuthService.getUserById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'ユーザーが見つかりません'
          }
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'ユーザー情報の取得中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * パスワード変更
   */
  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です'
          }
        });
      }

      const { currentPassword, newPassword } = req.body;

      // バリデーション
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '現在のパスワードと新しいパスワードが必要です'
          }
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'パスワードは8文字以上必要です'
          }
        });
      }

      await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'パスワードを変更しました'
      });
    } catch (error: any) {
      console.error('パスワード変更エラー:', error);

      if (error.statusCode === 401) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'パスワード変更処理中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * ユーザー権限確認
   */
  async checkPermission(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です'
          }
        });
      }

      const { resource, action } = req.query;

      if (!resource || !action) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'リソースとアクションの指定が必要です'
          }
        });
      }

      const user = await AuthService.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'ユーザーが見つかりません'
          }
        });
      }

      const hasPermission = AuthService.hasPermission(
        user,
        resource as string,
        action as string
      );

      res.json({
        success: true,
        data: {
          hasPermission,
          resource,
          action
        }
      });
    } catch (error) {
      console.error('権限確認エラー:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '権限確認処理中にエラーが発生しました'
        }
      });
    }
  }
}

export const authController = new AuthController();
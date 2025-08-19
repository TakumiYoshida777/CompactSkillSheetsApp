import { Request, Response } from 'express';
import { companyService } from '../services/companyService';
import { validationResult } from 'express-validator';

/**
 * 企業管理コントローラー
 */
export class CompanyController {
  /**
   * 企業作成（管理者ユーザー含む）
   */
  async createCompany(req: Request, res: Response) {
    try {
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

      const result = await companyService.createCompany(req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: '企業とアカウントを作成しました'
      });
    } catch (error: any) {
      console.error('企業作成エラー:', error);

      if (error.message.includes('既に')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '企業作成処理中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 企業情報取得
   */
  async getCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const company = await companyService.getCompanyById(companyId);

      if (!company) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '企業が見つかりません'
          }
        });
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('企業取得エラー:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '企業情報の取得中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 企業一覧取得
   */
  async getCompanies(req: Request, res: Response) {
    try {
      const { companyType, isActive } = req.query;
      const filters: any = {};

      if (companyType) {
        filters.companyType = companyType as 'ses' | 'client';
      }
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const companies = await companyService.getAllCompanies(filters);

      res.json({
        success: true,
        data: companies,
        meta: {
          total: companies.length
        }
      });
    } catch (error) {
      console.error('企業一覧取得エラー:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '企業一覧の取得中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 企業情報更新
   */
  async updateCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
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

      const updatedCompany = await companyService.updateCompany(companyId, req.body);

      res.json({
        success: true,
        data: updatedCompany,
        message: '企業情報を更新しました'
      });
    } catch (error: any) {
      console.error('企業更新エラー:', error);

      if (error.message === '企業が見つかりません') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '企業更新処理中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 企業削除（論理削除）
   */
  async deleteCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      await companyService.deleteCompany(companyId);

      res.json({
        success: true,
        message: '企業を削除しました'
      });
    } catch (error: any) {
      console.error('企業削除エラー:', error);

      if (error.message === '企業が見つかりません') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '企業削除処理中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 企業のユーザー一覧取得
   */
  async getCompanyUsers(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const users = await companyService.getCompanyUsers(companyId);

      res.json({
        success: true,
        data: users,
        meta: {
          total: users.length
        }
      });
    } catch (error) {
      console.error('ユーザー一覧取得エラー:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'ユーザー一覧の取得中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 企業にユーザー追加
   */
  async addUserToCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
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

      const user = await companyService.addUserToCompany(companyId, req.body);

      res.status(201).json({
        success: true,
        data: user,
        message: 'ユーザーを追加しました'
      });
    } catch (error: any) {
      console.error('ユーザー追加エラー:', error);

      if (error.message === '企業が見つかりません') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      if (error.message.includes('既に使用されています')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'ユーザー追加処理中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 企業統計情報取得
   */
  async getCompanyStatistics(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      const statistics = await companyService.getCompanyStatistics(companyId);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      console.error('統計情報取得エラー:', error);

      if (error.message === '企業が見つかりません') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '統計情報の取得中にエラーが発生しました'
        }
      });
    }
  }

  /**
   * 現在のユーザーの企業情報取得
   */
  async getCurrentCompany(req: Request, res: Response) {
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

      const company = await companyService.getCompanyById(req.user.companyId);

      if (!company) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '企業が見つかりません'
          }
        });
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('企業情報取得エラー:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '企業情報の取得中にエラーが発生しました'
        }
      });
    }
  }
}

export const companyController = new CompanyController();
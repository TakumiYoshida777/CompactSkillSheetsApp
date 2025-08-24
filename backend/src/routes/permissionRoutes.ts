import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import AuthService from '../services/authService';
import logger from '../utils/logger';

const router = Router();

// 現在のユーザーの権限一覧を取得
router.get('/permissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const permissions = await AuthService.getUserPermissions(userId);
    
    // 権限を構造化されたオブジェクトに変換
    const structuredPermissions = permissions.map((perm, index) => {
      const parts = perm.split(':');
      return {
        id: `${index + 1}`,
        name: perm,
        resource: parts[0] || '',
        action: parts[1] || '',
        scope: parts[2] || undefined
      };
    });

    return res.json({
      success: true,
      data: structuredPermissions
    });
  } catch (error) {
    logger.error('Error fetching user permissions:', error);
    return res.status(500).json({
      success: false,
      message: '権限情報の取得中にエラーが発生しました'
    });
  }
});

// 現在のユーザーのロール一覧を取得
router.get('/user-roles', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const roles = await AuthService.getUserRoles(userId);
    
    return res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    logger.error('Error fetching user roles:', error);
    return res.status(500).json({
      success: false,
      message: 'ロール情報の取得中にエラーが発生しました'
    });
  }
});

// 権限チェックAPI
router.post('/check-permission', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { resource, action, scope, targetId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    if (!resource || !action) {
      return res.status(400).json({
        success: false,
        message: 'リソースとアクションは必須です'
      });
    }

    const hasPermission = await AuthService.hasPermission(
      userId,
      resource,
      action,
      scope,
      targetId
    );

    return res.json({
      success: true,
      data: {
        hasPermission,
        resource,
        action,
        scope
      }
    });
  } catch (error) {
    logger.error('Error checking permission:', error);
    return res.status(500).json({
      success: false,
      message: '権限チェック中にエラーが発生しました'
    });
  }
});

export default router;
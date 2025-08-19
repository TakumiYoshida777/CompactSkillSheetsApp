import { Router } from 'express';
import { engineerAuthController } from '../../controllers/engineer/authController';
import { authenticateToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { loginSchema, engineerRegisterSchema, updateEngineerProfileSchema } from '../../validators/authValidator';

const router = Router();

// 公開エンドポイント（認証不要）
router.post(
  '/register',
  validateRequest(engineerRegisterSchema),
  engineerAuthController.register
);

router.post(
  '/login',
  validateRequest(loginSchema),
  engineerAuthController.login
);

router.post('/refresh', engineerAuthController.refreshToken);

// デモアカウントログイン（認証不要）
router.post('/demo-login', engineerAuthController.demoLogin);

// 認証が必要なエンドポイント
router.use(authenticateToken);
router.use(requireRole('engineer'));

router.get('/profile', engineerAuthController.getProfile);

router.put(
  '/profile',
  validateRequest(updateEngineerProfileSchema),
  engineerAuthController.updateProfile
);

router.post('/logout', engineerAuthController.logout);

router.put('/change-password', engineerAuthController.changePassword);

export default router;
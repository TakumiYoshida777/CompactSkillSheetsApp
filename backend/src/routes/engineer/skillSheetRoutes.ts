import { Router } from 'express';
import { skillSheetController } from '../../controllers/engineer/skillSheetController';
import { authenticateToken } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { updateSkillSheetSchema } from '../../validators/authValidator';

const router = Router();

// 認証とエンジニアロールが必要
router.use(authenticateToken);
router.use(requireRole('engineer'));

// スキルシート取得
router.get('/my-skill-sheet', skillSheetController.getMySkillSheet);

// スキルシート更新
router.put(
  '/my-skill-sheet',
  validateRequest(updateSkillSheetSchema),
  skillSheetController.updateMySkillSheet
);

// スキルシートプレビュー
router.get('/my-skill-sheet/preview', skillSheetController.previewMySkillSheet);

// プロジェクト履歴取得
router.get('/my-projects', skillSheetController.getMyProjects);

// プロジェクト追加
router.post('/my-projects', skillSheetController.addProject);

// プロジェクト更新
router.put('/my-projects/:projectId', skillSheetController.updateProject);

// プロジェクト削除
router.delete('/my-projects/:projectId', skillSheetController.deleteProject);

export default router;
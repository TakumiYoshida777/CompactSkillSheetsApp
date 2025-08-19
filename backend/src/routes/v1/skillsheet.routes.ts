import { Router } from 'express';
import { SkillSheetController } from '../../controllers/skillsheet.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const skillSheetController = new SkillSheetController();

// URLトークンによる閲覧（認証不要）
router.get('/view', (req, res) => skillSheetController.viewByToken(req, res));

// URL生成（認証必要）
router.post('/generate-url', authMiddleware, (req, res) => skillSheetController.generateUrl(req, res));

export default router;
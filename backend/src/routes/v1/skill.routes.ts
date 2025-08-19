import { Router } from 'express';
import { SkillController } from '../../controllers/skill.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { skillValidation } from '../../validators/skill.validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { companyMiddleware } from '../../middleware/company.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';

const router = Router();
const controller = new SkillController();

// 認証とマルチテナント対応のミドルウェアを適用
router.use(authMiddleware);
router.use(companyMiddleware);

// スキルマスタ管理
router.get('/master', paginationMiddleware, controller.getMasterSkills);
router.post('/master', validateRequest(skillValidation.createMaster), controller.createMasterSkill);
router.put('/master/:id', validateRequest(skillValidation.updateMaster), controller.updateMasterSkill);
router.delete('/master/:id', controller.deleteMasterSkill);

// スキルカテゴリ管理
router.get('/categories', controller.getCategories);
router.post('/categories', validateRequest(skillValidation.createCategory), controller.createCategory);
router.put('/categories/:id', validateRequest(skillValidation.updateCategory), controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

// スキル検索・サジェスト
router.get('/search', controller.searchSkills);
router.get('/suggest', controller.suggestSkills);

// エンジニアスキル管理
router.get('/engineers/:engineerId', controller.getEngineerSkills);
router.post('/engineers/:engineerId', validateRequest(skillValidation.addEngineerSkill), controller.addEngineerSkill);
router.put('/engineers/:engineerId/:skillId', validateRequest(skillValidation.updateEngineerSkill), controller.updateEngineerSkill);
router.delete('/engineers/:engineerId/:skillId', controller.removeEngineerSkill);

// スキル統計
router.get('/statistics', controller.getStatistics);
router.get('/statistics/demand', controller.getDemandStatistics);

export default router;
import { Router } from 'express';
import { SearchController } from '../../controllers/search.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { searchValidation } from '../../validators/search.validator';
import { authMiddleware } from '../../middleware/auth.middleware';
import { companyMiddleware } from '../../middleware/company.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';

const router = Router();
const controller = new SearchController();

// 認証とマルチテナント対応のミドルウェアを適用
router.use(authMiddleware);
router.use(companyMiddleware);

// エンジニア検索
router.post('/engineers', paginationMiddleware, validateRequest(searchValidation.engineers), controller.searchEngineers);

// プロジェクト検索
router.post('/projects', paginationMiddleware, validateRequest(searchValidation.projects), controller.searchProjects);

// スキルベース検索
router.post('/by-skills', paginationMiddleware, validateRequest(searchValidation.bySkills), controller.searchBySkills);

// 稼働可能エンジニア検索
router.post('/available', paginationMiddleware, validateRequest(searchValidation.available), controller.searchAvailable);

// 類似エンジニア検索
router.get('/similar/:engineerId', paginationMiddleware, controller.findSimilarEngineers);

// 高度な検索（Elasticsearch使用）
router.post('/advanced', paginationMiddleware, validateRequest(searchValidation.advanced), controller.advancedSearch);

// 検索履歴
router.get('/history', paginationMiddleware, controller.getSearchHistory);
router.delete('/history/:id', controller.deleteSearchHistory);

// 保存済み検索条件
router.get('/saved', controller.getSavedSearches);
router.post('/saved', validateRequest(searchValidation.saveSearch), controller.saveSearch);
router.put('/saved/:id', validateRequest(searchValidation.updateSavedSearch), controller.updateSavedSearch);
router.delete('/saved/:id', controller.deleteSavedSearch);

export default router;
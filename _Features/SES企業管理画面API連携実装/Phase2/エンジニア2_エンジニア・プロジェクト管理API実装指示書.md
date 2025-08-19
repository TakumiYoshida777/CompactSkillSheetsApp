# エンジニア2 - エンジニア・プロジェクト管理API実装指示書

## 担当者: エンジニア2
## 優先度: 高（コア機能のため）
## 実装期限: 3営業日以内
## 前提: エンジニア1のDay1完了後に着手

---

## 1. 担当範囲

### 1.1 エンジニア管理API
- エンジニア情報のCRUD操作
- スキルシート管理
- ステータス管理
- 検索・フィルタリング機能
- 一括操作機能

### 1.2 プロジェクト管理API
- プロジェクトCRUD操作
- アサイン管理
- 稼働状況管理
- タイムライン表示

---

## 2. 実装タスク詳細

### 2.1 エンジニア管理API実装

#### 2.1.1 エンジニアルート定義
```typescript
// backend/src/routes/v1/engineer.routes.ts
import { Router } from 'express';
import { EngineerController } from '../../controllers/engineer.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { engineerValidation } from '../../validations/engineer.validation';

const router = Router();
const controller = new EngineerController();

// 基本CRUD
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(engineerValidation.create), controller.create);
router.put('/:id', validateRequest(engineerValidation.update), controller.update);
router.delete('/:id', controller.delete);

// ステータス管理
router.patch('/:id/status', controller.updateStatus);
router.patch('/:id/availability', controller.updateAvailability);
router.patch('/:id/public', controller.updatePublicStatus);

// スキルシート
router.get('/:id/skill-sheet', controller.getSkillSheet);
router.put('/:id/skill-sheet', validateRequest(engineerValidation.skillSheet), controller.updateSkillSheet);
router.post('/:id/skill-sheet/export', controller.exportSkillSheet);

// 検索・フィルタリング
router.post('/search', controller.search);
router.get('/waiting', controller.getWaitingEngineers);
router.get('/available', controller.getAvailableEngineers);

// 一括操作
router.patch('/bulk/status', controller.bulkUpdateStatus);
router.post('/bulk/export', controller.bulkExport);

export default router;
```

#### 2.1.2 エンジニアコントローラー実装
```typescript
// backend/src/controllers/engineer.controller.ts
import { Request, Response, NextFunction } from 'express';
import { EngineerService } from '../services/engineer.service';
import { ApiResponse } from '../utils/response.util';

export class EngineerController {
  private service: EngineerService;
  
  constructor() {
    this.service = new EngineerService();
  }
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, offset } = req.pagination;
      const filters = req.query;
      
      const engineers = await this.service.findAll(
        req.companyId,
        { page, limit, offset },
        filters
      );
      
      const total = await this.service.count(req.companyId, filters);
      
      res.json(ApiResponse.paginated(engineers, {
        page,
        limit,
        total
      }));
    } catch (error) {
      next(error);
    }
  };
  
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineer = await this.service.findById(
        parseInt(req.params.id),
        req.companyId
      );
      
      if (!engineer) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'エンジニアが見つかりません')
        );
      }
      
      res.json(ApiResponse.success(engineer));
    } catch (error) {
      next(error);
    }
  };
  
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineer = await this.service.create(req.body, req.companyId);
      res.status(201).json(ApiResponse.success(engineer));
    } catch (error) {
      next(error);
    }
  };
  
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineer = await this.service.update(
        parseInt(req.params.id),
        req.body,
        req.companyId
      );
      
      if (!engineer) {
        return res.status(404).json(
          ApiResponse.error('NOT_FOUND', 'エンジニアが見つかりません')
        );
      }
      
      res.json(ApiResponse.success(engineer));
    } catch (error) {
      next(error);
    }
  };
  
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const engineer = await this.service.updateStatus(
        parseInt(req.params.id),
        status,
        req.companyId
      );
      
      res.json(ApiResponse.success(engineer));
    } catch (error) {
      next(error);
    }
  };
  
  getSkillSheet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skillSheet = await this.service.getSkillSheet(
        parseInt(req.params.id),
        req.companyId
      );
      
      res.json(ApiResponse.success(skillSheet));
    } catch (error) {
      next(error);
    }
  };
  
  updateSkillSheet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skillSheet = await this.service.updateSkillSheet(
        parseInt(req.params.id),
        req.body,
        req.companyId
      );
      
      res.json(ApiResponse.success(skillSheet));
    } catch (error) {
      next(error);
    }
  };
  
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, skills, status, yearsOfExperience } = req.body;
      const { page, limit, offset } = req.pagination;
      
      const results = await this.service.search(
        req.companyId,
        {
          query,
          skills,
          status,
          yearsOfExperience
        },
        { page, limit, offset }
      );
      
      res.json(ApiResponse.paginated(results.data, {
        page,
        limit,
        total: results.total
      }));
    } catch (error) {
      next(error);
    }
  };
  
  getWaitingEngineers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const engineers = await this.service.findByStatus(
        req.companyId,
        'waiting',
        req.pagination
      );
      
      res.json(ApiResponse.success(engineers));
    } catch (error) {
      next(error);
    }
  };
  
  bulkUpdateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { engineerIds, status } = req.body;
      
      const updated = await this.service.bulkUpdateStatus(
        engineerIds,
        status,
        req.companyId
      );
      
      res.json(ApiResponse.success({
        updated: updated.length,
        engineerIds: updated
      }));
    } catch (error) {
      next(error);
    }
  };
}
```

#### 2.1.3 エンジニアサービス実装
```typescript
// backend/src/services/engineer.service.ts
import { EngineerRepository } from '../repositories/engineer.repository';
import { SkillSheetRepository } from '../repositories/skillSheet.repository';
import { Database } from '../database';

export class EngineerService {
  private engineerRepo: EngineerRepository;
  private skillSheetRepo: SkillSheetRepository;
  private db: Database;
  
  constructor() {
    this.db = Database.getInstance();
    this.engineerRepo = new EngineerRepository(this.db);
    this.skillSheetRepo = new SkillSheetRepository(this.db);
  }
  
  async findAll(companyId: number, pagination: any, filters: any) {
    return this.engineerRepo.findAllWithFilters(companyId, pagination, filters);
  }
  
  async findById(id: number, companyId: number) {
    const engineer = await this.engineerRepo.findById(id, companyId);
    if (engineer) {
      engineer.skillSheet = await this.skillSheetRepo.findByEngineerId(engineer.id);
    }
    return engineer;
  }
  
  async create(data: any, companyId: number) {
    return this.db.transaction(async (trx) => {
      // エンジニア作成
      const engineer = await this.engineerRepo.create(data, companyId, trx);
      
      // スキルシート初期化
      await this.skillSheetRepo.create({
        engineer_id: engineer.id,
        company_id: companyId,
        completion_percentage: 0
      }, trx);
      
      return engineer;
    });
  }
  
  async updateStatus(id: number, status: string, companyId: number) {
    const validStatuses = ['waiting', 'assigned', 'upcoming', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw new Error('無効なステータスです');
    }
    
    return this.engineerRepo.update(id, { status }, companyId);
  }
  
  async search(companyId: number, criteria: any, pagination: any) {
    return this.engineerRepo.search(companyId, criteria, pagination);
  }
  
  async findByStatus(companyId: number, status: string, pagination: any) {
    return this.engineerRepo.findByStatus(companyId, status, pagination);
  }
  
  async bulkUpdateStatus(engineerIds: number[], status: string, companyId: number) {
    return this.db.transaction(async (trx) => {
      const updated = [];
      for (const id of engineerIds) {
        await this.engineerRepo.update(id, { status }, companyId, trx);
        updated.push(id);
      }
      return updated;
    });
  }
  
  async getSkillSheet(engineerId: number, companyId: number) {
    // エンジニアの存在確認
    const engineer = await this.engineerRepo.findById(engineerId, companyId);
    if (!engineer) {
      throw new Error('エンジニアが見つかりません');
    }
    
    return this.skillSheetRepo.findByEngineerId(engineerId);
  }
  
  async updateSkillSheet(engineerId: number, data: any, companyId: number) {
    // エンジニアの存在確認
    const engineer = await this.engineerRepo.findById(engineerId, companyId);
    if (!engineer) {
      throw new Error('エンジニアが見つかりません');
    }
    
    // 完了率計算
    const completionPercentage = this.calculateCompletionPercentage(data);
    
    return this.skillSheetRepo.update(engineerId, {
      ...data,
      completion_percentage: completionPercentage,
      updated_at: new Date()
    });
  }
  
  private calculateCompletionPercentage(skillSheet: any): number {
    const requiredFields = [
      'basic_info',
      'technical_skills',
      'experience_years',
      'projects',
      'qualifications'
    ];
    
    let completed = 0;
    requiredFields.forEach(field => {
      if (skillSheet[field] && Object.keys(skillSheet[field]).length > 0) {
        completed++;
      }
    });
    
    return Math.round((completed / requiredFields.length) * 100);
  }
}
```

### 2.2 プロジェクト管理API実装

#### 2.2.1 プロジェクトルート定義
```typescript
// backend/src/routes/v1/project.routes.ts
import { Router } from 'express';
import { ProjectController } from '../../controllers/project.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { projectValidation } from '../../validations/project.validation';

const router = Router();
const controller = new ProjectController();

// 基本CRUD
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(projectValidation.create), controller.create);
router.put('/:id', validateRequest(projectValidation.update), controller.update);
router.delete('/:id', controller.delete);

// ステータス管理
router.patch('/:id/status', controller.updateStatus);

// アサイン管理
router.get('/:id/assignments', controller.getAssignments);
router.post('/:id/assignments', controller.createAssignment);
router.put('/:id/assignments/:assignmentId', controller.updateAssignment);
router.delete('/:id/assignments/:assignmentId', controller.deleteAssignment);

// 稼働状況
router.get('/timeline', controller.getTimeline);
router.get('/utilization', controller.getUtilization);
router.get('/:id/timeline', controller.getProjectTimeline);

// カレンダー表示
router.get('/calendar', controller.getCalendarView);

// 検索
router.post('/search', controller.search);

export default router;
```

#### 2.2.2 プロジェクトコントローラー実装
```typescript
// backend/src/controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { ApiResponse } from '../utils/response.util';

export class ProjectController {
  private service: ProjectService;
  
  constructor() {
    this.service = new ProjectService();
  }
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, dateFrom, dateTo } = req.query;
      const { page, limit, offset } = req.pagination;
      
      const projects = await this.service.findAll(
        req.companyId,
        { page, limit, offset },
        { status, dateFrom, dateTo }
      );
      
      const total = await this.service.count(req.companyId, { status });
      
      res.json(ApiResponse.paginated(projects, {
        page,
        limit,
        total
      }));
    } catch (error) {
      next(error);
    }
  };
  
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await this.service.create(req.body, req.companyId);
      res.status(201).json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  };
  
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const project = await this.service.updateStatus(
        parseInt(req.params.id),
        status,
        req.companyId
      );
      
      res.json(ApiResponse.success(project));
    } catch (error) {
      next(error);
    }
  };
  
  getAssignments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignments = await this.service.getAssignments(
        parseInt(req.params.id),
        req.companyId
      );
      
      res.json(ApiResponse.success(assignments));
    } catch (error) {
      next(error);
    }
  };
  
  createAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignment = await this.service.createAssignment(
        parseInt(req.params.id),
        req.body,
        req.companyId
      );
      
      res.status(201).json(ApiResponse.success(assignment));
    } catch (error) {
      next(error);
    }
  };
  
  getTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      
      const timeline = await this.service.getCompanyTimeline(
        req.companyId,
        startDate as string,
        endDate as string
      );
      
      res.json(ApiResponse.success(timeline));
    } catch (error) {
      next(error);
    }
  };
  
  getUtilization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const utilization = await this.service.calculateUtilization(req.companyId);
      
      res.json(ApiResponse.success(utilization));
    } catch (error) {
      next(error);
    }
  };
  
  getCalendarView = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { year, month } = req.query;
      
      const calendar = await this.service.getCalendarData(
        req.companyId,
        parseInt(year as string),
        parseInt(month as string)
      );
      
      res.json(ApiResponse.success(calendar));
    } catch (error) {
      next(error);
    }
  };
}
```

#### 2.2.3 プロジェクトサービス実装
```typescript
// backend/src/services/project.service.ts
import { ProjectRepository } from '../repositories/project.repository';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { EngineerRepository } from '../repositories/engineer.repository';
import { Database } from '../database';

export class ProjectService {
  private projectRepo: ProjectRepository;
  private assignmentRepo: AssignmentRepository;
  private engineerRepo: EngineerRepository;
  private db: Database;
  
  constructor() {
    this.db = Database.getInstance();
    this.projectRepo = new ProjectRepository(this.db);
    this.assignmentRepo = new AssignmentRepository(this.db);
    this.engineerRepo = new EngineerRepository(this.db);
  }
  
  async create(data: any, companyId: number) {
    // プロジェクト作成
    const project = await this.projectRepo.create({
      ...data,
      company_id: companyId,
      status: data.status || 'planning'
    });
    
    return project;
  }
  
  async updateStatus(id: number, status: string, companyId: number) {
    const validStatuses = ['planning', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('無効なステータスです');
    }
    
    return this.db.transaction(async (trx) => {
      const project = await this.projectRepo.update(
        id,
        { status },
        companyId,
        trx
      );
      
      // ステータスがcompletedの場合、エンジニアを待機状態に
      if (status === 'completed') {
        const assignments = await this.assignmentRepo.findByProjectId(id, trx);
        for (const assignment of assignments) {
          await this.engineerRepo.update(
            assignment.engineer_id,
            { status: 'waiting' },
            companyId,
            trx
          );
        }
      }
      
      return project;
    });
  }
  
  async createAssignment(projectId: number, data: any, companyId: number) {
    return this.db.transaction(async (trx) => {
      // プロジェクト存在確認
      const project = await this.projectRepo.findById(projectId, companyId, trx);
      if (!project) {
        throw new Error('プロジェクトが見つかりません');
      }
      
      // エンジニア存在確認
      const engineer = await this.engineerRepo.findById(data.engineer_id, companyId, trx);
      if (!engineer) {
        throw new Error('エンジニアが見つかりません');
      }
      
      // 重複チェック
      const existing = await this.assignmentRepo.findByProjectAndEngineer(
        projectId,
        data.engineer_id,
        trx
      );
      if (existing) {
        throw new Error('既にアサイン済みです');
      }
      
      // アサイン作成
      const assignment = await this.assignmentRepo.create({
        project_id: projectId,
        engineer_id: data.engineer_id,
        role: data.role,
        start_date: data.start_date,
        end_date: data.end_date,
        allocation_percentage: data.allocation_percentage || 100
      }, trx);
      
      // エンジニアステータス更新
      await this.engineerRepo.update(
        data.engineer_id,
        { status: 'assigned' },
        companyId,
        trx
      );
      
      return assignment;
    });
  }
  
  async getCompanyTimeline(companyId: number, startDate: string, endDate: string) {
    const projects = await this.projectRepo.findByDateRange(
      companyId,
      startDate,
      endDate
    );
    
    const timeline = await Promise.all(
      projects.map(async (project) => {
        const assignments = await this.assignmentRepo.findByProjectId(project.id);
        return {
          project,
          assignments: await Promise.all(
            assignments.map(async (assignment) => {
              const engineer = await this.engineerRepo.findById(
                assignment.engineer_id,
                companyId
              );
              return { ...assignment, engineer };
            })
          )
        };
      })
    );
    
    return timeline;
  }
  
  async calculateUtilization(companyId: number) {
    const totalEngineers = await this.engineerRepo.count(companyId);
    const assignedEngineers = await this.engineerRepo.countByStatus(
      companyId,
      'assigned'
    );
    const waitingEngineers = await this.engineerRepo.countByStatus(
      companyId,
      'waiting'
    );
    
    return {
      total: totalEngineers,
      assigned: assignedEngineers,
      waiting: waitingEngineers,
      utilizationRate: totalEngineers > 0 
        ? Math.round((assignedEngineers / totalEngineers) * 100)
        : 0
    };
  }
  
  async getCalendarData(companyId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const projects = await this.projectRepo.findByDateRange(
      companyId,
      startDate.toISOString(),
      endDate.toISOString()
    );
    
    // カレンダー形式にデータを整形
    const calendarData = {};
    projects.forEach(project => {
      const projectStart = new Date(project.start_date);
      const projectEnd = new Date(project.end_date);
      
      for (let d = new Date(projectStart); d <= projectEnd; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (!calendarData[dateKey]) {
          calendarData[dateKey] = [];
        }
        calendarData[dateKey].push({
          id: project.id,
          name: project.name,
          status: project.status
        });
      }
    });
    
    return calendarData;
  }
}
```

### 2.3 リポジトリ実装

#### 2.3.1 エンジニアリポジトリ
```typescript
// backend/src/repositories/engineer.repository.ts
import { BaseRepository } from './base.repository';

export class EngineerRepository extends BaseRepository<Engineer> {
  constructor(db: Database) {
    super('engineers', db);
  }
  
  async findAllWithFilters(companyId: number, pagination: any, filters: any) {
    let query = this.db(this.tableName)
      .where({ company_id: companyId });
    
    // フィルター適用
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    if (filters.skills) {
      query = query.whereRaw('skills @> ?', [JSON.stringify(filters.skills)]);
    }
    if (filters.available_from) {
      query = query.where('available_from', '<=', filters.available_from);
    }
    
    // ページネーション
    if (pagination) {
      query = query.limit(pagination.limit).offset(pagination.offset);
    }
    
    return query.orderBy('created_at', 'desc');
  }
  
  async search(companyId: number, criteria: any, pagination: any) {
    let query = this.db(this.tableName)
      .where({ company_id: companyId });
    
    if (criteria.query) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${criteria.query}%`)
          .orWhere('email', 'ilike', `%${criteria.query}%`)
          .orWhere('profile', 'ilike', `%${criteria.query}%`);
      });
    }
    
    if (criteria.skills && criteria.skills.length > 0) {
      query = query.whereRaw('skills ?& array[?]', [criteria.skills]);
    }
    
    if (criteria.yearsOfExperience) {
      query = query.where('years_of_experience', '>=', criteria.yearsOfExperience);
    }
    
    const countQuery = query.clone();
    const total = await countQuery.count('* as count').first();
    
    if (pagination) {
      query = query.limit(pagination.limit).offset(pagination.offset);
    }
    
    const data = await query.orderBy('created_at', 'desc');
    
    return {
      data,
      total: parseInt(total.count)
    };
  }
  
  async findByStatus(companyId: number, status: string, pagination: any) {
    let query = this.db(this.tableName)
      .where({ company_id: companyId, status });
    
    if (pagination) {
      query = query.limit(pagination.limit).offset(pagination.offset);
    }
    
    return query.orderBy('available_from', 'asc');
  }
  
  async countByStatus(companyId: number, status: string) {
    const result = await this.db(this.tableName)
      .where({ company_id: companyId, status })
      .count('* as count')
      .first();
    
    return parseInt(result.count);
  }
}
```

#### 2.3.2 プロジェクトリポジトリ
```typescript
// backend/src/repositories/project.repository.ts
import { BaseRepository } from './base.repository';

export class ProjectRepository extends BaseRepository<Project> {
  constructor(db: Database) {
    super('projects', db);
  }
  
  async findByDateRange(companyId: number, startDate: string, endDate: string) {
    return this.db(this.tableName)
      .where({ company_id: companyId })
      .where('start_date', '<=', endDate)
      .where('end_date', '>=', startDate)
      .orderBy('start_date', 'asc');
  }
  
  async findActive(companyId: number) {
    return this.db(this.tableName)
      .where({ company_id: companyId, status: 'active' })
      .orderBy('start_date', 'asc');
  }
  
  async findUpcoming(companyId: number, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.db(this.tableName)
      .where({ company_id: companyId })
      .where('status', 'planning')
      .where('start_date', '<=', futureDate.toISOString())
      .orderBy('start_date', 'asc');
  }
}
```

---

## 3. テスト実装

### 3.1 エンジニアAPIテスト
```typescript
// backend/src/test/engineer.test.ts
import request from 'supertest';
import app from '../app';
import { TestDatabase } from './helpers/database.helper';

describe('Engineer API', () => {
  let db: TestDatabase;
  const companyId = 1;
  
  beforeAll(async () => {
    db = TestDatabase.getInstance();
    await db.setup();
    await db.seed(companyId);
  });
  
  afterEach(async () => {
    await db.cleanup();
  });
  
  afterAll(async () => {
    await db.teardown();
  });
  
  describe('GET /api/v1/engineers', () => {
    it('エンジニア一覧を取得できる', async () => {
      const response = await request(app)
        .get('/api/v1/engineers')
        .set('X-Company-ID', companyId.toString())
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('ページネーションが機能する', async () => {
      const response = await request(app)
        .get('/api/v1/engineers?page=1&limit=10')
        .set('X-Company-ID', companyId.toString())
        .expect(200);
      
      expect(response.body.meta.pagination).toBeDefined();
      expect(response.body.meta.pagination.page).toBe(1);
      expect(response.body.meta.pagination.limit).toBe(10);
    });
  });
  
  describe('POST /api/v1/engineers', () => {
    it('エンジニアを作成できる', async () => {
      const engineerData = {
        name: 'テストエンジニア',
        email: 'test@example.com',
        status: 'waiting',
        skills: ['JavaScript', 'React', 'Node.js']
      };
      
      const response = await request(app)
        .post('/api/v1/engineers')
        .set('X-Company-ID', companyId.toString())
        .send(engineerData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(engineerData.name);
    });
  });
});
```

---

## 4. 実装優先順位

### Day 1（エンジニア1のDay1完了後）
1. エンジニアAPIルート実装
2. エンジニアコントローラー実装
3. エンジニアサービス実装
4. エンジニアリポジトリ実装

### Day 2
1. プロジェクトAPIルート実装
2. プロジェクトコントローラー実装
3. プロジェクトサービス実装
4. プロジェクトリポジトリ実装

### Day 3
1. スキルシート管理機能実装
2. アサイン管理機能実装
3. 検索・フィルタリング機能実装
4. テスト作成

---

## 5. 完了条件

### 必須要件
- [ ] エンジニアCRUD APIが動作する
- [ ] プロジェクトCRUD APIが動作する
- [ ] スキルシート管理APIが動作する
- [ ] アサイン管理APIが動作する
- [ ] 検索・フィルタリングが機能する
- [ ] ページネーションが実装されている
- [ ] companyIdによるデータ分離が機能する

### テスト要件
- [ ] 各エンドポイントの単体テスト作成
- [ ] 統合テストの実装
- [ ] エラーケースのテスト

---

## 6. 注意事項

- エンジニア1が作成した基盤を必ず使用すること
- マルチテナント対応（companyId）を全ての処理で考慮
- トランザクション処理を適切に使用
- エラーメッセージは日本語で分かりやすく
- パフォーマンスを考慮した実装（N+1問題の回避など）

---

## 7. 連携事項

### エンジニア1との連携
- API基盤構造を使用
- ベースリポジトリを継承
- 共通ミドルウェアを活用

### エンジニア3への提供
- エンジニアデータへのアクセス方法
- プロジェクトデータへのアクセス方法

---

## 8. 質問・相談先

- 技術的な相談: Slackの#backend-apiチャンネル
- 仕様確認: プロダクトオーナー
- エンジニア1との連携: 直接Slack DM
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationOptions;
    }
  }
}

/**
 * ページネーションミドルウェア
 * クエリパラメータからページネーション情報を取得
 */
export const paginationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // クエリパラメータから取得
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const requestedLimit = parseInt(req.query.limit as string) || config.pagination.defaultLimit;
  
  // 最大値を超えないように制限
  const limit = Math.min(requestedLimit, config.pagination.maxLimit);
  
  // オフセットを計算
  const offset = (page - 1) * limit;
  
  // リクエストオブジェクトに設定
  req.pagination = {
    page,
    limit,
    offset
  };
  
  next();
};

/**
 * ソート条件ミドルウェア
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

declare global {
  namespace Express {
    interface Request {
      sort?: SortOptions;
    }
  }
}

/**
 * ソートミドルウェア
 * クエリパラメータからソート条件を取得
 */
export const sortMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const sortField = req.query.sort as string;
  const sortOrder = req.query.order as string;
  
  if (sortField) {
    req.sort = {
      field: sortField,
      order: sortOrder === 'asc' ? 'asc' : 'desc'
    };
  } else {
    // デフォルトソート
    req.sort = {
      field: 'created_at',
      order: 'desc'
    };
  }
  
  next();
};

/**
 * フィルタリングミドルウェア
 */
export interface FilterOptions {
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      filters?: FilterOptions;
    }
  }
}

/**
 * フィルタリングミドルウェア
 * クエリパラメータからフィルタ条件を取得
 */
export const filterMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const filters: FilterOptions = {};
  
  // 予約されたパラメータを除外
  const reservedParams = ['page', 'limit', 'sort', 'order'];
  
  Object.keys(req.query).forEach(key => {
    if (!reservedParams.includes(key)) {
      filters[key] = req.query[key];
    }
  });
  
  req.filters = filters;
  next();
};
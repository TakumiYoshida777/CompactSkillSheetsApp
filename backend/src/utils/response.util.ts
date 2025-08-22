import { v4 as uuidv4 } from 'uuid';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface ApiResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: any;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    documentation?: string;
  };
}

export type ApiResponseType<T = any> = SuccessResponse<T> | ErrorResponse;

function generateRequestId(): string {
  // UUIDの使用を避けるため、タイムスタンプベースのIDを生成
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

export class ApiResponse {
  /**
   * 成功レスポンスを生成
   */
  static success<T>(data: T, meta?: Partial<ApiResponseMeta>): SuccessResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        version: 'v1',
        ...meta
      }
    };
  }
  
  /**
   * エラーレスポンスを生成
   */
  static error(code: string, message: string, details?: any): ErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        documentation: `https://docs.api.skillsheet.com/errors/${code.toLowerCase()}`
      }
    };
  }
  
  /**
   * ページネーション付きレスポンスを生成
   */
  static paginated<T>(data: T[], pagination: PaginationInfo): SuccessResponse<T[]> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    return this.success(data, {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages
      }
    });
  }
  
  /**
   * 作成成功レスポンスを生成
   */
  static created<T>(data: T, message: string = 'リソースが正常に作成されました'): SuccessResponse<T> {
    return this.success(data, { message });
  }
  
  /**
   * 更新成功レスポンスを生成
   */
  static updated<T>(data: T, message: string = 'リソースが正常に更新されました'): SuccessResponse<T> {
    return this.success(data, { message });
  }
  
  /**
   * 削除成功レスポンスを生成
   */
  static deleted(message: string = 'リソースが正常に削除されました'): SuccessResponse<null> {
    return this.success(null, { message });
  }
  
  /**
   * バリデーションエラーレスポンスを生成
   */
  static validationError(errors: any): ErrorResponse {
    return this.error('VALIDATION_ERROR', 'バリデーションエラーが発生しました', errors);
  }
  
  /**
   * 認証エラーレスポンスを生成
   */
  static unauthorized(message: string = '認証が必要です'): ErrorResponse {
    return this.error('UNAUTHORIZED', message);
  }
  
  /**
   * 権限エラーレスポンスを生成
   */
  static forbidden(message: string = 'アクセス権限がありません'): ErrorResponse {
    return this.error('FORBIDDEN', message);
  }
  
  /**
   * Not Foundエラーレスポンスを生成
   */
  static notFound(resource: string = 'リソース'): ErrorResponse {
    return this.error('NOT_FOUND', `${resource}が見つかりません`);
  }
  
  /**
   * 競合エラーレスポンスを生成
   */
  static conflict(message: string = 'リソースが既に存在します'): ErrorResponse {
    return this.error('CONFLICT', message);
  }
  
  /**
   * サーバーエラーレスポンスを生成
   */
  static serverError(message: string = 'サーバーエラーが発生しました'): ErrorResponse {
    return this.error('INTERNAL_ERROR', message);
  }
}
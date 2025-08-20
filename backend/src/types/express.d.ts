import { JWTPayload } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      companyId?: string;
      userId?: string;
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}

export {};
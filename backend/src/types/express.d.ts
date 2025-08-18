import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        companyId: string;
        role: string;
        email: string;
      };
    }
  }
}

export {};
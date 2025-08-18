import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

/**
 * リクエストバリデーションミドルウェア
 */
export const validateRequest = (schema: yup.AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'バリデーションエラー',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};
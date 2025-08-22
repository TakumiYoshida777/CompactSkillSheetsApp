import * as yup from 'yup';

export const fileValidation = {
  upload: yup.object({
    filename: yup.string().optional(),
    description: yup.string().optional(),
    tags: yup.array().of(yup.string()).optional()
  }),

  uploadMultiple: yup.object({
    files: yup.array().optional(),
    descriptions: yup.array().of(yup.string()).optional()
  }),

  update: yup.object({
    filename: yup.string().optional(),
    description: yup.string().optional(),
    tags: yup.array().of(yup.string()).optional()
  }),

  bulkDelete: yup.object({
    ids: yup.array().of(yup.number()).required('IDは必須です')
  }),

  resize: yup.object({
    width: yup.number().min(1).max(5000).required('幅は必須です'),
    height: yup.number().min(1).max(5000).required('高さは必須です'),
    quality: yup.number().min(1).max(100).optional()
  }),

  addTags: yup.object({
    tags: yup.array().of(yup.string()).required('タグは必須です')
  }),

  share: yup.object({
    expiresAt: yup.date().optional(),
    maxDownloads: yup.number().min(1).optional(),
    password: yup.string().optional()
  })
};
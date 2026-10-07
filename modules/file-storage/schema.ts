import { z } from 'zod';
import { FILE_MIME_TYPES, FILE_PURPOSES, FILE_VISIBILITIES } from './types';

export const MAX_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_BYTES = 30 * 1024 * 1024;
export const MAX_EXPORT_SIZE_BYTES = 50 * 1024 * 1024;

export const fileUploadRequestSchema = z
  .object({
    purpose: z.enum(FILE_PURPOSES),
    originalName: z.string().trim().min(1).max(255),
    mimeType: z.enum(FILE_MIME_TYPES),
    sizeBytes: z.number().int().positive().max(MAX_EXPORT_SIZE_BYTES),
    visibility: z.enum(FILE_VISIBILITIES).optional(),
  })
  .superRefine(({ mimeType, sizeBytes }, context) => {
    const maxSize = mimeType.startsWith('image/')
      ? MAX_IMAGE_SIZE_BYTES
      : mimeType === 'application/pdf'
        ? MAX_DOCUMENT_SIZE_BYTES
        : MAX_EXPORT_SIZE_BYTES;

    if (sizeBytes > maxSize) {
      context.addIssue({
        code: 'too_big',
        maximum: maxSize,
        inclusive: true,
        origin: 'number',
        path: ['sizeBytes'],
        message: `Tệp vượt quá giới hạn ${Math.round(maxSize / (1024 * 1024))}MB.`,
      });
    }
  });

export const uploadItemSchema = z.object({
  clientId: z.string().trim().min(1).max(100),
  originalName: z.string().trim().min(1).max(255),
  mimeType: z.enum(FILE_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_EXPORT_SIZE_BYTES),
});

export const createUploadRequestSchema = z.object({
  purpose: z.enum(FILE_PURPOSES),
  visibility: z.enum(FILE_VISIBILITIES).optional(),
  files: z.array(uploadItemSchema).min(1).max(50),
});

export type CreateUploadRequestInput = z.infer<typeof createUploadRequestSchema>;

export type FileUploadRequestInput = z.infer<typeof fileUploadRequestSchema>;


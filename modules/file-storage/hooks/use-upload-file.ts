'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import {
  requestCancelUpload,
  requestCompleteFileUpload,
  requestCompleteUpload,
  requestCreateUpload,
} from '../services';
import { createUploadRequestSchema } from '../schema';
import { uploadFileToPresignedUrl } from '../upload-client';
import type { IFileObjectOut, IUploadFileInput } from '../types';

type UseUploadFileOptions = {
  notify?: boolean;
};

export const useUploadFile = ({ notify = false }: UseUploadFileOptions = {}) =>
  useMutation<IFileObjectOut, Error, IUploadFileInput>({
    mutationFn: async ({ file, purpose, visibility, onProgress }) => {
      const request = createUploadRequestSchema.parse({
        purpose,
        visibility,
        files: [
          {
            clientId: crypto.randomUUID(),
            originalName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          },
        ],
      });

      let uploadId: string | undefined;
      try {
        const uploadResponse = await requestCreateUpload(request);
        const upload = uploadResponse.data.data;
        uploadId = upload.uploadId;
        const item = upload.files[0];

        onProgress?.(0);
        await uploadFileToPresignedUrl(file, item, onProgress);
        await requestCompleteFileUpload(item.file.id);

        const completeResponse = await requestCompleteUpload(upload.uploadId);
        return completeResponse.data.data.files[0];
      } catch (error) {
        if (uploadId) {
          await requestCancelUpload(uploadId).catch(() => undefined);
        }
        throw error;
      }
    },
    onSuccess: () => {
      if (notify) {
        toast.success(SUCCESS_MESSAGES.FILES.UPLOAD);
      }
    },
    onError: (error) => {
      if (notify) {
        toast.error(error.message || ERROR_MESSAGES.FILES.UPLOAD);
      }
    },
  });


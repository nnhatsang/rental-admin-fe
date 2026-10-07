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
import type { FilePurpose, FileVisibility, IFileObjectOut, IUploadCompleteOut } from '../types';

const DEFAULT_CONCURRENCY = 3;

export type UploadFilesInput = {
  files: File[];
  purpose: FilePurpose;
  visibility?: FileVisibility;
  concurrency?: number;
  onItemProgress?: (clientId: string, progress: number) => void;
  onOverallProgress?: (progress: number) => void;
};

type UploadFilesResult = IUploadCompleteOut & {
  files: IFileObjectOut[];
};

export const useUploadFiles = ({ notify = false }: { notify?: boolean } = {}) =>
  useMutation<UploadFilesResult, Error, UploadFilesInput>({
    mutationFn: async ({ files, purpose, visibility, concurrency = DEFAULT_CONCURRENCY, onItemProgress, onOverallProgress }) => {
      const request = createUploadRequestSchema.parse({
        purpose,
        visibility,
        files: files.map((file, index) => ({
          clientId: `${index}-${crypto.randomUUID()}`,
          originalName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        })),
      });

      let uploadId: string | undefined;
      try {
        const uploadResponse = await requestCreateUpload(request);
        const upload = uploadResponse.data.data;
        uploadId = upload.uploadId;
        const progressByClientId = new Map<string, number>();
        const totalBytes = files.reduce((total, file) => total + file.size, 0);

        const updateProgress = (clientId: string, progress: number) => {
          progressByClientId.set(clientId, progress);
          onItemProgress?.(clientId, progress);

          const uploadedBytes = upload.files.reduce((total, item) => {
            const itemProgress = progressByClientId.get(item.clientId) ?? 0;
            return total + (item.file.sizeBytes * itemProgress) / 100;
          }, 0);

          onOverallProgress?.(totalBytes === 0 ? 100 : Math.round((uploadedBytes / totalBytes) * 100));
        };

        let cursor = 0;
        const workerCount = Math.min(Math.max(1, concurrency), upload.files.length);
        const workers = Array.from({ length: workerCount }, async () => {
          while (cursor < upload.files.length) {
            const index = cursor++;
            const item = upload.files[index];
            const file = files[index];

            await uploadFileToPresignedUrl(file, item, (progress) => updateProgress(item.clientId, progress));
            await requestCompleteFileUpload(item.file.id);
            updateProgress(item.clientId, 100);
          }
        });

        await Promise.all(workers);
        const completeResponse = await requestCompleteUpload(upload.uploadId);
        return completeResponse.data.data;
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

import type { IUploadItemOut } from './types';

export const uploadFileToPresignedUrl = (
  file: File,
  presign: IUploadItemOut,
  onProgress?: (progress: number) => void,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open(presign.method, presign.uploadUrl);
    request.withCredentials = false;

    for (const [key, value] of Object.entries(presign.requiredHeaders)) {
      request.setRequestHeader(key, value);
    }

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onerror = () => reject(new Error('Không thể kết nối tới kho lưu trữ tệp.'));
    request.onabort = () => reject(new Error('Đã hủy tải tệp lên.'));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      reject(new Error(`R2 từ chối tải tệp lên (${request.status}).`));
    };

    request.send(file);
  });


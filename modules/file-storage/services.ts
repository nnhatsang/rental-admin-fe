import { apiAuth } from '@/axios';
import type { DefaultResponse } from '@/types/api';
import type {
  ICreateUploadReq,
  IFileUploadPoliciesOut,
  IFileDownloadUrlOut,
  IFileObjectOut,
  IUploadCompleteOut,
  IUploadOut,
} from './types';

const url = '/files';
const uploadsUrl = '/uploads';

export const requestGetFileUploadPolicies = () =>
  apiAuth.get<DefaultResponse<IFileUploadPoliciesOut>>(`${uploadsUrl}/policies`);

export const requestCreateUpload = (data: ICreateUploadReq) =>
  apiAuth.post<DefaultResponse<IUploadOut>>(uploadsUrl, data);

export const requestCompleteUpload = (uploadId: string) =>
  apiAuth.post<DefaultResponse<IUploadCompleteOut>>(`${uploadsUrl}/${uploadId}/complete`);

export const requestCancelUpload = (uploadId: string) =>
  apiAuth.delete<DefaultResponse<IUploadCompleteOut>>(`${uploadsUrl}/${uploadId}`);

export const requestCompleteFileUpload = (fileId: string) =>
  apiAuth.post<DefaultResponse<IFileObjectOut>>(`${url}/${fileId}/complete`);

export const requestCreateFileDownloadUrl = (fileId: string) =>
  apiAuth.get<DefaultResponse<IFileDownloadUrlOut>>(`${url}/${fileId}/download-url`);

export const requestDeleteFile = (fileId: string) => apiAuth.delete<DefaultResponse<IFileObjectOut>>(`${url}/${fileId}`);


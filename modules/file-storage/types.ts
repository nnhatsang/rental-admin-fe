export const FILE_PURPOSES = [
  'INSPECTION',
  'INCIDENT',
  'PAYMENT_PROOF',
  'PRODUCT_MEDIA',
  'ASSET_MEDIA',
  'DELIVERY_PROOF',
  'CONTRACT_DOCUMENT',
  'CONTRIBUTOR_DOCUMENT',
  'REPORT_EXPORT',
  'CMS_MEDIA',
] as const;

export type FilePurpose = (typeof FILE_PURPOSES)[number];

export const FILE_VISIBILITIES = ['PRIVATE', 'PUBLIC'] as const;
export type FileVisibility = (typeof FILE_VISIBILITIES)[number];

export const FILE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export type FileMimeType = (typeof FILE_MIME_TYPES)[number];

export type FileObjectStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED';
export type UploadBatchStatus = 'OPEN' | 'COMPLETED' | 'CANCELLED' | 'FAILED' | 'EXPIRED';

export interface ICreateUploadItemReq {
  clientId: string;
  originalName: string;
  mimeType: FileMimeType;
  sizeBytes: number;
}

export interface ICreateUploadReq {
  purpose: FilePurpose;
  files: ICreateUploadItemReq[];
  visibility?: FileVisibility;
}

export interface IFileObjectOut {
  id: string;
  purpose: FilePurpose;
  status: FileObjectStatus;
  visibility: FileVisibility;
  originalName: string;
  mimeType: FileMimeType;
  sizeBytes: number;
  etag: string | null;
  uploadedBy: string;
  expiresAt: string;
  completedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUploadItemOut {
  clientId: string;
  file: IFileObjectOut;
  uploadUrl: string;
  method: 'PUT';
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface IUploadOut {
  uploadId: string;
  purpose: FilePurpose;
  status: UploadBatchStatus;
  expectedFileCount: number;
  expectedTotalBytes: number;
  expiresAt: string;
  files: IUploadItemOut[];
}

export interface IUploadCompleteOut {
  uploadId: string;
  purpose: FilePurpose;
  status: UploadBatchStatus;
  completedAt: string | null;
  files: IFileObjectOut[];
}

export interface IFileUploadPolicy {
  purpose: FilePurpose;
  maxFiles: number;
  maxTotalSizeBytes: number;
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
}

export interface IFileUploadPoliciesOut {
  policies: IFileUploadPolicy[];
}

export interface IFileDownloadUrlOut {
  fileId: string;
  downloadUrl: string;
  expiresAt: string;
}

export interface IUploadFileInput {
  file: File;
  purpose: FilePurpose;
  visibility?: FileVisibility;
  onProgress?: (progress: number) => void;
}


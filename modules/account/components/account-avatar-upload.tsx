'use client';

import { IconAlertCircle, IconUser, IconX } from '@tabler/icons-react';
import { useCallback } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatBytes, useFileUpload, type FileWithPreview } from '@/hooks/use-file-upload';
import { cn } from '@/lib/utils';

type AccountAvatarUploadProps = {
  name: string;
  currentAvatar?: string | null;
  maxSize?: number;
  onFileChange?: (file: FileWithPreview | null) => void;
};

export function AccountAvatarUpload({
  name,
  currentAvatar,
  maxSize = 2 * 1024 * 1024,
  onFileChange,
}: AccountAvatarUploadProps) {
  const handleFilesChange = useCallback(
    (nextFiles: FileWithPreview[]) => {
      onFileChange?.(nextFiles[0] ?? null);
    },
    [onFileChange],
  );
  const [state, actions] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: 'image/png,image/jpeg,image/webp',
    multiple: false,
    onFilesChange: handleFilesChange,
  });
  const currentFile = state.files[0];
  const previewUrl = currentFile?.preview ?? currentAvatar;

  return (
    <div className="flex min-w-0 flex-col items-center gap-4 text-center">
      <div className="relative">
        <button
          type="button"
          className={cn(
            'group relative flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed bg-muted/30 transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
            state.isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/60',
            previewUrl && 'border-solid',
          )}
          aria-label="Chọn ảnh đại diện"
          onClick={actions.openFileDialog}
          onDragEnter={actions.handleDragEnter}
          onDragLeave={actions.handleDragLeave}
          onDragOver={actions.handleDragOver}
          onDrop={actions.handleDrop}
        >
          <input {...actions.getInputProps({ className: 'sr-only' })} />
          {previewUrl ? (
            <UserAvatar name={name} src={previewUrl} className="size-full rounded-full text-2xl" />
          ) : (
            <IconUser className="size-8 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="pointer-events-none absolute inset-x-2 bottom-2 rounded-full bg-background/85 px-2 py-1 text-[11px] font-medium opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Chọn ảnh
          </span>
        </button>

        {currentFile ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="absolute -right-1 -top-1 rounded-full bg-background"
            aria-label="Bỏ ảnh mới đã chọn"
            onClick={() => actions.removeFile(currentFile.id)}
          >
            <IconX aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium">Ảnh đại diện</p>
        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG hoặc WEBP · tối đa {formatBytes(maxSize)}</p>
        {currentFile ? (
          <p className="mt-2 max-w-56 truncate text-xs text-primary" title={currentFile.file.name}>
            {currentFile.file.name} · {formatBytes(currentFile.file.size)}
          </p>
        ) : null}
      </div>

      {state.errors.length ? (
        <Alert variant="destructive" className="text-left">
          <IconAlertCircle aria-hidden="true" />
          <AlertTitle>Không thể chọn ảnh</AlertTitle>
          <AlertDescription>
            {state.errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

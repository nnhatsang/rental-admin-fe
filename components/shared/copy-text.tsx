import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';

import { cn } from '@/lib/utils';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useState } from 'react';

type CopyTextProps = {
  text: string;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  successMessage?: string;
};

export function CopyText({ text, children, className, iconClassName, successMessage = 'Đã sao chép' }: CopyTextProps) {
  const [_copiedText, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copy(text);

      setCopied(true);
      toast.success(successMessage);

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy!', error);
      toast.error('Không thể sao chép');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn('inline-flex items-center gap-2 transition-opacity hover:opacity-80', className)}
    >
      {children || <span>{text}</span>}
      {copied ? (
        <IconCheck size={16} strokeWidth={2} className={cn('text-green-500', iconClassName)} />
      ) : (
        <IconCopy size={16} strokeWidth={2} className={iconClassName} />
      )}
    </button>
  );
}

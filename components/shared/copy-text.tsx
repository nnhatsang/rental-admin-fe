
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';

import { cn } from '@/lib/utils';
import { IconCopy } from '@tabler/icons-react';

type CopyTextProps = {
  text: string;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  successMessage?: string;
};

export function CopyText({ text, children, className, iconClassName, successMessage = 'Đã sao chép' }: CopyTextProps) {
  const [_copiedText, copy] = useCopyToClipboard();

  const handleCopy = () => {
    copy(text)
      .then(() => {
        toast.success(successMessage);
      })
      .catch((error) => {
        console.error('Failed to copy!', error);
        toast.error('Không thể sao chép');
      });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn('inline-flex items-center gap-2 transition-opacity hover:opacity-80', className)}
    >
      {children || <span>{text}</span>}
      <IconCopy stroke={2} size={16} className={iconClassName}/>

    </button>
  );
}

// user-avatar.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';

type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
};

export function UserAvatar({ name, src, size, className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={cn(getAvatarColor(name), className)}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

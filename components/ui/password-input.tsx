import * as React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <Input type={showPassword ? 'text' : 'password'} className={cn('pr-10', className)} ref={ref} {...props} />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <IconEye stroke={2} /> : <IconEyeClosed stroke={2} />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

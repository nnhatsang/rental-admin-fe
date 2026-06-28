// utils/form-error.ts
import { ApiClientError } from '@/axios';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ERROR_MESSAGES } from './consts/message-error.const';
import { toast } from 'sonner';

type ApplyApiFormErrorsOptions<T extends FieldValues> = {
  fallbackMessage?: string;
  fieldMap?: Partial<Record<string, Path<T>>>;
};

export function applyApiFormErrors<T extends FieldValues>(
  form: Pick<UseFormReturn<T>, 'setError'>,
  error: unknown,
  options: ApplyApiFormErrorsOptions<T> = {},
) {
  const fallbackMessage = options.fallbackMessage ?? ERROR_MESSAGES.DEFAULT;

  if (!(error instanceof ApiClientError)) {
    toast.error(fallbackMessage);

    return false;
  }

  if (!error.fieldErrors.length) {
    toast.error(error.message || fallbackMessage);

    return true;
  }

  error.fieldErrors.forEach((fieldError) => {
    const fieldName = options.fieldMap?.[fieldError.property] ?? (fieldError.property as Path<T>);

    form.setError(fieldName, {
      type: 'server',
      message: fieldError.message,
    });
  });

  return true;
}

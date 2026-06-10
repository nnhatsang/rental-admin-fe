// utils/form-error.ts
import { ApiClientError } from '@/axios';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ERROR_MESSAGES } from './consts/message-error.const';

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
    form.setError('root', {
      type: 'server',
      message: fallbackMessage,
    });

    return false;
  }

  if (!error.fieldErrors.length) {
    form.setError('root', {
      type: 'server',
      message: error.message || fallbackMessage,
    });

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

// Sau đó trong useLogin dùng lại:

// import { applyApiFormErrors } from '@/utils/form-error';

// const { mutate, isPending } = useMutation({
//   mutationFn: async (values: ILoginInput) => {
//     await login(values);
//   },

//   onError: (error) => {
//     applyApiFormErrors(form, error, {
//       fallbackMessage: 'Đăng nhập thất bại',
//     });
//   },

//   onSuccess: () => {
//     toast.success('Đăng nhập thành công');
//   },
// });
// Nếu backend trả field khác frontend, ví dụ BE trả passwordConfirm nhưng FE dùng confirmPassword, dùng fieldMap:

// applyApiFormErrors(form, error, {
//   fallbackMessage: 'Đặt lại mật khẩu thất bại',
//   fieldMap: {
//     passwordConfirm: 'confirmPassword',
//   },
// });
// QueryProvider chỉ nên xử lý toast lỗi chung. Còn lỗi field thì để từng form gọi helper này, vì QueryProvider không biết form nào cần setError.

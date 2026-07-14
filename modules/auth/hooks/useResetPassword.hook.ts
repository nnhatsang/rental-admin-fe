import { resetPasswordSchema, type IResetPasswordInput } from '../schema';
import { requestResetPassword } from '../services';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { applyApiFormErrors } from '@/utils/form-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const useResetPassword = (token: string) => {
  const router = useRouter();

  const form = useForm<IResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: IResetPasswordInput) => {
      await requestResetPassword(values);
    },
    // onError: (error) => {
    //   applyApiFormErrors(form, error, {
    //     fallbackMessage: ERROR_MESSAGES.AUTH.RESET_PASSWORD,
    //     fieldMap: {
    //       passwordConfirm: 'confirmPassword',
    //       newPasswordConfirm: 'confirmPassword',
    //     },
    //   });
    // },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.AUTH.RESET_PASSWORD);
      router.push('/auth/login');
    },
  });

  const onSubmit = (values: IResetPasswordInput) => {
    mutate(values);
  };

  return {
    form,
    isPending,
    onSubmit,
  };
};

import { requestForgotPassword } from '@/services/auth';
import { forgotPasswordSchema, type IForgotPasswordInput } from '@/schema/auth.schema';
import { applyApiFormErrors } from '@/utils/form-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';

export const useForgotPassword = () => {
  const form = useForm<IForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (values: IForgotPasswordInput) => {
      await requestForgotPassword(values);
    },
    onError: (error) => {
      applyApiFormErrors(form, error, {
        fallbackMessage: ERROR_MESSAGES.AUTH.FORGOT_PASSWORD,
      });
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.AUTH.FORGOT_PASSWORD);
    },
  });

  const onSubmit = (values: IForgotPasswordInput) => {
    mutate(values);
  };

  return {
    form,
    isPending,
    isSuccess,
    onSubmit,
  };
};

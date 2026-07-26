import { ILoginInput, loginSchema } from '../schema';
import { useAuthStore } from '../store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { applyApiFormErrors } from '@/utils/form-error';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';

export const useLogin = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { login } = useAuthStore();
  const form = useForm<ILoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ILoginInput) => {
      const { email, password } = values;
      await login({ email, password });
    },

    onError: (error) => {
      applyApiFormErrors(form, error);
    },
    onSuccess: () => {
      // const redirect = searchParams.get('redirect');
      router.push('/');
      toast.success(SUCCESS_MESSAGES.AUTH.LOGIN);
    },
  });

  const onSubmit = (values: ILoginInput) => {
    mutate(values);
  };

  return {
    form,
    mutate,
    isPending,
    onSubmit,
  };
};

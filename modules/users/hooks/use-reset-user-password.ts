import { useMutation } from '@tanstack/react-query';
import { requestResetUserPassword } from '../services';
import { IResetUserPasswordReq } from '../type';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';

interface ResetPasswordParams {
  id: string;
  data: IResetUserPasswordReq;
}

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: ({ id, data }: ResetPasswordParams) => requestResetUserPassword(id, data),
    onSuccess: () => {
      // Đổi mật khẩu thì không cần update bảng dữ liệu, chỉ cần báo thành công
      toast.success(SUCCESS_MESSAGES.AUTH.RESET_PASSWORD);
    },
  });
};

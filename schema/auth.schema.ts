import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, { message: 'Vui lòng nhập email' }).email({ message: 'Định dạng email không hợp lệ' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});
export type ILoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: 'Vui lòng nhập email' }).email({ message: 'Định dạng email không hợp lệ' }),
});
export type IForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' }),
    newPassword: z.string().min(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' }),
    confirmPassword: z.string().min(1, { message: 'Vui lòng xác nhận mật khẩu mới' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
export type IResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'Vui lòng nhập mật khẩu hiện tại' }),
    newPassword: z.string().min(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' }),
    confirmPassword: z.string().min(1, { message: 'Vui lòng xác nhận mật khẩu mới' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
export type IChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  phone: z.string().min(1, { message: 'Vui lòng nhập số điện thoại' }),
  fullName: z.string().min(1, { message: 'Vui lòng nhập họ tên' }),
});
export type IUpdateProfileInput = z.infer<typeof updateProfileSchema>;

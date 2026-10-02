import * as z from 'zod';

export const accountProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Vui lòng nhập họ và tên.').max(120, 'Họ và tên không được vượt quá 120 ký tự.'),
  phone: z.string().trim().max(30, 'Số điện thoại không được vượt quá 30 ký tự.'),
});

export const accountPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: z
      .string()
      .regex(
        /^(?=.*[a-z\d])(?=.*[A-Z\d])(?=.*\d)(?=.*[@$!%*?&><])[A-Za-z\d@$!%*?&><]{8,32}$/,
        'Mật khẩu mới phải dài 8–32 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.',
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp.',
  });

export type AccountProfileFormValues = z.infer<typeof accountProfileSchema>;
export type AccountPasswordFormValues = z.infer<typeof accountPasswordSchema>;

import { ROLE_CODES } from '@/utils/consts/rbac.const';
import * as z from 'zod';
import { UserActivityStatus } from './type';

const roleCodeSchema = z.enum(ROLE_CODES as [string, ...string[]]);
const userActivityStatusSchema = z.enum(Object.values(UserActivityStatus) as [string, ...string[]]);

export const createUserSchema = z.object({
  email: z.string().min(1, { message: 'Vui lòng nhập email' }).email({ message: 'Định dạng email không hợp lệ' }),
  fullName: z.string().min(1, { message: 'Vui lòng nhập họ tên' }),
  phone: z.string().optional(),
  password: z.string().min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' }),
  roleCodes: z.array(roleCodeSchema).optional(),
});
export type ICreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  email: z.string().email({ message: 'Định dạng email không hợp lệ' }).optional(),
  fullName: z.string().min(1, { message: 'Vui lòng nhập họ tên' }).optional(),
  phone: z.string().optional(),
});
export type IUpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateUserActivityStatusSchema = z.object({
  activityStatus: userActivityStatusSchema,
});
export type IUpdateUserActivityStatusInput = z.infer<typeof updateUserActivityStatusSchema>;

export const updateUserRolesSchema = z.object({
  roleCodes: z.array(roleCodeSchema).min(1, { message: 'Vui lòng chọn ít nhất một vai trò' }),
});
export type IUpdateUserRolesInput = z.infer<typeof updateUserRolesSchema>;

export const resetUserPasswordSchema = z
  .object({
    newPassword: z.string().regex(/^(?=.*[a-z\d])(?=.*[A-Z\d])(?=.*\d)(?=.*[@$!%*?&><])[A-Za-z\d@$!%*?&><]{8,32}$/, {
      message: 'Mật khẩu mới phải có chữ hoa, chữ thường, chữ số và ký tự đặc biệt',
    }),
    confirmPassword: z.string().min(1, { message: 'Vui lòng xác nhận mật khẩu mới' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
export type IResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;

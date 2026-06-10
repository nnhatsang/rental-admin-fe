import * as z from 'zod';

export const createRoleSchema = z.object({
  code: z
    .string()
    .min(1, { message: 'Vui lòng nhập mã vai trò' })
    .regex(/^[A-Z][A-Z0-9_]{1,49}$/, { message: 'Mã vai trò phải theo định dạng UPPER_SNAKE_CASE' }),
  name: z.string().min(1, { message: 'Vui lòng nhập tên vai trò' }),
  description: z.string().optional(),
  permissionCodes: z.array(z.string()).min(1, { message: 'Vui lòng chọn ít nhất một quyền' }),
});
export type ICreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().min(1, { message: 'Vui lòng nhập tên vai trò' }).optional(),
  description: z.string().optional(),
});
export type IUpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const updateRolePermissionsSchema = z.object({
  permissionCodes: z.array(z.string()).min(1, { message: 'Vui lòng chọn ít nhất một quyền' }),
});
export type IUpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;

export const assignRoleUsersSchema = z.object({
  roleId: z.string().uuid({ message: 'Vai trò không hợp lệ' }),
  userIds: z.array(z.string().uuid({ message: 'Người dùng không hợp lệ' })),
});
export type IAssignRoleUsersInput = z.infer<typeof assignRoleUsersSchema>;

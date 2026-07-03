import * as z from 'zod';

const roleCodeRegex = /^[A-Z][A-Z0-9_]{1,49}$/;

export const roleFormSchema = z.object({
  code: z
    .string()
    .min(1, { message: 'Vui lòng nhập mã vai trò' })
    .regex(roleCodeRegex, { message: 'Mã vai trò phải là UPPER_SNAKE_CASE, bắt đầu bằng chữ cái' }),
  name: z.string().min(1, { message: 'Vui lòng nhập tên vai trò' }),
  description: z.string().optional(),
  permissionCodes: z.array(z.string()).min(1, { message: 'Vui lòng chọn ít nhất một quyền' }),
});

export type IRoleFormInput = z.infer<typeof roleFormSchema>;

import * as z from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Vui lòng nhập tên danh mục.' }).max(120, { message: 'Tên quá dài.' }),
  slug: z.string().trim().max(160, { message: 'Mã quá dài.' }).optional(),
  isActive: z.boolean(),
});

export type ICategoryFormInput = z.output<typeof categoryFormSchema>;

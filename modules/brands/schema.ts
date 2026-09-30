import * as z from 'zod';

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Vui lòng nhập tên thương hiệu.' }).max(120, { message: 'Tên quá dài.' }),
  slug: z.string().trim().max(160, { message: 'Mã quá dài.' }).optional(),
  isActive: z.boolean(),
});

export type IBrandFormInput = z.output<typeof brandFormSchema>;

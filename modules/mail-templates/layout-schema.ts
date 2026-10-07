import { z } from 'zod';

export const mailLayoutFormSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập key layout.')
    .regex(/^[a-z0-9._-]+$/, 'Key chỉ được dùng chữ thường, số, dấu chấm, gạch ngang hoặc gạch dưới.'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên layout.'),
  htmlLayout: z.string().trim().min(1, 'Vui lòng nhập HTML layout.').includes('{{content}}', 'Layout phải chứa placeholder {{content}}.'),
  isActive: z.boolean(),
});

export type MailLayoutFormValues = z.infer<typeof mailLayoutFormSchema>;

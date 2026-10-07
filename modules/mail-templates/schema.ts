import { z } from 'zod';

export const mailTemplateFormSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên mẫu email.'),
  subject: z.string().trim().min(1, 'Vui lòng nhập tiêu đề email.'),
  htmlBody: z.string().trim().min(1, 'Vui lòng nhập nội dung email.'),
  description: z.string(),
  layoutId: z.string(),
  isActive: z.boolean(),
});

export type MailTemplateFormValues = z.infer<typeof mailTemplateFormSchema>;

import { z } from 'zod';

export const dashboardDateRangeSchema = z
  .object({
    from: z.date(),
    to: z.date(),
  })
  .refine(({ from, to }) => to.getTime() >= from.getTime(), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu.',
    path: ['to'],
  });

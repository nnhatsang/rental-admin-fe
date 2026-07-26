
import * as z from 'zod';

export const availabilityFilterSchema = z
  .object({
    startDate: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
    endDate: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
    search: z.string().optional(),
    availability: z.enum(['ALL', 'AVAILABLE', 'UNAVAILABLE']),
  })
  .refine(({ startDate, endDate }) => new Date(startDate).getTime() < new Date(endDate).getTime(), {
    path: ['endDate'],
    message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
  });

export type IAvailabilityFilterInput = z.infer<typeof availabilityFilterSchema>;

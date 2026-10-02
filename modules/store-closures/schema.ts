import * as z from 'zod';
import { STORE_CLOSURE_TYPES } from './type';

const dateString = z.string().min(1, 'Vui lòng chọn ngày.');

export const storeClosureSchema = z
  .object({
    startDate: dateString,
    endDate: dateString,
    type: z.enum(STORE_CLOSURE_TYPES),
    reason: z.string().max(500, 'Lý do không được vượt quá 500 ký tự.').optional(),
  })
  .refine((value) => value.startDate <= value.endDate, {
    path: ['endDate'],
    message: 'Ngày kết thúc phải từ ngày bắt đầu trở đi.',
  });

export type StoreClosureFormValues = z.infer<typeof storeClosureSchema>;

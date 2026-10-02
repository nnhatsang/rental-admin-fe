import * as z from 'zod';

export const systemSettingsSchema = z.object({
  bookingHoldPricePerUnit: z.coerce.number().min(0, 'Giá giữ lịch không được âm.'),
  bookingBufferTimeMinutes: z.coerce.number().int().min(0, 'Buffer không được âm.'),
  maxRentalTimeDays: z.coerce.number().int().min(1, 'Thời gian thuê tối đa phải từ 1 ngày.'),
  maxLateReturnTimeHours: z.coerce.number().int().min(0, 'Thời gian trả trễ không được âm.'),
});

export type SystemSettingsFormValues = z.infer<typeof systemSettingsSchema>;

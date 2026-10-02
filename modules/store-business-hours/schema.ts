import * as z from 'zod';

const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ phải có định dạng HH:mm.');

export const storeBusinessHoursSchema = z.object({
  items: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: timeString,
        closeTime: timeString,
        isOpen: z.boolean(),
      }),
    )
    .length(7, 'Cần cấu hình đủ 7 ngày trong tuần.'),
});

export type StoreBusinessHoursFormValues = z.infer<typeof storeBusinessHoursSchema>;

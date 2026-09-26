import { z } from 'zod';

export const quoteFormSchema = z
  .object({
    customerId: z.string().min(1, 'Vui lòng chọn khách hàng'),
    startDate: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
    endDate: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
    pickupMethod: z.enum(['PICKUP_AT_STORE', 'DELIVERY']),
    deliveryAddress: z.string(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1),
          note: z.string().optional(),
        }),
      )
      .min(1, 'Vui lòng chọn ít nhất một sản phẩm'),
  })
  .superRefine((value, ctx) => {
    if (new Date(value.startDate) >= new Date(value.endDate)) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Thời gian thuê không hợp lệ' });
    }
    if (value.pickupMethod === 'DELIVERY' && !value.deliveryAddress.trim()) {
      ctx.addIssue({ code: 'custom', path: ['deliveryAddress'], message: 'Vui lòng nhập địa chỉ giao máy' });
    }
  });

export const paymentFormSchema = z.object({
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'E_WALLET', 'OTHER']),
  status: z.enum(['PENDING', 'SUCCESS']),
  referenceCode: z.string(),
  note: z.string(),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

import type { DateTimeRange } from '@/components/shared/date-time-range-picker';
import * as z from 'zod';
import type {
  CollateralType,
  OrderLineDraft,
  PaymentKind,
  PaymentMethod,
  PickupMethod,
  RentalOrderEditableLine,
} from './type';

const pickupMethodValues = ['PICKUP_AT_STORE', 'DELIVERY'] as const satisfies readonly [
  PickupMethod,
  ...PickupMethod[],
];
const paymentMethodValues = ['CASH', 'BANK_TRANSFER', 'CARD', 'E_WALLET', 'OTHER'] as const satisfies readonly [
  PaymentMethod,
  ...PaymentMethod[],
];
const collateralTypeValues = [
  'NONE',
  'IDENTITY_CARD',
  'VEHICLE_OR_HIGH_VALUE',
] as const satisfies readonly [CollateralType, ...CollateralType[]];
const paymentRecordKindValues = [
  'BOOKING_HOLD',
  'DEPOSIT',
  'RENTAL_PAYMENT',
  'HANDOVER_PAYMENT',
  'ADDITIONAL_CHARGE',
  'OTHER',
] as const satisfies readonly [Exclude<PaymentKind, 'REFUND'>, ...Array<Exclude<PaymentKind, 'REFUND'>>];

const pickupMethodSchema = z.enum(pickupMethodValues);
const paymentMethodSchema = z.enum(paymentMethodValues);
const collateralTypeSchema = z.enum(collateralTypeValues);

export const dateTimeRangeSchema: z.ZodType<DateTimeRange> = z
  .object({
    from: z.union([z.date(), z.undefined()]),
    to: z.union([z.date(), z.undefined()]),
  })
  .refine(({ from, to }) => Boolean(from && to && from < to), {
    message: 'Vui lòng chọn thời gian thuê hợp lệ',
    path: ['to'],
  });

export const createRentalOrderItemSchema = z.object({
  productId: z.string().min(1),
  assetUnitId: z.string().min(1),
  note: z.string().optional(),
});

const rentalOrderEditableLineSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string(),
  sku: z.string(),
  assetUnitId: z.string().min(1),
  serialNumber: z.string(),
  dailyPrice: z.number(),
  halfDayPrice: z.number(),
  hourlyOveragePrice: z.number(),
  depositAmount: z.number(),
  rentalPriceTiers: z.array(
    z.object({
      id: z.string(),
      minDays: z.number(),
      maxDays: z.number().nullable(),
      dailyPrice: z.number(),
      name: z.string().nullable(),
    }),
  ),
  status: z.string().optional(),
  bookingHoldAmount: z.number().optional(),
  note: z.string().optional(),
  removed: z.boolean().optional(),
}) satisfies z.ZodType<RentalOrderEditableLine>;

export const rentalScheduleSchema = z
  .object({
    range: dateTimeRangeSchema,
    pickupMethod: pickupMethodSchema,
    deliveryFeeTotal: z.number().min(0, 'Phí giao không được âm'),
    deliveryAddress: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.pickupMethod === 'DELIVERY' && !values.deliveryAddress.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryAddress'],
        message: 'Vui lòng nhập địa chỉ giao thiết bị',
      });
    }
  });

export const rentalItemsSchema = z.object({
  items: z.array(createRentalOrderItemSchema).min(1, 'Vui lòng chọn ít nhất một sản phẩm thuê'),
});

export const rentalCustomerSchema = z.object({
  customerId: z.string().min(1, 'Vui lòng chọn khách hàng'),
});

export const rentalConfirmSchema = z.object({
  discountTotal: z.number().min(0, 'Giảm giá không được âm'),
  note: z.string(),
  internalNote: z.string(),
});

export const createRentalOrderSchema = z.object({
  ...rentalScheduleSchema.shape,
  ...rentalItemsSchema.shape,
  ...rentalCustomerSchema.shape,
  ...rentalConfirmSchema.shape,
});

export const rentalOrderCancelFormSchema = z
  .object({
    cancelReason: z.string().trim().min(1, 'Vui lòng nhập lý do hủy đơn'),
    cancelPaymentHandling: z.enum(['KEEP_PAID_AMOUNT_AS_PENALTY', 'REFUND_BOOKING_HOLD']),
    refundAmount: z.number().min(0, 'Số tiền hoàn không được âm'),
  })
  .superRefine((values, ctx) => {
    if (values.cancelPaymentHandling === 'REFUND_BOOKING_HOLD' && values.refundAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['refundAmount'],
        message: 'Vui lòng nhập số tiền hoàn lớn hơn 0',
      });
    }
  });

export const rentalOrderPaymentFormSchema = z.object({
  kind: z.enum(paymentRecordKindValues),
  method: paymentMethodSchema,
  amount: z.number().min(1, 'Vui lòng nhập số tiền lớn hơn 0'),
  referenceCode: z.string(),
  note: z.string(),
});

export const rentalOrderHandoverFormSchema = z
  .object({
    actualPickupDate: z.string().min(1, 'Vui lòng nhập giờ bàn giao'),
    collateralType: collateralTypeSchema,
    collateralDescription: z.string(),
    discountTotal: z.number().min(0, 'Giảm giá không được âm'),
    paymentAmount: z.number().min(0, 'Số tiền thu không được âm'),
    paymentMethod: paymentMethodSchema,
    referenceCode: z.string(),
    note: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.collateralType !== 'NONE' && !values.collateralDescription.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['collateralDescription'],
        message: 'Vui lòng nhập tài sản/giấy tờ thế chấp',
      });
    }
  });

export const rentalOrderCompleteFormSchema = z
  .object({
    actualReturnDate: z.string().min(1, 'Vui lòng nhập giờ trả máy'),
    damageFeeTotal: z.number().min(0, 'Phí hư hỏng không được âm'),
    lateFeePolicy: z.enum(['CHARGE', 'WAIVE', 'CUSTOM']),
    customLateFeeTotal: z.number().min(0, 'Phí trễ hạn tùy chỉnh không được âm'),
    lateFeeNote: z.string(),
    damageNote: z.string(),
    compensationFeeTotal: z.number().min(0, 'Phí bồi thường không được âm'),
    compensationNote: z.string(),
    settlementKind: z.enum(['NONE', 'REFUND', 'ADDITIONAL_CHARGE']),
    settlementMethod: paymentMethodSchema,
    settlementAmount: z.number().min(0, 'Số tiền quyết toán không được âm'),
    referenceCode: z.string(),
    note: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.settlementKind !== 'NONE' && values.settlementAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['settlementAmount'],
        message: 'Vui lòng nhập số tiền quyết toán lớn hơn 0',
      });
    }
    if (values.lateFeePolicy === 'CUSTOM' && values.customLateFeeTotal <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customLateFeeTotal'],
        message: 'Vui lòng nhập phí trễ hạn tùy chỉnh lớn hơn 0',
      });
    }
    if ((values.lateFeePolicy === 'WAIVE' || values.lateFeePolicy === 'CUSTOM') && !values.lateFeeNote.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lateFeeNote'],
        message: 'Vui lòng nhập lý do xử lý phí trễ hạn',
      });
    }
    if (values.compensationFeeTotal > 0 && !values.compensationNote.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['compensationNote'],
        message: 'Vui lòng nhập ghi chú bồi thường',
      });
    }
  });

export const rentalOrderRefundFormSchema = z.object({
  method: paymentMethodSchema,
  amount: z.number().min(1, 'Vui lòng nhập số tiền hoàn lớn hơn 0'),
  referenceCode: z.string(),
  note: z.string(),
});

export const rentalOrderUpdateFormSchema = z
  .object({
    customerSnapshot: z.object({
      name: z.string().trim().min(1, 'Vui lòng nhập tên khách hàng'),
      phone: z.string(),
      email: z.string(),
      address: z.string(),
      identityNumber: z.string(),
      socialContact: z.string(),
    }),
    range: dateTimeRangeSchema,
    pickupMethod: pickupMethodSchema,
    deliveryAddress: z.string(),
    deliveryFeeTotal: z.number().min(0, 'Phí giao không được âm'),
    discountTotal: z.number().min(0, 'Giảm giá không được âm'),
    note: z.string(),
    internalNote: z.string(),
    items: z.array(rentalOrderEditableLineSchema),
  })
  .superRefine((values, ctx) => {
    if (values.pickupMethod === 'DELIVERY' && !values.deliveryAddress.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryAddress'],
        message: 'Vui lòng nhập địa chỉ giao thiết bị',
      });
    }

    if (!values.items.some((item) => !item.removed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['items'],
        message: 'Vui lòng chọn ít nhất một thiết bị thuê',
      });
    }
  });

export type RentalOrderCancelFormValues = z.infer<typeof rentalOrderCancelFormSchema>;
export type ICreateRentalOrderInput = Omit<z.infer<typeof createRentalOrderSchema>, 'items'> & {
  items: OrderLineDraft[];
};
export type RentalOrderPaymentFormValues = z.infer<typeof rentalOrderPaymentFormSchema>;
export type RentalOrderHandoverFormValues = z.infer<typeof rentalOrderHandoverFormSchema>;
export type RentalOrderCompleteFormValues = z.infer<typeof rentalOrderCompleteFormSchema>;
export type RentalOrderRefundFormValues = z.infer<typeof rentalOrderRefundFormSchema>;
export type RentalOrderUpdateFormValues = z.infer<typeof rentalOrderUpdateFormSchema>;

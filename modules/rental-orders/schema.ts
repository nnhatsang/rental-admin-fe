import * as z from 'zod';
import type { DateTimeRange } from '@/components/shared/date-time-range-picker';
import type { CollateralType, OrderLineDraft, PaymentKind, PaymentMethod, PickupMethod } from './type';

const pickupMethodValues = ['PICKUP_AT_STORE', 'DELIVERY'] as const satisfies readonly [
  PickupMethod,
  ...PickupMethod[],
];
const paymentMethodValues = ['CASH', 'BANK_TRANSFER', 'CARD', 'E_WALLET', 'OTHER'] as const satisfies readonly [
  PaymentMethod,
  ...PaymentMethod[],
];
const collateralTypeValues = ['NONE', 'IDENTITY_CARD', 'VEHICLE_OR_HIGH_VALUE', 'OTHER_ASSET'] as const satisfies readonly [
  CollateralType,
  ...CollateralType[],
];
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

const dateTimeRangeSchema: z.ZodType<DateTimeRange> = z
  .object({
    from: z.date().optional().or(z.undefined()),
    to: z.date().optional().or(z.undefined()),
  })
  .transform((range) => ({
    from: range.from,
    to: range.to,
  }))
  .refine((range) => Boolean(range.from && range.to && range.from < range.to), {
    message: 'Vui lòng chọn thời gian thuê hợp lệ',
  });

const createRentalOrderItemSchema = z
  .object({
    productId: z.string().min(1),
    assetUnitId: z.string().min(1),
    note: z.string().optional(),
  })
  .passthrough();

export const createRentalOrderSchema = z
  .object({
    customerId: z.string().min(1, 'Vui lòng chọn khách hàng'),
    items: z.array(createRentalOrderItemSchema).min(1, 'Vui lòng chọn ít nhất một sản phẩm thuê'),
    range: dateTimeRangeSchema,
    pickupMethod: pickupMethodSchema,
    deliveryAddress: z.string(),
    deliveryFeeTotal: z.number().min(0, 'Phí giao không được âm'),
    discountTotal: z.number().min(0, 'Giảm giá không được âm'),
    note: z.string(),
    internalNote: z.string(),
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
    damageNote: z.string(),
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

export type RentalOrderCancelFormValues = z.infer<typeof rentalOrderCancelFormSchema>;
export type ICreateRentalOrderInput = Omit<z.infer<typeof createRentalOrderSchema>, 'items'> & {
  items: OrderLineDraft[];
};
export type RentalOrderPaymentFormValues = z.infer<typeof rentalOrderPaymentFormSchema>;
export type RentalOrderHandoverFormValues = z.infer<typeof rentalOrderHandoverFormSchema>;
export type RentalOrderCompleteFormValues = z.infer<typeof rentalOrderCompleteFormSchema>;
export type RentalOrderRefundFormValues = z.infer<typeof rentalOrderRefundFormSchema>;
export type RentalOrderUpdateFormValues = z.infer<typeof rentalOrderUpdateFormSchema>;

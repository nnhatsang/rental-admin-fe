import { z } from 'zod';

export const createCustomerQuickSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên khách hàng'),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('Email không hợp lệ').optional().or(z.literal('')),
  address: z.string().trim().optional(),
  identityNumber: z.string().trim().optional(),
  socialContact: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const rentalOrderLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  assetUnitIds: z.array(z.string()).default([]),
  note: z.string().optional(),
});

export const createRentalOrderDraftSchema = z.object({
  customerId: z.string().min(1, 'Vui lòng chọn khách hàng'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày nhận'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày trả'),
  pickupMethod: z.enum(['PICKUP_AT_STORE', 'DELIVERY']),
  deliveryAddress: z.string(),
  deliveryFeeTotal: z.number().min(0).default(0),
  discountTotal: z.number().min(0).default(0),
  note: z.string().optional(),
  internalNote: z.string().optional(),
  lines: z.array(rentalOrderLineSchema).min(1, 'Vui lòng chọn ít nhất một sản phẩm'),
});

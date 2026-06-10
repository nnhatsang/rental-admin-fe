import * as z from 'zod';

export const productRentalPriceTierSchema = z.object({
  minDays: z.number().min(1, { message: 'Số ngày tối thiểu phải lớn hơn 0' }),
  maxDays: z.number().min(1, { message: 'Số ngày tối đa phải lớn hơn 0' }).optional(),
  dailyPrice: z.number().min(0, { message: 'Giá thuê theo ngày không được âm' }),
  name: z.string().optional(),
  sortOrder: z.number().min(0, { message: 'Thứ tự không được âm' }).optional(),
});
export type IProductRentalPriceTierInput = z.infer<typeof productRentalPriceTierSchema>;

export const createProductSchema = z.object({
  name: z.string().min(1, { message: 'Vui lòng nhập tên sản phẩm' }),
  sku: z.string().min(1, { message: 'Vui lòng nhập SKU' }),
  description: z.string().optional(),
  includedAccessories: z.string().optional(),
  usageGuide: z.string().optional(),
  categoryId: z.string().uuid({ message: 'Danh mục không hợp lệ' }).optional(),
  brandId: z.string().uuid({ message: 'Thương hiệu không hợp lệ' }).optional(),
  dailyPrice: z.number().min(0, { message: 'Giá thuê theo ngày không được âm' }),
  halfDayPrice: z.number().min(0, { message: 'Giá thuê nửa ngày không được âm' }).optional(),
  hourlyOveragePrice: z.number().min(0, { message: 'Phí quá giờ không được âm' }).optional(),
  rentalPriceTiers: z.array(productRentalPriceTierSchema).max(20).optional(),
  depositAmount: z.number().min(0, { message: 'Tiền cọc không được âm' }),
  replacementValue: z.number().min(0, { message: 'Giá trị thay thế không được âm' }).optional(),
  isActive: z.boolean().optional(),
});
export type ICreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type IUpdateProductInput = z.infer<typeof updateProductSchema>;

export const updateProductStatusSchema = z.object({
  isActive: z.boolean(),
});
export type IUpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;

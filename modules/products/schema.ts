import * as z from 'zod';

const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const emptyStringToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);

const positiveNumber = z.coerce.number().positive({ message: 'Giá trị phải lớn hơn 0' });
const optionalNumber = z.preprocess(emptyStringToUndefined, z.coerce.number().optional());
const optionalNonNegativeNumber = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().min(0, { message: 'Gia tri phai lon hon hoac bang 0' }).optional(),
);
const optionalString = z.preprocess(emptyStringToUndefined, z.string().optional());
const optionalUuidV7 = z.preprocess(
  emptyStringToUndefined,
  z.string().regex(UUID_V7_REGEX, { message: 'UUID khong hop le' }).optional(),
);

export const productRentalPriceTierSchema = z
  .object({
    minDays: z.coerce.number().min(1, { message: 'Số ngày tối thiểu phải lớn hơn 0' }),
    maxDays: optionalNumber,
    dailyPrice: positiveNumber,
    name: optionalString,
    sortOrder: optionalNonNegativeNumber,
  })
  .refine((value) => value.maxDays === undefined || value.maxDays >= value.minDays, {
    message: 'Số ngày tối đâ phải lớn hơn hoặc bằng số ngày tối thiểu',
    path: ['maxDays'],
  });

export const productFormSchema = z.object({
  name: z.string().min(1, { message: 'Vui lòng nhập tên sản phẩm' }),
  sku: z.string().min(1, { message: 'Vui lòng nhập mã SKU' }),
  description: optionalString,
  includedAccessories: optionalString,
  usageGuide: optionalString,
  // categoryId: optionalUuidV7,
  // brandId: optionalUuidV7,
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  dailyPrice: positiveNumber,
  halfDayPrice: positiveNumber,
  hourlyOveragePrice: positiveNumber,
  depositAmount: positiveNumber,
  replacementValue: positiveNumber,
  isActive: z.boolean().optional(),
  rentalPriceTiers: z.array(productRentalPriceTierSchema).max(20).optional(),
});

export type IProductFormInput = z.output<typeof productFormSchema>;
export type IProductFormOutput = z.output<typeof productFormSchema>;

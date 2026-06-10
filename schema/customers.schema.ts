import { CUSTOMER_STATUSES } from '@/utils/consts/resource-status.const';
import * as z from 'zod';

const phoneRegex = /^(?:\+84|0)(3[2-9]|5[689]|7[06789]|8[1-9]|9\d|2\d{1,2})\d{7}$/;
const customerStatusSchema = z.enum(CUSTOMER_STATUSES as [string, ...string[]]);

export const createCustomerSchema = z.object({
  name: z.string().min(1, { message: 'Vui lòng nhập tên khách hàng' }),
  phone: z.string().regex(phoneRegex, { message: 'Số điện thoại không hợp lệ' }).optional(),
  email: z.string().email({ message: 'Định dạng email không hợp lệ' }).optional(),
  address: z.string().optional(),
  identityNumber: z.string().optional(),
  socialContact: z.string().optional(),
  notes: z.string().optional(),
});
export type ICreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();
export type IUpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const updateCustomerStatusSchema = z.object({
  status: customerStatusSchema,
});
export type IUpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;

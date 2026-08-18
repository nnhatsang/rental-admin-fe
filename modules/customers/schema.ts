import * as z from 'zod';
import { CustomerStatus } from './type';

const phoneRegex = /^(?:\+84|0)(3[2-9]|5[689]|7[06789]|8[1-9]|9\d|2\d{1,2})\d{7}$/;

export const customerStatusSchema = z.enum(Object.values(CustomerStatus) as [CustomerStatus, ...CustomerStatus[]]);

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Vui lòng nhập tên khách hàng' }),
  phone: z
    .string()
    .trim()
    .min(1, { message: 'Vui lòng nhập số điện thoại' })
    .regex(phoneRegex, { message: 'Số điện thoại không hợp lệ' }),
  email: z.string().trim().min(1, { message: 'Vui lòng nhập email' }).email({ message: 'Email không hợp lệ' }),
  address: z.string().trim().min(1, { message: 'Vui lòng nhập địa chỉ' }),
  identityNumber: z.string().trim().min(1, { message: 'Vui lòng nhập CCCD/CMND' }),
  socialContact: z.string().trim().min(1, { message: 'Vui lòng nhập liên hệ mạng xã hội' }),
  notes: z.string().trim().optional(),
});

export type ICustomerFormInput = z.infer<typeof customerFormSchema>;

export const updateCustomerStatusSchema = z.object({
  status: customerStatusSchema,
});

export type IUpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;

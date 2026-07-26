import * as z from 'zod';
import { AssetCondition, AssetStatus } from './type';

const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const emptyStringToUndefined = (value: unknown) => (value === '' || value === null ? undefined : value);
const optionalString = z.preprocess(emptyStringToUndefined, z.string().optional());

export const assetUnitFormSchema = z.object({
  productId: z.string().regex(UUID_V7_REGEX, { message: 'UUID sản phẩm không hợp lệ' }),
  serialNumber: z.string().trim().min(1, 'Vui lòng nhập serial number'),
  status: z.enum(AssetStatus),
  condition: z.enum(AssetCondition),
  note: optionalString,
  isActive: z.boolean().optional(),
});

export const assetUnitStatusSchema = z.object({
  status: z.enum(AssetStatus),
  condition: z.enum(AssetCondition),
  isActive: z.boolean().optional(),
});

export type IAssetUnitFormInput = z.output<typeof assetUnitFormSchema>;
export type IAssetUnitStatusInput = z.output<typeof assetUnitStatusSchema>;

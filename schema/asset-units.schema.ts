import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/utils/consts/resource-status.const';
import * as z from 'zod';

const assetStatusSchema = z.enum(ASSET_STATUSES as [string, ...string[]]);
const assetConditionSchema = z.enum(ASSET_CONDITIONS as [string, ...string[]]);

export const createAssetUnitSchema = z.object({
  productId: z.string().uuid({ message: 'Sản phẩm không hợp lệ' }),
  serialNumber: z.string().optional(),
  status: assetStatusSchema.optional(),
  condition: assetConditionSchema.optional(),
  note: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type ICreateAssetUnitInput = z.infer<typeof createAssetUnitSchema>;

export const updateAssetUnitSchema = createAssetUnitSchema.partial();
export type IUpdateAssetUnitInput = z.infer<typeof updateAssetUnitSchema>;

export const updateAssetUnitStatusSchema = z.object({
  status: assetStatusSchema,
  condition: assetConditionSchema,
  isActive: z.boolean().optional(),
});
export type IUpdateAssetUnitStatusInput = z.infer<typeof updateAssetUnitStatusSchema>;

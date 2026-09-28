import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconSparkles,
  IconTool,
} from '@tabler/icons-react';

import { toOptions, type DisplayConfig } from '@/types/display-config';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { AssetCondition, AssetStatus } from './type';

const text = TITLE_PAGE.ASSET_UNITS;

export const assetStatusConfig = {
  [AssetStatus.AVAILABLE]: {
    label: text.TABLE.STATUS_AVAILABLE,
    icon: IconCircleCheck,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400',
  },
  [AssetStatus.MAINTENANCE]: {
    label: text.TABLE.STATUS_MAINTENANCE,
    icon: IconTool,
    className: 'border-transparent bg-orange-500/10 text-orange-600 hover:bg-orange-500/15 dark:text-orange-400',
  },
  [AssetStatus.LOST]: {
    label: text.TABLE.STATUS_LOST,
    icon: IconCircleX,
    className: 'border-transparent bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-400',
  },
} satisfies Record<AssetStatus, DisplayConfig>;

export const assetConditionConfig = {
  [AssetCondition.NEW]: {
    label: text.TABLE.CONDITION_NEW,
    icon: IconSparkles,
    className: 'border-transparent bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 dark:text-blue-400',
  },
  [AssetCondition.GOOD]: {
    label: text.TABLE.CONDITION_GOOD,
    icon: IconCircleCheck,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400',
  },
  [AssetCondition.FAIR]: {
    label: text.TABLE.CONDITION_FAIR,
    icon: IconAlertCircle,
    className: 'border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 dark:text-amber-400',
  },
  [AssetCondition.DAMAGED]: {
    label: text.TABLE.CONDITION_DAMAGED,
    icon: IconAlertTriangle,
    className: 'border-transparent bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-400',
  },
} satisfies Record<AssetCondition, DisplayConfig>;

export const assetActiveConfig = {
  true: {
    label: text.TABLE.ACTIVE,
    icon: IconCircleCheck,
    className: 'border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400',
  },
  false: {
    label: text.TABLE.INACTIVE,
    icon: IconCircleX,
    className: 'border-transparent bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/15 dark:text-zinc-400',
  },
} satisfies Record<'true' | 'false', DisplayConfig>;

export const assetStatusOptions = toOptions(assetStatusConfig);
export const assetConditionOptions = toOptions(assetConditionConfig);
export const assetActiveOptions = toOptions(assetActiveConfig);
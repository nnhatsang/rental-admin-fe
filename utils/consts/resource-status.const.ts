export const UserActivityStatus = {
  Active: 'ACTIVE',
  Banned: 'BANNED',
  Locked: 'LOCKED',
  Inactive: 'INACTIVE',
} as const;

export type UserActivityStatus = (typeof UserActivityStatus)[keyof typeof UserActivityStatus];

export const CustomerStatus = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
  Blocked: 'BLOCKED',
} as const;

export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus];

export const AssetStatus = {
  Available: 'AVAILABLE',
  Reserved: 'RESERVED',
  Rented: 'RENTED',
  Maintenance: 'MAINTENANCE',
  Retired: 'RETIRED',
  Lost: 'LOST',
} as const;

export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];

export const AssetCondition = {
  New: 'NEW',
  Good: 'GOOD',
  Fair: 'FAIR',
  Damaged: 'DAMAGED',
  Lost: 'LOST',
} as const;

export type AssetCondition = (typeof AssetCondition)[keyof typeof AssetCondition];

export const USER_ACTIVITY_STATUSES = Object.values(UserActivityStatus);
export const CUSTOMER_STATUSES = Object.values(CustomerStatus);
export const ASSET_STATUSES = Object.values(AssetStatus);
export const ASSET_CONDITIONS = Object.values(AssetCondition);

export const sourceLabel = {
  ADMIN: 'Admin',
  WEBSITE: 'Website',
} as const;

export const paymentMethods = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
  { value: 'CARD', label: 'Thẻ' },
  { value: 'E_WALLET', label: 'Ví điện tử' },
  { value: 'OTHER', label: 'Khác' },
] as const;

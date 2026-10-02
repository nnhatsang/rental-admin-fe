export interface ISystemSettingsOut {
  id: number;
  bookingHoldPricePerUnit: string;
  bookingBufferTimeMinutes: number;
  maxRentalTimeDays: number;
  maxLateReturnTimeHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateSystemSettingsReq {
  bookingHoldPricePerUnit?: number;
  bookingBufferTimeMinutes?: number;
  maxRentalTimeDays?: number;
  maxLateReturnTimeHours?: number;
}

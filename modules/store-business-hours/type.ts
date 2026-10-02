export interface IStoreBussinessHoursOut {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateStoreBussinessHourItem {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface IUpdateStoreBussinessHoursReq {
  items: IUpdateStoreBussinessHourItem[];
}

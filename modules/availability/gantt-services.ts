import { apiAuth } from '@/axios';
import type { DefaultResponse } from '@/types/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { IAvailabilityGanttData, IGetAvailabilityGanttParams } from './gantt-type';

export const requestGetAvailabilityGantt = (
  params: IGetAvailabilityGanttParams,
): Promise<AxiosResponse<DefaultResponse<IAvailabilityGanttData>>> =>
  apiAuth({ method: 'GET', url: '/availability/gantt', params } satisfies AxiosRequestConfig);

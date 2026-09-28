import type { IGetAvailabilityGanttParams } from '../gantt-type';

export const availabilityGanttQueryKeys = {
  all: ['rental-availability-gantt'] as const,
  list: (params: Omit<IGetAvailabilityGanttParams, 'cursor'>) => [...availabilityGanttQueryKeys.all, params] as const,
};
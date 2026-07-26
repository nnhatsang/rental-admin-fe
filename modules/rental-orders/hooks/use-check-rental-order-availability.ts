import { useMutation } from '@tanstack/react-query';
import { requestCheckRentalOrderAvailability } from '../services';
import type { ICheckRentalOrderAvailabilityReq } from '../type';

export const useCheckRentalOrderAvailability = () =>
  useMutation({
    mutationFn: async (data: ICheckRentalOrderAvailabilityReq) =>
      (await requestCheckRentalOrderAvailability(data)).data.data,
  });

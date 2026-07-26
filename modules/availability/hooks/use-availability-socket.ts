'use client';

import { socketManager } from '@/hooks/use-socket';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
import { ESocketEmit } from '@/utils/consts/socket.const';
import { availabilityQueryKeys } from './keys';

export const useAvailabilitySocket = (onChanged: () => void) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleChanged = () => {
      void queryClient.invalidateQueries({ queryKey: availabilityQueryKeys.all });
      onChanged();
      toast.info(SUCCESS_MESSAGES.AVAILABILITY.UPDATED);
    };
    socketManager.on(ESocketEmit.AVAILABILITY_CHANGED, handleChanged);
    return () => socketManager.off(ESocketEmit.AVAILABILITY_CHANGED, handleChanged);
  }, [onChanged, queryClient]);
};

'use client';

import { RentalOrdersProvider } from '@/modules/rental-orders/rental-orders-provider';
import { AvailabilityGantt } from './components/availability-gantt';

export default function Availability() {
  return (
    <RentalOrdersProvider>
      <AvailabilityGantt />
    </RentalOrdersProvider>
  );
}